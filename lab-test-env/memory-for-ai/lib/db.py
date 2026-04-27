"""
MongoDB connection module for Memory for AI Applications lab.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client = None

def connect():
    """
    Connect to MongoDB using MONGODB_URI from .env.
    Returns the database object for memory-for-ai.
    """
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
        _client = MongoClient(uri)
        # Verify connection
        _client.admin.command("ping")
    return _client.get_database()

def close():
    """Close the MongoDB connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None

def get_database():
    """Get the MongoDB database instance."""
    return connect()
