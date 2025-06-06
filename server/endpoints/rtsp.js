const { Stream } = require('node-ffmpeg-stream');
const axios = require('axios');
const FormData = require('form-data');

// Global stream instance
let streamInstance = null;

// AI Service configuration
const AI_SERVICE_URL = 'http://localhost:8000';

function rtspEndpoints(app, apiRouter) {
  if (!apiRouter) return;

  // Check AI service health
  const checkAiService = async () => {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 2000 });
      return response.data.model_loaded;
    } catch (error) {
      return false;
    }
  };

  // Endpoint to start the stream
  apiRouter.post('/rtsp/start', (req, res) => {
    if (streamInstance) {
      console.log('Stream already running');
      return res.json({ status: 'already_running', wsPort: 9999 });
    }

    console.log('Starting new RTSP stream...');
    try {
      streamInstance = new Stream({
        name: 'axon-camera',
        url: 'rtsp://axon-dev:supersecretsecret@192.168.1.131:554/stream1',
        wsPort: 9999,
        options: {
          '-stats': '',
          '-r': 30,
          '-s': '1280x720',
          '-b:v': '2000k'
        }
      });

      streamInstance.on('exitWithError', () => {
        console.log('Stream exited with error');
        streamInstance = null;
      });

      res.json({ status: 'started', wsPort: 9999 });
    } catch (error) {
      console.error('Error starting stream:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Endpoint to stop the stream
  apiRouter.post('/rtsp/stop', (req, res) => {
    if (streamInstance) {
      console.log('Stopping stream...');
      streamInstance.stopStream();
      streamInstance = null;
      res.json({ status: 'stopped' });
    } else {
      res.json({ status: 'not_running' });
    }
  });

  // Endpoint to get stream status
  apiRouter.get('/rtsp/status', (req, res) => {
    res.json({ 
      status: streamInstance ? 'running' : 'stopped',
      wsPort: streamInstance ? 9999 : null
    });
  });

  // AI Detection endpoints
  
  // Check AI service status
  apiRouter.get('/rtsp/ai/status', async (req, res) => {
    try {
      const isReady = await checkAiService();
      res.json({ 
        ai_service: isReady ? 'ready' : 'not_ready',
        ai_url: AI_SERVICE_URL,
        endpoints: {
          detect: `${AI_SERVICE_URL}/detect`,
          annotated: `${AI_SERVICE_URL}/detect-annotated`,
          specific: `${AI_SERVICE_URL}/detect-specific`
        }
      });
    } catch (error) {
      res.status(500).json({ 
        ai_service: 'error',
        error: error.message 
      });
    }
  });

  // Capture frame from RTSP and analyze with AI
  apiRouter.post('/rtsp/ai/analyze-frame', async (req, res) => {
    try {
      // Check if AI service is available
      const aiReady = await checkAiService();
      if (!aiReady) {
        return res.status(503).json({ 
          error: 'AI service not available',
          message: 'Please ensure the AI service is running on port 8000'
        });
      }

      // For now, we'll return instructions on how to capture frames
      // In a production setup, you'd capture frames from the RTSP stream
      res.json({
        message: 'Frame analysis endpoint ready',
        instructions: [
          '1. Capture a frame from your RTSP stream',
          '2. POST the image file to /rtsp/ai/detect-image',
          '3. Or use the direct AI service endpoints at localhost:8000'
        ],
        ai_endpoints: {
          detect: `${AI_SERVICE_URL}/detect`,
          annotated: `${AI_SERVICE_URL}/detect-annotated`,
          specific: `${AI_SERVICE_URL}/detect-specific`
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload and analyze image
  apiRouter.post('/rtsp/ai/detect-image', async (req, res) => {
    try {
      // Check if AI service is available
      const aiReady = await checkAiService();
      if (!aiReady) {
        return res.status(503).json({ 
          error: 'AI service not available',
          message: 'Please ensure the AI service is running on port 8000'
        });
      }

      if (!req.file && !req.body.image) {
        return res.status(400).json({ 
          error: 'No image provided',
          message: 'Please upload an image file or provide image data'
        });
      }

      // Forward the request to the AI service
      const formData = new FormData();
      
      if (req.file) {
        formData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
      }

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/detect`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      res.json({
        success: true,
        ai_analysis: aiResponse.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI analysis error:', error.message);
      res.status(500).json({ 
        error: 'AI analysis failed',
        message: error.message,
        ai_service_url: AI_SERVICE_URL
      });
    }
  });

  // Get AI service capabilities
  apiRouter.get('/rtsp/ai/capabilities', async (req, res) => {
    try {
      const aiReady = await checkAiService();
      
      res.json({
        ai_service_ready: aiReady,
        ai_service_url: AI_SERVICE_URL,
        supported_models: ['YOLOv8n'],
        detection_types: [
          'object_detection',
          'person_detection', 
          'vehicle_detection',
          'custom_class_detection'
        ],
        endpoints: {
          health: `${AI_SERVICE_URL}/`,
          docs: `${AI_SERVICE_URL}/docs`,
          detect: `${AI_SERVICE_URL}/detect`,
          detect_annotated: `${AI_SERVICE_URL}/detect-annotated`,
          detect_specific: `${AI_SERVICE_URL}/detect-specific`
        },
        example_usage: {
          curl: `curl -X POST "${AI_SERVICE_URL}/detect" -F "file=@image.jpg"`,
          javascript: `fetch('${AI_SERVICE_URL}/detect', { method: 'POST', body: formData })`
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get AI capabilities',
        message: error.message 
      });
    }
  });
}

module.exports = { rtspEndpoints }; 