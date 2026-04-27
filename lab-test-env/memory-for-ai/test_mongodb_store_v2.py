import sys
import os
sys.path.insert(0, '.')
os.environ['VOYAGE_API_KEY'] = 'mock-key'
from pymongo import MongoClient
from langgraph.store.mongodb import MongoDBStore, create_vector_index_config
from langchain_voyageai import VoyageAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
client = MongoClient(uri)
db = client["memory-for-ai"]
collection = db["memories"]

embedding_model = VoyageAIEmbeddings(model="voyage-large-2")
index_config = create_vector_index_config(
    embed=embedding_model,
    dims=1024,
    relevance_score_fn="dotProduct",
    fields=["content"]
)

# Pattern 4 (client=client, collection=collection object)
try:
    store = MongoDBStore(client=client, collection=collection, index_config=index_config)
    print("✓ Pattern 4 works (client=client, collection=collection_object)")
except Exception as e:
    print(f"✗ Pattern 4 failed: {e}")

# Pattern 5 (collection=collection object)
try:
    store = MongoDBStore(collection=collection, index_config=index_config)
    print("✓ Pattern 5 works (collection=collection_object)")
except Exception as e:
    print(f"✗ Pattern 5 failed: {e}")
