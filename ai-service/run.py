#!/usr/bin/env python3
"""
AXON AI Detection Service Runner
"""
import uvicorn
import sys
import os

def main():
    print("🤖 Starting AXON AI Detection Service...")
    print("📍 Service will be available at: http://localhost:8000")
    print("📖 API docs available at: http://localhost:8000/docs")
    print("🎯 YOLOv8 model will download automatically on first run")
    print("="*60)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 AI Service stopped gracefully")
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 