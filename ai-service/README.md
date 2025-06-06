# 🤖 AXON AI Detection Service

A FastAPI microservice for real-time object detection using YOLOv8, designed to integrate with the AXON RTSP streaming platform.

## 🚀 Quick Start

### 1. Setup the Service
```bash
cd ai-service
./setup.sh
```

### 2. Start the Service
```bash
./start.sh
```

The AI service will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

## 🎯 Features

- **YOLOv8 Object Detection**: State-of-the-art real-time object detection
- **80+ Object Classes**: Detects people, vehicles, animals, and everyday objects
- **Multiple Output Formats**: JSON results or annotated images
- **Filtered Detection**: Detect only specific object classes
- **CORS Enabled**: Ready for web frontend integration
- **Auto Model Download**: YOLOv8 model downloads automatically on first run

## 📡 API Endpoints

### Health Check
```http
GET /
```
Returns service status and model loading state.

### Object Detection
```http
POST /detect
Content-Type: multipart/form-data
```
Upload an image and get JSON detection results.

**Example Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class": "person",
      "confidence": 0.89,
      "bbox": {
        "x1": 100,
        "y1": 150,
        "x2": 300,
        "y2": 400
      }
    }
  ],
  "count": 1
}
```

### Annotated Detection
```http
POST /detect-annotated
Content-Type: multipart/form-data
```
Upload an image and get back the image with bounding boxes drawn.

### Specific Object Detection
```http
POST /detect-specific?target_classes=person,car,truck
Content-Type: multipart/form-data
```
Detect only specific object classes.

## 🔗 Integration with AXON

The AI service integrates seamlessly with your existing AXON platform:

### Node.js API Endpoints
- `GET /api/rtsp/ai/status` - Check AI service availability
- `GET /api/rtsp/ai/capabilities` - Get AI service features
- `POST /api/rtsp/ai/analyze-frame` - Analyze RTSP frames

### Example Integration
```javascript
// Check if AI service is ready
const response = await fetch('http://localhost:3001/api/rtsp/ai/status');
const status = await response.json();

if (status.ai_service === 'ready') {
  // Analyze an image
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const detection = await fetch('http://localhost:8000/detect', {
    method: 'POST',
    body: formData
  });
  
  const results = await detection.json();
  console.log('Detected objects:', results.detections);
}
```

## 🎮 Testing with cURL

```bash
# Health check
curl http://localhost:8000/

# Detect objects in an image
curl -X POST "http://localhost:8000/detect" \
  -F "file=@your-image.jpg"

# Get annotated image
curl -X POST "http://localhost:8000/detect-annotated" \
  -F "file=@your-image.jpg" \
  --output annotated-result.jpg

# Detect only people and cars
curl -X POST "http://localhost:8000/detect-specific?target_classes=person,car" \
  -F "file=@your-image.jpg"
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AXON Web UI   │───▶│   Node.js API   │───▶│   Python AI     │
│   (React)       │    │   (Express)     │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────▶│   RTSP Stream   │    │   YOLOv8 Model  │
                        │  (WebSocket)    │    │   (PyTorch)     │
                        └─────────────────┘    └─────────────────┘
```

## 🎛️ Configuration

### Environment Variables
Create a `.env` file in the `ai-service` directory:
```env
# Model configuration
YOLO_MODEL=yolov8n.pt  # or yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.5

# Service configuration
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
```

### Model Options
- `yolov8n.pt`: Nano (fastest, lowest accuracy)
- `yolov8s.pt`: Small (balanced)
- `yolov8m.pt`: Medium (higher accuracy)
- `yolov8l.pt`: Large (high accuracy)
- `yolov8x.pt`: Extra Large (highest accuracy, slowest)

## 🔍 Supported Object Classes

The YOLOv8 model can detect 80 different object classes:

**People & Animals**: person, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe

**Vehicles**: bicycle, car, motorcycle, airplane, bus, train, truck, boat

**Everyday Objects**: bottle, wine glass, cup, fork, knife, spoon, bowl, banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake

**Electronics**: tv, laptop, mouse, remote, keyboard, cell phone

**And many more!**

## 🚀 Running with Your RTSP Stream

1. **Start your AXON platform**: `yarn dev:all`
2. **Start the AI service**: `cd ai-service && ./start.sh`
3. **Navigate to**: http://localhost:3000/test
4. **Check AI status**: Visit http://localhost:3001/api/rtsp/ai/status

## 🛠️ Development

### Manual Setup
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Add Custom Detection Logic
Edit `main.py` to add custom detection logic, confidence thresholds, or post-processing.

## 📊 Performance

- **YOLOv8n**: ~45 FPS on CPU, ~100+ FPS on GPU
- **Memory Usage**: ~500MB for nano model
- **Startup Time**: ~3-5 seconds (model download on first run)

## 🔧 Troubleshooting

### Common Issues

**AI Service Not Starting**
```bash
# Check Python version (3.8+ required)
python3 --version

# Install missing dependencies
cd ai-service
pip install -r requirements.txt
```

**Model Download Issues**
```bash
# Manual model download
cd ai-service
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

**Permission Issues**
```bash
chmod +x ai-service/*.sh
```

### Logs
AI service logs are displayed in the terminal. For debugging:
```python
# In main.py, increase log level
logging.basicConfig(level=logging.DEBUG)
```

## 🎉 Next Steps

1. **Real-time Processing**: Integrate frame capture from RTSP stream
2. **Custom Models**: Train YOLOv8 on your specific use case
3. **Alerts**: Set up notifications for specific object detections
4. **Performance**: Add GPU support for faster processing
5. **Storage**: Save detection results to database

---

**Happy Detecting! 🎯** 