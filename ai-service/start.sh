#!/bin/bash

echo "🚀 Starting AXON AI Detection Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start the service
python run.py 