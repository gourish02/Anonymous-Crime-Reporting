"""
Runner script for FastAPI AI Crime Classifier.
Starts Uvicorn server on port 8000.
"""

import os
import sys
import uvicorn

# Ensure repository root is on path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting AI Crime Classifier on http://{host}:{port} ...")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
