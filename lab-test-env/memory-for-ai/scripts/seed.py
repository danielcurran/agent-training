#!/usr/bin/env python3
"""
Seed script for Memory for AI Applications lab.

This script initializes the starting state. Since MongoDBStore and MongoDBSaver
create their collections automatically, this script primarily prepares the
database connection and verifies collections can be created.

The intentional starting state is defined by the TODO placeholders in agent_simple.py:
- embedding_model is None (learner must instantiate)
- index_config is None (learner must configure)
- save_memory and retrieve_memories are unimplemented
- agent's tools= and checkpointer= parameters are missing
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def seed(drop: bool = False):
    """
    Initialize the database for the lab.
    
    Args:
        drop: If True, drop existing collections before re-seeding
    """
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
    
    try:
        client = MongoClient(uri)
        db = client.get_database()
        
        print("\n" + "="*70)
        print("Memory for AI Applications — Database Seeding")
        print("="*70 + "\n")
        
        # Verify connection
        db.command("ping")
        print("✓ Connected to MongoDB\n")
        
        # Optional: Drop existing collections
        if drop:
            collections = ["memories", "checkpoints", "checkpoint_writes"]
            for collection in collections:
                if collection in db.list_collection_names():
                    db[collection].drop()
                    print(f"  Dropped collection: {collection}")
            print()
        
        # Verify collections can be created
        # (MongoDBStore and MongoDBSaver will create these automatically)
        print("✓ Collections will be created automatically on first use:")
        print("  - memories (auto-created by MongoDBStore)")
        print("  - checkpoints (auto-created by MongoDBSaver)")
        print("  - checkpoint_writes (auto-created by MongoDBSaver)\n")
        
        print("Starting state:")
        print("  • agent_simple.py has TODO placeholders")
        print("  • embedding_model is None")
        print("  • index_config is None")
        print("  • Memory tools are not implemented")
        print("  • Agent is not wired\n")
        
        print("✓ Database ready for lab!\n")
        print("Next steps:")
        print("  1. Complete Challenge 1 in agent_simple.py")
        print("  2. Run: python examples/create_agent_instance.py\n")
        
        client.close()
        return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        print("Ensure MongoDB is running and MONGODB_URI is set in .env\n")
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the Memory for AI lab database")
    parser.add_argument("--drop", action="store_true", help="Drop existing collections before seeding")
    args = parser.parse_args()
    
    sys.exit(seed(drop=args.drop))
