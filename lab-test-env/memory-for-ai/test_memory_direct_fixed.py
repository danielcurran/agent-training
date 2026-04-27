import asyncio
import os
import sys
sys.path.insert(0, '.')

from dotenv import load_dotenv
load_dotenv()

# Set mock API key if not present (to satisfy ChatOpenAI initialization)
if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "sk-test-key-for-lab":
    os.environ["OPENAI_API_KEY"] = "sk-" + "a" * 48

async def test_memory():
    """Test memory persistence and isolation directly."""
    from src.agent_simple import create_memory_agent, _agent_config
    from lib.db import connect
    
    print("\n" + "="*70)
    print("Direct Memory Infrastructure Test (Fixed)")
    print("(Testing tool logic directly to avoid LLM AuthenticationError)")
    print("="*70 + "\n")
    
    # Create agent
    db = connect()
    agent = create_memory_agent(db)
    print("✓ Agent created successfully\n")
    
    # Access the inner agent's tools
    # In reacting agent created via create_react_agent, tools are usually accessible
    # However, since agent is AgentWithConfig, we access agent_config to mock it
    tools = agent._agent.tools
    
    save_tool = next(t for t in tools if t.name == "save_memory_tool")
    retrieve_tool = next(t for t in tools if t.name == "retrieve_memories_tool")
    
    print(f"✓ Found tools: {[t.name for t in tools]}\n")
    
    # Helper to call tool with config
    async def call_tool(tool, args, user_id, thread_id):
        config = {"configurable": {"user_id": user_id, "thread_id": thread_id}}
        token = _agent_config.set(config)
        try:
            return await tool.ainvoke(args)
        finally:
            _agent_config.reset(token)

    # Test 1: Sarah saves an allergy memory
    print("="*70)
    print("Test 1: Sarah saves an allergy memory (thread-1)")
    print("="*70)
    
    result = await call_tool(save_tool, {"content": "I have a severe peanut allergy"}, "sarah", "thread-1")
    print(f"Result: {result}\n")
    
    # Test 2: Sarah retrieves in a new thread
    print("="*70)
    print("Test 2: Sarah retrieves memory in new thread (thread-2)")
    print("="*70)
    
    result = await call_tool(retrieve_tool, {"query": "What allergies do I have?"}, "sarah", "thread-2")
    print(f"Result: {result}\n")
    
    # Test 3: Mike has no allergy (should be isolated)
    print("="*70)
    print("Test 3: Mike saves he has no food restrictions (thread-3)")
    print("="*70)
    
    result = await call_tool(save_tool, {"content": "I'm a total foodie - no dietary restrictions at all"}, "mike", "thread-3")
    print(f"Result: {result}\n")
    
    # Test 4: Mike checks his restrictions (should NOT see Sarah's)
    print("="*70)
    print("Test 4: Mike checks restrictions (should be isolated)")
    print("="*70)
    
    result = await call_tool(retrieve_tool, {"query": "What allergies do I have?"}, "mike", "thread-4")
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
