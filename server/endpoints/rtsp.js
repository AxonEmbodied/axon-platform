const { Stream } = require('node-ffmpeg-stream');

// Global stream instance
let streamInstance = null;

function rtspEndpoints(app, apiRouter) {
  if (!apiRouter) return;

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
      streamInstance.stop();
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
}

module.exports = { rtspEndpoints }; 