from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
from ultralytics import YOLO
import io
from PIL import Image
import json
import logging
import asyncio
import base64
from typing import Optional
import threading
import time
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AXON AI Detection Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None

# Video stream processing
class RTSPProcessor:
    def __init__(self):
        self.is_processing = False
        self.rtsp_url = 'rtsp://axon-dev:supersecretsecret@192.168.1.131:554/stream1'
        self.clients = set()
        self.frame_thread = None
        
    def start_processing(self):
        if self.is_processing:
            return False
        
        self.is_processing = True
        self.frame_thread = threading.Thread(target=self._process_stream)
        self.frame_thread.start()
        return True
    
    def stop_processing(self):
        self.is_processing = False
        if self.frame_thread:
            self.frame_thread.join()
        self.clients.clear()
    
    def add_client(self, websocket):
        self.clients.add(websocket)
    
    def remove_client(self, websocket):
        self.clients.discard(websocket)
    
    def _process_stream(self):
        cap = cv2.VideoCapture(self.rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize latency
        
        if not cap.isOpened():
            logger.error("Failed to open RTSP stream")
            return
        
        logger.info("🎥 Started processing RTSP stream with AI detection")
        
        frame_count = 0
        while self.is_processing:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Failed to read frame from RTSP stream")
                time.sleep(0.1)
                continue
            
            # Process every 3rd frame to maintain performance
            frame_count += 1
            if frame_count % 3 != 0:
                continue
                
            try:
                # Run YOLO detection
                if model is not None:
                    results = model(frame, verbose=False)
                    
                    # Draw annotations
                    annotated_frame = frame.copy()
                    detection_count = 0
                    
                    for r in results:
                        boxes = r.boxes
                        if boxes is not None:
                            for box in boxes:
                                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                                confidence = box.conf[0].cpu().numpy()
                                class_id = int(box.cls[0].cpu().numpy())
                                class_name = model.names[class_id]
                                
                                # Only show detections with confidence > 0.5
                                if confidence > 0.5:
                                    detection_count += 1
                                    
                                    # Draw bounding box
                                    cv2.rectangle(annotated_frame, (int(x1), int(y1)), 
                                                (int(x2), int(y2)), (0, 255, 0), 2)
                                    
                                    # Draw label with background
                                    label = f"{class_name}: {confidence:.2f}"
                                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                                    cv2.rectangle(annotated_frame, (int(x1), int(y1-25)), 
                                                (int(x1) + label_size[0], int(y1)), (0, 255, 0), -1)
                                    cv2.putText(annotated_frame, label, (int(x1), int(y1-5)), 
                                              cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
                    
                    # Add AI status overlay
                    status_text = f"🤖 AI ACTIVE | Objects: {detection_count}"
                    cv2.rectangle(annotated_frame, (10, 10), (350, 50), (0, 0, 0), -1)
                    cv2.putText(annotated_frame, status_text, (15, 35), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                else:
                    annotated_frame = frame
                    # Add "AI Loading" overlay
                    cv2.rectangle(annotated_frame, (10, 10), (250, 50), (0, 0, 255), -1)
                    cv2.putText(annotated_frame, "🤖 AI LOADING...", (15, 35), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', annotated_frame, 
                                       [cv2.IMWRITE_JPEG_QUALITY, 85])
                
                # Send to all connected clients
                if self.clients:
                    frame_data = base64.b64encode(buffer).decode('utf-8')
                    message = json.dumps({
                        "type": "frame",
                        "data": frame_data,
                        "timestamp": time.time()
                    })
                    
                    # Helper function to send message to a client
                    async def send_message_to_client(client, msg):
                        try:
                            await client.send_text(msg)
                            return True
                        except:
                            return False
                    
                    # Send to all connected clients and remove disconnected ones
                    disconnected = set()
                    for client in self.clients.copy():
                        try:
                            # Use asyncio.run to properly handle the async send
                            success = asyncio.run(send_message_to_client(client, message))
                            if not success:
                                disconnected.add(client)
                        except Exception as e:
                            disconnected.add(client)
                    
                    for client in disconnected:
                        self.clients.discard(client)
                
            except Exception as e:
                logger.error(f"Error processing frame: {e}")
            
            # Small delay to control frame rate
            time.sleep(0.033)  # ~30 FPS
        
        cap.release()
        logger.info("🛑 Stopped processing RTSP stream")

# Global processor instance
rtsp_processor = RTSPProcessor()

def load_model():
    """Load YOLOv8 model on startup"""
    global model
    try:
        logger.info("Loading YOLOv8 model...")
        
        # Handle PyTorch 2.6+ compatibility
        # Since YOLOv8 models are from a trusted source (Ultralytics), we can safely use weights_only=False
        try:
            # First, try to monkey patch torch.load to use weights_only=False for YOLO model loading
            original_torch_load = torch.load
            
            def safe_torch_load(*args, **kwargs):
                # For YOLO model loading, use weights_only=False since these are trusted models
                kwargs['weights_only'] = False
                return original_torch_load(*args, **kwargs)
            
            # Temporarily replace torch.load
            torch.load = safe_torch_load
            
            # Load the YOLO model (this will use our patched torch.load)
            model = YOLO('yolov8n.pt')  # nano version for speed
            
            # Restore original torch.load
            torch.load = original_torch_load
            
            logger.info("Model loaded successfully with PyTorch 2.6 compatibility!")
            return True
            
        except Exception as e:
            # Restore original torch.load in case of error
            torch.load = original_torch_load
            logger.error(f"Failed to load model with compatibility patch: {e}")
            
            # Fallback: try loading normally (for older PyTorch versions)
            try:
                model = YOLO('yolov8n.pt')
                logger.info("Model loaded successfully with standard approach!")
                return True
            except Exception as e2:
                logger.error(f"Fallback loading also failed: {e2}")
                return False
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize the model when the service starts"""
    success = load_model()
    if not success:
        logger.error("Failed to initialize AI service")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up when shutting down"""
    rtsp_processor.stop_processing()

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "AXON AI Detection Service",
        "model_loaded": model is not None,
        "stream_processing": rtsp_processor.is_processing,
        "connected_clients": len(rtsp_processor.clients)
    }

# Real-time video stream processing endpoints

@app.post("/stream/start")
async def start_ai_stream():
    """Start AI-enhanced RTSP stream processing"""
    if rtsp_processor.start_processing():
        return {
            "success": True,
            "message": "AI stream processing started",
            "websocket_url": "ws://localhost:8000/stream/ws"
        }
    else:
        return {
            "success": False,
            "message": "AI stream processing already running"
        }

@app.post("/stream/stop")
async def stop_ai_stream():
    """Stop AI-enhanced RTSP stream processing"""
    rtsp_processor.stop_processing()
    return {
        "success": True,
        "message": "AI stream processing stopped"
    }

@app.get("/stream/status")
async def get_stream_status():
    """Get AI stream status"""
    return {
        "processing": rtsp_processor.is_processing,
        "clients": len(rtsp_processor.clients),
        "model_loaded": model is not None
    }

@app.websocket("/stream/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for AI-enhanced video stream"""
    await websocket.accept()
    rtsp_processor.add_client(websocket)
    
    try:
        logger.info("🔗 Client connected to AI stream")
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Connected to AI-enhanced stream"
        }))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
            
    except Exception as e:
        logger.info(f"📤 Client disconnected: {e}")
    finally:
        rtsp_processor.remove_client(websocket)

# Original detection endpoints (keeping existing functionality)

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    Detect objects in an uploaded image
    Returns JSON with detection results
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read image file
        image_data = await file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run inference
        results = model(image)
        
        # Extract detection data
        detections = []
        for r in results:
            boxes = r.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates and confidence
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": float(confidence),
                        "bbox": {
                            "x1": float(x1),
                            "y1": float(y1),
                            "x2": float(x2),
                            "y2": float(y2)
                        }
                    })
        
        return {
            "success": True,
            "detections": detections,
            "count": len(detections)
        }
        
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/detect-annotated")
async def detect_and_annotate(file: UploadFile = File(...)):
    """
    Detect objects and return annotated image
    Returns image with bounding boxes drawn
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read image file
        image_data = await file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run inference
        results = model(image)
        
        # Draw annotations
        annotated_image = image.copy()
        for r in results:
            boxes = r.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates and confidence
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    # Draw bounding box
                    cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    
                    # Draw label
                    label = f"{class_name}: {confidence:.2f}"
                    cv2.putText(annotated_image, label, (int(x1), int(y1-10)), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Convert back to image format
        _, buffer = cv2.imencode('.jpg', annotated_image)
        io_buffer = io.BytesIO(buffer)
        
        return StreamingResponse(io_buffer, media_type="image/jpeg")
        
    except Exception as e:
        logger.error(f"Annotation error: {e}")
        raise HTTPException(status_code=500, detail=f"Annotation failed: {str(e)}")

@app.post("/detect-specific")
async def detect_specific_objects(file: UploadFile = File(...), target_classes: str = "person,car,truck"):
    """
    Detect only specific object classes
    target_classes: comma-separated list of class names to detect
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Parse target classes
        target_list = [cls.strip().lower() for cls in target_classes.split(',')]
        
        # Read image file
        image_data = await file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run inference
        results = model(image)
        
        # Filter detections
        filtered_detections = []
        for r in results:
            boxes = r.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id].lower()
                    
                    # Only include if in target classes
                    if class_name in target_list:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        
                        filtered_detections.append({
                            "class": class_name,
                            "confidence": float(confidence),
                            "bbox": {
                                "x1": float(x1),
                                "y1": float(y1),
                                "x2": float(x2),
                                "y2": float(y2)
                            }
                        })
        
        return {
            "success": True,
            "target_classes": target_list,
            "detections": filtered_detections,
            "count": len(filtered_detections)
        }
        
    except Exception as e:
        logger.error(f"Specific detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 