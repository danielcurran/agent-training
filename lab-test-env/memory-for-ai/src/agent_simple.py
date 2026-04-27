"""
Memory for AI Applications — Agent Implementation

This module demonstrates building an AI agent with persistent cross-thread memory
backed by MongoDB vector search, with namespace-based user isolation.

Challenges:
1. Create Memory Infrastructure: Set up embedding model, vector index, and memory tools
2. Build the Agent & Verify Memory Persistence: Wire memory systems into the agent
"""

import os
import asyncio
import contextvars
from typing import Any
from dotenv import load_dotenv

from langchain_voyageai import VoyageAIEmbeddings
from langchain_openai import ChatOpenAI
from langgraph.store.mongodb import MongoDBStore
from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo import MongoClient
from langgraph.graph import START, StateGraph
from langgraph.prebuilt import create_react_agent

load_dotenv()

# Context variable for storing config during agent execution
_agent_config = contextvars.ContextVar('agent_config', default=None)

# ==============================================================================
# CHALLENGE 1: Create Memory Infrastructure
# ==============================================================================

# TODO (Challenge 1, Step 1): Instantiate the embedding model
# Complete the line below with:
#   VoyageAIEmbeddings(model="voyage-4-large")
# Rationale: voyage-4-large outputs 1024-dimensional vectors optimized for semantic understanding
embedding_model = VoyageAIEmbeddings(model="voyage-4-large")

# TODO (Challenge 1, Step 2): Configure the vector search index
# Complete the create_vector_index_config call with:
#   embed=embedding_model
#   dims=1024
#   relevance_score_fn="dotProduct"
#   fields=["content"]
# Rationale: dotProduct similarity is efficient for dense vectors; 1024 dims match Voyage AI output
from langgraph.store.mongodb import create_vector_index_config

index_config = create_vector_index_config(
    embed=embedding_model,
    dims=1024,
    relevance_score_fn="dotProduct",
    fields=["content"]
)

# Initialize MongoDB Store and Checkpointer
def _get_mongo_client():
    """Get MongoDB client for store and checkpointer."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/memory-for-ai")
    return MongoClient(uri)

# ============================================================================
# TODO (Challenge 1, Step 3): Implement save_memory tool
# This tool should:
#   1. Obtain user_id from runtime config: config = get_config()
#      user_id = config.get("configurable", {}).get("user_id", "default_user")
#   2. Call store.put() with:
#      namespace=("user", user_id, "memories")
#      key=f"memory_{hash(content)}"
#      value={"content": content}
#   3. Return a confirmation message
# Rationale: Three-part namespace isolates each user's memories
# ============================================================================

# These placeholder functions are replaced by closures inside create_memory_tools
async def save_memory(content: str, config: dict = None) -> str:
    """
    Save a fact to the user's long-term memory.
    
    Args:
        content: The memory content to save
        config: Runtime config containing user_id
    
    Returns:
        Confirmation message
    """
    # This will be overridden by the closure inside create_memory_tools
    raise NotImplementedError("Challenge 1, Step 3: Implement save_memory")

# ============================================================================
# TODO (Challenge 1, Step 4): Implement retrieve_memories tool
# This tool should:
#   1. Obtain user_id from runtime config (same as save_memory)
#   2. Call store.search() with:
#      namespace=("user", user_id, "memories")
#      query=query
#      limit=5
#   3. Extract and format results; return "No relevant memories found" if empty
# Rationale: MongoDBStore.search() converts query to vector and performs semantic similarity
# ============================================================================

async def retrieve_memories(query: str, config: dict = None) -> str:
    """
    Retrieve relevant memories using semantic search.
    
    Args:
        query: Natural language query for memory retrieval
        config: Runtime config containing user_id
    
    Returns:
        Formatted results or "No relevant memories found"
    """
    # This will be overridden by the closure inside create_memory_tools
    raise NotImplementedError("Challenge 1, Step 4: Implement retrieve_memories")

# ==============================================================================
# CHALLENGE 2: Build the Agent & Verify Memory Persistence
# ==============================================================================

def create_memory_tools(store):
    """Create memory tool definitions for the agent."""
    from langchain_core.tools import tool
    
    # Challenge 1, Step 3 & 4: Implement save_memory and retrieve_memories as closures
    async def save_memory_impl(content: str) -> str:
        """
        Save a fact to the user's long-term memory.
        """
        # Obtain user_id from runtime config context variable
        config = _agent_config.get() or {}
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        # Create namespace tuple for user isolation
        namespace = ("user", user_id, "memories")
        
        # Create unique key based on content hash
        key = f"memory_{hash(content)}"
        
        # Save to store
        await store.aput(namespace, key, {"content": content})
        
        return f"✓ Memory saved: {content}"
    
    async def retrieve_memories_impl(query: str) -> str:
        """
        Retrieve relevant memories using semantic search.
        """
        # Obtain user_id from runtime config context variable
        config = _agent_config.get() or {}
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        # Create namespace tuple for user isolation
        namespace = ("user", user_id, "memories")
        
        # Search using semantic similarity
        results = await store.asearch(namespace, query, limit=5)
        
        # Format and return results
        if not results:
            return "No relevant memories found"
        
        formatted_results = "\n".join([f"- {result[1]['content']}" for result in results])
        return f"Relevant memories:\n{formatted_results}"
    
    @tool
    async def save_memory_tool(content: str) -> str:
        """Save a fact to long-term memory for future retrieval."""
        return await save_memory_impl(content)
    
    @tool
    async def retrieve_memories_tool(query: str) -> str:
        """Retrieve relevant memories using semantic search."""
        return await retrieve_memories_impl(query)
    
    return [save_memory_tool, retrieve_memories_tool]

def create_memory_agent(db):
    """
    Create an agent with integrated short-term and long-term memory systems.
    
    Args:
        db: MongoDB database instance
    
    Returns:
        Compiled agent
    """
    # Initialize store and checkpointer
    # MongoDBStore requires a collection object
    memories_collection = db["memories"]
    
    # Try to create store with index_config; fall back if Atlas is not available
    try:
        store = MongoDBStore(collection=memories_collection, index_config=index_config)
    except Exception as e:
        # For local MongoDB (not Atlas), skip index creation
        if "Atlas" in str(e):
            print(f"Note: Vector search indexes require MongoDB Atlas. Using local MongoDB without vector indexes.")
            store = MongoDBStore(collection=memories_collection)
        else:
            raise
    
    checkpointer = MongoDBSaver(
        client=_get_mongo_client(),
        db_name="memory-for-ai"
    )
    
    # Create memory tools
    memory_tools = create_memory_tools(store)
    
    # Initialize LLM
    llm = ChatOpenAI(model=os.getenv("MODEL", "gpt-4o"), temperature=0)
    
    # TODO (Challenge 2, Step 1): Complete the create_react_agent call
    # Add arguments:
    #   tools=memory_tools (the list returned above)
    #   checkpointer=checkpointer (the MongoDBSaver instance)
    # Rationale: This gives the agent both memory systems:
    #   - checkpointer for in-thread state
    #   - tools for cross-thread fact persistence
    agent = create_react_agent(
        llm,
        tools=memory_tools,
        checkpointer=checkpointer
    )
    
    # Wrap agent to handle config context for tools
    class AgentWithConfig:
        def __init__(self, inner_agent):
            self._agent = inner_agent
        
        def invoke(self, input_dict, config=None, **kwargs):
            """Invoke agent while setting config context for tools."""
            config = config or {}
            token = _agent_config.set(config)
            try:
                return self._agent.invoke(input_dict, config=config, **kwargs)
            finally:
                _agent_config.reset(token)
        
        async def ainvoke(self, input_dict, config=None, **kwargs):
            """Async invoke agent while setting config context for tools."""
            config = config or {}
            token = _agent_config.set(config)
            try:
                return await self._agent.ainvoke(input_dict, config=config, **kwargs)
            finally:
                _agent_config.reset(token)
        
        def __getattr__(self, name):
            """Forward other attributes to inner agent."""
            return getattr(self._agent, name)
    
    return AgentWithConfig(agent)

# ==============================================================================
# Main entry point for manual testing
# ==============================================================================

async def main():
    """Main function for manual testing."""
    from lib.db import connect
    
    db = connect()
    agent = create_memory_agent(db)
    print("✓ Agent created successfully")
    print("✓ Memory infrastructure is ready")

if __name__ == "__main__":
    asyncio.run(main())
