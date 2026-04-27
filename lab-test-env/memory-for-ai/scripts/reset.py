#!/usr/bin/env python3
"""
Reset script for Memory for AI Applications lab.

Drops all collections and re-seeds the database to a clean starting state.
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def reset(dry_run: bool = False):
    """
    Reset the database to a clean starting state.
    
    Args:
        dry_run: If True, show what would be dropped without executing
    """
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
    
    try:
        client = MongoClient(uri)
        db = client.get_database()
        
        # Verify connection
        db.command("ping")
        
        # Collections to drop
        collections_to_drop = ["memories", "checkpoints", "checkpoint_writes"]
        
        print("\n" + "="*70)
        print("Memory for AI Applications — Database Reset")
        print("="*70 + "\n")
        
        if dry_run:
            print("DRY RUN: The following would be dropped:")
            for collection in collections_to_drop:
                if collection in db.list_collection_names():
                    print(f"  • {collection}")
            print()
        else:
            print("Dropping collections:")
            for collection in collections_to_drop:
                if collection in db.list_collection_names():
                    db[collection].drop()
                    print(f"  ✓ Dropped: {collection}")
            print()
            print("✓ Database reset to clean state\n")
        
        client.close()
        return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reset the Memory for AI lab database")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be reset without executing")
    args = parser.parse_args()
    
    sys.exit(reset(dry_run=args.dry_run))
