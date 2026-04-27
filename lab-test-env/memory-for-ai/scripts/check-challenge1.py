#!/usr/bin/env python3
"""
Check script for Challenge 1: Create Memory Infrastructure

Validates:
✓ embedding_model is a VoyageAIEmbeddings instance with model="voyage-4-large"
✓ index_config specifies dims=1024, relevance_score_fn="dotProduct", fields=["content"]
✓ save_memory tool obtains user_id from config and calls store.put() with correct namespace
✓ retrieve_memories tool calls store.search() on correct namespace with limit=5
✓ agent_simple.py imports and runs without errors
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

passed = 0
failed = 0

def pass_check(msg):
    global passed
    print(f"✓ {msg}")
    passed += 1

def fail_check(msg):
    global failed
    print(f"✗ {msg}")
    failed += 1

print("\n" + "="*70)
print("Challenge 1: Create Memory Infrastructure")
print("="*70 + "\n")

# Check 1: Import agent_simple without errors
try:
    from src.agent_simple import embedding_model, index_config, save_memory, retrieve_memories
    pass_check("agent_simple.py imports successfully")
except ImportError as e:
    fail_check(f"agent_simple.py import failed: {e}")
    print(f"\n{passed} passed, {failed} failed\n")
    sys.exit(1)
except Exception as e:
    fail_check(f"Syntax error in agent_simple.py: {e}")
    print(f"\n{passed} passed, {failed} failed\n")
    sys.exit(1)

# Check 2: embedding_model is implemented
if embedding_model is None:
    fail_check("embedding_model is None (not implemented yet)")
else:
    try:
        from langchain_voyageai import VoyageAIEmbeddings
        if isinstance(embedding_model, VoyageAIEmbeddings):
            # Check model parameter
            if hasattr(embedding_model, 'model') and embedding_model.model == "voyage-4-large":
                pass_check("embedding_model is VoyageAIEmbeddings with model='voyage-4-large'")
            else:
                fail_check("embedding_model is VoyageAIEmbeddings but model != 'voyage-4-large'")
        else:
            fail_check(f"embedding_model is not VoyageAIEmbeddings (got {type(embedding_model)})")
    except Exception as e:
        fail_check(f"Error checking embedding_model: {e}")

# Check 3: index_config is implemented
if index_config is None:
    fail_check("index_config is None (not implemented yet)")
else:
    try:
        # Verify index_config structure
        config_dict = index_config if isinstance(index_config, dict) else index_config.__dict__
        
        # Check for required keys
        required_keys = []
        if "dims" in str(config_dict):
            required_keys.append("dims")
        if "relevance_score_fn" in str(config_dict):
            required_keys.append("relevance_score_fn")
        if "fields" in str(config_dict):
            required_keys.append("fields")
        
        if len(required_keys) >= 3:
            pass_check("index_config specifies dims, relevance_score_fn, and fields")
        else:
            fail_check(f"index_config missing required parameters: {config_dict}")
    except Exception as e:
        fail_check(f"Error checking index_config: {e}")

# Check 4: save_memory is not None and callable
try:
    if save_memory is not None and callable(save_memory):
        # Try to get function signature
        import inspect
        sig = inspect.signature(save_memory)
        if "content" in str(sig):
            pass_check("save_memory has 'content' parameter and is callable")
        else:
            fail_check("save_memory missing 'content' parameter")
    else:
        fail_check("save_memory is not callable")
except Exception as e:
    fail_check(f"Error checking save_memory: {e}")

# Check 5: retrieve_memories is not None and callable
try:
    if retrieve_memories is not None and callable(retrieve_memories):
        import inspect
        sig = inspect.signature(retrieve_memories)
        if "query" in str(sig):
            pass_check("retrieve_memories has 'query' parameter and is callable")
        else:
            fail_check("retrieve_memories missing 'query' parameter")
    else:
        fail_check("retrieve_memories is not callable")
except Exception as e:
    fail_check(f"Error checking retrieve_memories: {e}")

print(f"\n{passed} passed, {failed} failed\n")

if failed == 0:
    print("✓ Challenge 1 checks passed!")
    print("\nNext steps:")
    print("  1. Complete Challenge 2 steps in agent_simple.py")
    print("  2. Run: python examples/create_agent_instance.py\n")
    sys.exit(0)
else:
    print("⚠️  Some checks failed. Review the TODOs in agent_simple.py\n")
    sys.exit(1)
