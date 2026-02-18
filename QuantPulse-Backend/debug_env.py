import sys
import os
print(f"CWD: {os.getcwd()}")
# print(f"Path: {sys.path}")

try:
    import torch
    print("✅ SUCCESS: torch imported")
except Exception as e:
    print(f"❌ FAILURE: torch import failed: {e}")

try:
    import app.model
    print("✅ SUCCESS: app.model imported")
except Exception as e:
    print(f"❌ FAILURE: app.model import failed: {e}")
