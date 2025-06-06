# 🤖 AI Detection Service Setup

## Quick Setup (2 minutes)

1. **Setup the AI service**:
   ```bash
   cd ai-service
   ./setup.sh
   ```

2. **Start the AI service** (in a new terminal):
   ```bash
   cd ai-service
   ./start.sh
   ```

3. **Start your AXON platform** (in another terminal):
   ```bash
   yarn dev:all
   ```

4. **Test the integration**:
   - Go to http://localhost:3000/test (RTSP stream)
   - Check AI status: http://localhost:3001/api/rtsp/ai/status
   - AI API docs: http://localhost:8000/docs

## What You Get

- **Real-time object detection** using YOLOv8
- **80+ object classes** (people, cars, animals, etc.)
- **REST API endpoints** for image analysis
- **Seamless integration** with your existing RTSP stream
- **Web UI ready** - perfect for adding AI overlays

## Architecture

```
AXON Platform (Node.js) ←→ AI Service (Python)
     ↓                           ↓
RTSP Stream (port 9999)     YOLOv8 Model (port 8000)
```

## Example Usage

```javascript
// Check if someone is in the camera view
const response = await fetch('http://localhost:8000/detect-specific?target_classes=person', {
  method: 'POST',
  body: formData // your image
});

const result = await response.json();
if (result.count > 0) {
  console.log(`Detected ${result.count} people!`);
}
```

## Next Steps

1. **Frontend Integration**: Add AI analysis to your React components
2. **Real-time Alerts**: Trigger notifications when objects are detected
3. **Custom Training**: Train models for your specific use case
4. **Performance**: Add GPU support for faster processing

See `ai-service/README.md` for detailed documentation.

---

**Total setup time: ~2 minutes**  
**Dependencies**: Python 3.8+, your existing Node.js setup** 