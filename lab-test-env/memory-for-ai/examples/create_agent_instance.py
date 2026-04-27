"""
Memory for AI Applications — Demo: Cross-Thread Persistence & User Isolation

This script demonstrates:
1. Cross-thread persistence: Facts saved in one thread are retrievable in another
2. User isolation: One user's memories remain inaccessible to another user

Scenario:
- Sarah (thread-1, thread-2): Tests cross-thread persistence
  * thread-1: Mentions a peanut allergy
  * thread-2: Asks for a restaurant recommendation (should remember allergy)
  
- Mike (thread-3, thread-4): Tests user isolation
  * thread-3: Says he's an adventurous eater (no allergies)
  * thread-4: Asks about food restrictions (should NOT see Sarah's allergy)

Run this script after completing Challenge 2.
"""

import asyncio
import os
from dotenv import load_dotenv
from src.agent_simple import create_memory_agent
from lib.db import connect

load_dotenv()

async def run_conversation(agent, user_id: str, thread_id: str, message: str) -> str:
    """
    Run a single conversation turn.
    
    Args:
        agent: The compiled agent
        user_id: User identifier (sarah, mike, etc.)
        thread_id: Conversation thread identifier
        message: User message
    
    Returns:
        Agent response
    """
    config = {
        "configurable": {
            "user_id": user_id,
            "thread_id": thread_id
        }
    }
    
    print(f"\n{'='*70}")
    print(f"User: {user_id.upper()} | Thread: {thread_id}")
    print(f"{'='*70}")
    print(f"Message: {message}")
    print("-" * 70)
    
    try:
        result = agent.invoke(
            {"input": message},
            config=config
        )
        response = result.get("output", "No response")
        print(f"Agent: {response}")
        return response
    except NotImplementedError as e:
        print(f"⚠️  Not implemented: {e}")
        print("Complete Challenge 1 and Challenge 2 steps before running this demo.")
        return None

async def main():
    """Run the demo."""
    print("\n" + "="*70)
    print("Memory for AI Applications — Demo")
    print("Testing Cross-Thread Persistence & User Isolation")
    print("="*70)
    
    # Connect to database and create agent
    try:
        db = connect()
        agent = create_memory_agent(db)
    except Exception as e:
        print(f"✗ Failed to initialize agent: {e}")
        print("Ensure MongoDB is running and .env is configured.")
        return
    
    print("\n✓ Agent initialized successfully")
    print("\nRunning demo conversations...\n")
    
    # ==================================================================
    # SARAH'S CONVERSATIONS: Test Cross-Thread Persistence
    # ==================================================================
    print("\n" + "█" * 70)
    print("█ SARAH'S STORY: Cross-Thread Persistence")
    print("█" * 70)
    print("\nExpected behavior:")
    print("- Thread-1: Sarah mentions her peanut allergy")
    print("- Thread-2: New thread, but agent remembers the allergy from Thread-1")
    print("  and suggests peanut-safe restaurants\n")
    
    # Thread-1: Sarah mentions her allergy
    await run_conversation(
        agent,
        user_id="sarah",
        thread_id="thread-1",
        message="Hi! I have a severe peanut allergy and need help finding a restaurant. Can you remember this for future reference?"
    )
    
    # Thread-2: New thread, same user
    await run_conversation(
        agent,
        user_id="sarah",
        thread_id="thread-2",
        message="Hey, can you help me pick a restaurant for dinner tonight? I want something with great food."
    )
    
    print("\n✓ Cross-thread persistence check:")
    print("  Did the agent remember Sarah's allergy in thread-2?")
    print("  If yes → persistence works!")
    print("  If no → check save_memory and retrieve_memories implementation")
    
    # ==================================================================
    # MIKE'S CONVERSATIONS: Test User Isolation
    # ==================================================================
    print("\n\n" + "█" * 70)
    print("█ MIKE'S STORY: User Isolation (Namespace Separation)")
    print("█" * 70)
    print("\nExpected behavior:")
    print("- Thread-3: Mike says he's a foodie (no allergies)")
    print("- Thread-4: When asked about food restrictions, agent should return")
    print("  'no allergies found' (NOT Sarah's peanut allergy)\n")
    
    # Thread-3: Mike introduces himself
    await run_conversation(
        agent,
        user_id="mike",
        thread_id="thread-3",
        message="I'm a total foodie — I'll try pretty much anything! No dietary restrictions at all."
    )
    
    # Thread-4: Mike asks about restrictions
    await run_conversation(
        agent,
        user_id="mike",
        thread_id="thread-4",
        message="Are there any food allergies or dietary restrictions I should let them know about?"
    )
    
    print("\n✓ User isolation check:")
    print("  Did Mike's query return his status (no allergies)?")
    print("  Did Mike NOT see Sarah's peanut allergy?")
    print("  If both true → namespace isolation works!")
    print("  If not → check namespace tuple implementation")
    
    # ==================================================================
    # RAW MONGODB INSPECTION (Optional)
    # ==================================================================
    print("\n\n" + "="*70)
    print("Optional: Inspect Raw MongoDB Documents")
    print("="*70)
    print("\nTo verify namespace separation, run:")
    print("  python utils/check_memories.py")
    print("\nExpected output:")
    print("  Sarah's memories: namespace=['user', 'sarah', 'memories']")
    print("  Mike's memories:  namespace=['user', 'mike', 'memories']")
    print("  Both in same collection, but logically isolated.\n")

if __name__ == "__main__":
    asyncio.run(main())
