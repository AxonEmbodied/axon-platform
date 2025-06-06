const ffmpeg = require('fluent-ffmpeg');

function rtspEndpoints(app) {
  if (!app) return;

  app.ws('/api/rtsp/stream', (ws, req) => {
    const streamUrl = 'rtsp://axon-dev:supersecretsecret@192.168.1.131:554/stream1';
    
    console.log('Client connected to high-quality RTSP stream');

    const ffmpegCommand = ffmpeg(streamUrl)
      .inputOptions('-rtsp_transport', 'tcp')
      .outputOptions([
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-b:v', '1000k',
        '-maxrate', '1000k',
        '-bufsize', '1500k',
        '-an', // no audio
        '-r', '30'
      ])
      .on('start', (commandLine) => {
        console.log('FFmpeg started with command: ' + commandLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        ws.close();
      })
      .on('end', () => {
        console.log('FFmpeg stream ended');
        ws.close();
      });

    const ffmpegProcess = ffmpegCommand.pipe();
    ffmpegProcess.on('data', (data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from RTSP stream');
      ffmpegProcess.kill('SIGKILL');
    });
  });
}

module.exports = { rtspEndpoints }; 