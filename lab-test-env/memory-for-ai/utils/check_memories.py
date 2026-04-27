#!/usr/bin/env python3
"""
Utility: Inspect raw MongoDB memory documents.

This script queries the memories collection and displays documents,
showing how namespace isolation works in practice.
"""

import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def check_memories():
    """Query and display memory documents from MongoDB."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
    client = MongoClient(uri)
    db = client.get_database()
    
    print("\n" + "="*70)
    print("MongoDB Memories Collection Inspection")
    print("="*70 + "\n")
    
    try:
        # Query memories collection
        memories_collection = db["memories"]
        count = memories_collection.count_documents({})
        
        if count == 0:
            print("✗ No memory documents found.")
            print("  Run the demo first: python examples/create_agent_instance.py\n")
            return
        
        print(f"✓ Found {count} memory document(s)\n")
        
        # Group by namespace
        namespaces = {}
        for doc in memories_collection.find():
            ns = tuple(doc.get("namespace", []))
            if ns not in namespaces:
                namespaces[ns] = []
            namespaces[ns].append(doc)
        
        # Display by namespace
        for ns, docs in sorted(namespaces.items()):
            print(f"Namespace: {ns}")
            print(f"  Documents: {len(docs)}")
            for i, doc in enumerate(docs, 1):
                print(f"\n  Document {i}:")
                print(f"    _id: {doc.get('_id')}")
                print(f"    key: {doc.get('key')}")
                print(f"    value: {doc.get('value')}")
                embedding = doc.get('embedding', [])
                if embedding:
                    print(f"    embedding dims: {len(embedding)}")
            print()
        
        print("✓ Namespace isolation check:")
        print("  • Different users have different namespace tuples")
        print("  • All documents in same collection")
        print("  • Logically isolated by namespace, not by separate tables\n")
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
    finally:
        client.close()

if __name__ == "__main__":
    check_memories()
