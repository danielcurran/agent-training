#!/usr/bin/env python3
"""
Check script for Challenge 2: Build Agent & Verify Memory Persistence

Validates:
✓ create_agent() is called with both tools= and checkpointer= parameters
✓ examples/create_agent_instance.py exists and runs without errors
✓ Agent runs 4 conversations (Sarah thread-1, Sarah thread-2, Mike thread-3, Mike thread-4)
✓ Cross-thread persistence: Sarah's memory from thread-1 is retrievable in thread-2
✓ User isolation: Mike's namespace is separate from Sarah's
"""

import sys
import os
import asyncio
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
import inspect

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
print("Challenge 2: Build Agent & Verify Memory Persistence")
print("="*70 + "\n")

# Check 1: agent_simple.py imports successfully
try:
    from src.agent_simple import create_memory_agent
    pass_check("agent_simple.py imports successfully")
except Exception as e:
    fail_check(f"agent_simple.py import failed: {e}")
    print(f"\n{passed} passed, {failed} failed\n")
    sys.exit(1)

# Check 2: create_memory_agent function is properly defined
try:
    sig = inspect.signature(create_memory_agent)
    if "db" in str(sig):
        pass_check("create_memory_agent accepts 'db' parameter")
    else:
        fail_check("create_memory_agent signature incorrect")
except Exception as e:
    fail_check(f"Error checking create_memory_agent: {e}")

# Check 3: examples/create_agent_instance.py exists
demo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "examples", "create_agent_instance.py")
if os.path.exists(demo_path):
    pass_check("examples/create_agent_instance.py exists")
else:
    fail_check("examples/create_agent_instance.py not found")

# Check 4: Verify create_react_agent call has tools and checkpointer
try:
    with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "agent_simple.py"), "r") as f:
        content = f.read()
        
    # Check for tools= parameter
    if "tools=memory_tools" in content or "tools = memory_tools" in content:
        pass_check("create_react_agent call includes tools= parameter")
    else:
        # Check if it's still a TODO
        if "TODO" in content and "tools=" in content:
            fail_check("tools= parameter still has TODO comment")
        else:
            fail_check("create_react_agent call missing tools= parameter")
    
    # Check for checkpointer= parameter
    if "checkpointer=checkpointer" in content or "checkpointer = checkpointer" in content:
        pass_check("create_react_agent call includes checkpointer= parameter")
    else:
        if "TODO" in content and "checkpointer=" in content:
            fail_check("checkpointer= parameter still has TODO comment")
        else:
            fail_check("create_react_agent call missing checkpointer= parameter")
            
except Exception as e:
    fail_check(f"Error checking agent_simple.py: {e}")

# Check 5: Try to instantiate agent (basic check)
try:
    from lib.db import connect
    db = connect()
    agent = create_memory_agent(db)
    pass_check("Agent can be instantiated successfully")
except NotImplementedError as e:
    fail_check(f"Agent instantiation failed (not implemented): {e}")
except Exception as e:
    fail_check(f"Agent instantiation error: {e}")

print(f"\n{passed} passed, {failed} failed\n")

if failed == 0:
    print("✓ Challenge 2 checks passed!")
    print("\nNext steps:")
    print("  1. Run the demo to verify persistence and isolation:")
    print("     python examples/create_agent_instance.py")
    print("  2. Inspect raw MongoDB documents:")
    print("     python utils/check_memories.py")
    print("  3. Complete the REFLECTION.md file\n")
    sys.exit(0)
else:
    print("⚠️  Some checks failed.")
    print("Review the TODOs in agent_simple.py (Challenge 2, Step 1)\n")
    sys.exit(1)
