import sys
import os
import traceback
sys.path.insert(0, '.')
os.environ['VOYAGE_API_KEY'] = 'mock-key'
from dotenv import load_dotenv
load_dotenv()

try:
    from lib.db import connect
    print("✓ DB connect import successful")
    db = connect()
    print("✓ DB connection successful")
    
    from src.agent_simple import create_memory_agent
    print("✓ Agent module imported")
    
    agent = create_memory_agent(db)
    print("✓ Agent created successfully!")
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nFull traceback:")
    traceback.print_exc()
