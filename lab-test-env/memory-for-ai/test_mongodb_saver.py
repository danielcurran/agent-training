import sys
sys.path.insert(0, '.')
from pymongo import MongoClient
from langgraph.checkpoint.mongodb import MongoDBSaver
from dotenv import load_dotenv
import os

load_dotenv()
os.environ['VOYAGE_API_KEY'] = 'mock-key'

uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
client = MongoClient(uri)

# Try pattern 1
try:
    s = MongoDBSaver(client=client, db_name="memory-for-ai")
    print("✓ Pattern 1 works (client, db_name)")
except Exception as e:
    print(f"✗ Pattern 1 failed: {e}")

# Try pattern 2  
try:
    s = MongoDBSaver(connection_string=uri)
    print("✓ Pattern 2 works (connection_string)")
except Exception as e:
    print(f"✗ Pattern 2 failed: {e}")

# Try pattern 3
try:
    s = MongoDBSaver(client=client, collection="checkpoints")
    print("✓ Pattern 3 works (client, collection)")
except Exception as e:
    print(f"✗ Pattern 3 failed: {e}")
