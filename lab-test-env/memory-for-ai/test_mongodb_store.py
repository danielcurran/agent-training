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

embedding_model = VoyageAIEmbeddings(model="voyage-large-2") # Changed to voyage-large-2 as voyage-4-large might not exist in old version
index_config = create_vector_index_config(
    embed=embedding_model,
    dims=1024,
    relevance_score_fn="dotProduct",
    fields=["content"]
)

# Pattern 1
try:
    store = MongoDBStore(client=client, db_name="memory-for-ai", index_config=index_config)
    print("✓ Pattern 1 works (client, db_name, index_config)")
except TypeError as e:
    print(f"✗ Pattern 1: {e}")
except Exception as e:
    print(f"! Pattern 1 Error: {e}")

# Pattern 2
try:
    store = MongoDBStore(client=client, collection="memories", index_config=index_config)
    print("✓ Pattern 2 works (client, collection, index_config)")
except TypeError as e:
    print(f"✗ Pattern 2: {e}")
except Exception as e:
    print(f"! Pattern 2 Error: {e}")

# Pattern 3
try:
    store = MongoDBStore(connection_string=uri, collection="memories", index_config=index_config)
    print("✓ Pattern 3 works (connection_string, collection, index_config)")
except TypeError as e:
    print(f"✗ Pattern 3: {e}")
except Exception as e:
    print(f"! Pattern 3 Error: {e}")
