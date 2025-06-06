#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🤖 Starting AXON AI Detection Service...');

// Check if virtual environment exists
const venvPath = path.join(__dirname, 'venv');
if (!fs.existsSync(venvPath)) {
  console.error('❌ Virtual environment not found. Please run: cd ai-service && ./setup.sh');
  process.exit(1);
}

// Determine the correct Python executable path
const isWindows = process.platform === 'win32';
const pythonPath = isWindows 
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

// Check if Python exists in venv
if (!fs.existsSync(pythonPath)) {
  console.error('❌ Python not found in virtual environment. Please run: cd ai-service && ./setup.sh');
  process.exit(1);
}

console.log('🔄 Activating virtual environment...');
console.log('🚀 Starting AI service on http://localhost:8000');

// Start the Python service
const pythonProcess = spawn(pythonPath, ['run.py'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    // Ensure we're using the virtual environment
    VIRTUAL_ENV: venvPath,
    PATH: `${path.dirname(pythonPath)}${path.delimiter}${process.env.PATH}`
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Stopping AI service...');
  pythonProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  pythonProcess.kill('SIGTERM');
});

pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ AI service exited with code ${code}`);
  } else {
    console.log('👋 AI service stopped gracefully');
  }
});

pythonProcess.on('error', (err) => {
  console.error('❌ Failed to start AI service:', err.message);
  console.error('💡 Make sure you have run: cd ai-service && ./setup.sh');
  process.exit(1);
}); 