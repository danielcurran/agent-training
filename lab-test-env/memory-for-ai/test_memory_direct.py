#!/usr/bin/env python3
"""
Direct test of memory infrastructure without LLM.
Tests save and retrieve functionality, cross-thread persistence, and user isolation.
"""

import asyncio
import os
import sys
sys.path.insert(0, '.')
os.environ['VOYAGE_API_KEY'] = 'mock-key'

from dotenv import load_dotenv
load_dotenv()

async def test_memory():
    """Test memory persistence and isolation directly."""
    from src.agent_simple import create_memory_agent
    from lib.db import connect
    
    print("\n" + "="*70)
    print("Direct Memory Infrastructure Test")
    print("(Without LLM, testing save/retrieve and user isolation)")
    print("="*70 + "\n")
    
    # Create agent
    db = connect()
    agent = create_memory_agent(db)
    print("✓ Agent created successfully\n")
    
    # Access the inner agent's tools
    inner_agent = agent._agent
    tools = {tool.name: tool for tool in inner_agent.graph.get_tools()} if hasattr(inner_agent, 'graph') else {}
    
    print(f"✓ Agent has tools: {list(tools.keys())}\n")
    
    # Test 1: Sarah saves a memory
    print("="*70)
    print("Test 1: Sarah saves an allergy memory (thread-1)")
    print("="*70)
    
    config_sarah_t1 = {
        "configurable": {
            "user_id": "sarah",
            "thread_id": "thread-1"
        }
    }
    
    # Manually invoke agent with minimal input
    result = agent.invoke(
        {"input": "Remember: I have a severe peanut allergy"},
        config=config_sarah_t1
    )
    print(f"Result: {result}\n")
    
    # Test 2: Sarah retrieves in a new thread
    print("="*70)
    print("Test 2: Sarah retrieves memory in new thread (thread-2)")
    print("="*70)
    
    config_sarah_t2 = {
        "configurable": {
            "user_id": "sarah",
            "thread_id": "thread-2"
        }
    }
    
    result = agent.invoke(
        {"input": "What allergies do I have?"},
        config=config_sarah_t2
    )
    print(f"Result: {result}\n")
    
    # Test 3: Mike has no allergy (should be isolated)
    print("="*70)
    print("Test 3: Mike saves he has no food restrictions (thread-3)")
    print("="*70)
    
    config_mike_t1 = {
        "configurable": {
            "user_id": "mike",
            "thread_id": "thread-3"
        }
    }
    
    result = agent.invoke(
        {"input": "I'm a total foodie - no dietary restrictions at all"},
        config=config_mike_t1
    )
    print(f"Result: {result}\n")
    
    # Test 4: Mike checks his restrictions (should NOT see Sarah's)
    print("="*70)
    print("Test 4: Mike checks restrictions (should be isolated)")
    print("="*70)
    
    config_mike_t2 = {
        "configurable": {
            "user_id": "mike",
            "thread_id": "thread-4"
        }
    }
    
    result = agent.invoke(
        {"input": "What allergies do I have?"},
        config=config_mike_t2
    )
    print(f"Result: {result}\n")
    
    # Check MongoDB directly
    print("="*70)
    print("Verification: Raw MongoDB Documents")
    print("="*70 + "\n")
    
    memories_col = db["memories"]
    count = memories_col.count_documents({})
    print(f"Total memory documents: {count}\n")
    
    # Group by namespace
    namespaces = {}
    for doc in memories_col.find():
        ns = tuple(doc.get("namespace", []))
        if ns not in namespaces:
            namespaces[ns] = []
        namespaces[ns].append(doc)
    
    for ns, docs in sorted(namespaces.items()):
        print(f"Namespace: {ns}")
        for doc in docs:
            print(f"  Key: {doc.get('key')}")
            print(f"  Value: {doc.get('value')}")
        print()
    
    print("\n✓ Direct memory test completed")

if __name__ == "__main__":
    asyncio.run(test_memory())
