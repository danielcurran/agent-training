# Memory for AI Applications Test Environment

## Prerequisites

- Docker Desktop installed and running
- Python 3.10+
- MongoDB URI configured in `.env`

## Setup

1. **Start MongoDB:**
   ```bash
   docker-compose up -d
   ```
   Wait for health check to pass:
   ```bash
   docker-compose ps
   ```
   MongoDB should show `(healthy)` status.

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys if needed
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed the database:**
   ```bash
   python scripts/seed.py
   ```

## Lab Progression

### Challenge 1: Create Memory Infrastructure
**Objective:** Set up embedding model, vector search index, and memory tools

**File to edit:** `src/agent_simple.py`

**TODOs:**
1. Instantiate `embedding_model` (Step 1)
2. Configure `index_config` (Step 2)
3. Implement `save_memory` tool (Step 3)
4. Implement `retrieve_memories` tool (Step 4)

**Check your work:**
```bash
python scripts/check-challenge1.py
```

### Challenge 2: Build the Agent & Verify Memory Persistence
**Objective:** Wire memory systems into an agent and verify cross-thread persistence + user isolation

**File to edit:** `src/agent_simple.py` (continued)

**TODOs:**
1. Complete `create_react_agent()` call with `tools=` and `checkpointer=` parameters

**Check your work:**
```bash
python scripts/check-challenge2.py
```

**Run the demo:**
```bash
python examples/create_agent_instance.py
```

## What Should Happen

The demo runs two scenarios:

**Sarah's Story (Cross-Thread Persistence):**
- Thread-1: Sarah mentions her peanut allergy
- Thread-2: New thread, same user
  - Expected: Agent remembers the allergy and suggests peanut-safe restaurants
  - Why: Memory saved in thread-1 persists in thread-2 via MongoDB

**Mike's Story (User Isolation):**
- Thread-3: Mike says he has no food restrictions
- Thread-4: New thread, Mike asks about restrictions
  - Expected: Agent returns "no allergies" (not Sarah's allergy!)
  - Why: Namespace isolation keeps Mike's memories separate from Sarah's

## Verification

**Inspect raw MongoDB documents:**
```bash
python utils/check_memories.py
```

Expected output shows:
- Sarah's namespace: `["user", "sarah", "memories"]`
- Mike's namespace: `["user", "mike", "memories"]`
- Both in same collection, logically isolated by namespace

## Reset Database

To drop and re-seed:
```bash
python scripts/reset.py
python scripts/seed.py
```

Or dry-run to see what would be dropped:
```bash
python scripts/reset.py --dry-run
```

## Troubleshooting

**MongoDB connection error:**
- Ensure `docker-compose up -d` succeeded
- Check `docker-compose ps` shows "healthy"
- Verify `MONGODB_URI` in `.env` is correct

**Import errors:**
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)

**Agent not recognizing memory:**
- Verify `save_memory` and `retrieve_memories` are implemented
- Check that `create_react_agent()` includes both `tools=` and `checkpointer=`
- Run `python scripts/check-challenge2.py` for diagnostics

## Files in This Environment

```
├── .env.example              # Environment variables template
├── docker-compose.yml        # MongoDB service definition
├── requirements.txt          # Python dependencies
├── lib/
│   └── db.py                # MongoDB connection module
├── src/
│   └── agent_simple.py       # Main lab file (has TODOs)
├── examples/
│   └── create_agent_instance.py  # Demo script
├── utils/
│   └── check_memories.py     # Inspect MongoDB documents
├── scripts/
│   ├── seed.py              # Initialize database
│   ├── reset.py             # Drop and re-seed
│   ├── check-challenge1.py  # Validate Challenge 1
│   └── check-challenge2.py  # Validate Challenge 2
└── README.md                # This file
```

## Next Steps After Labs

1. Complete `REFLECTION.md` with your learnings
2. Extend the agent with custom memory retrieval strategies
3. Experiment with different embedding models
4. Build a multi-user application using this pattern
