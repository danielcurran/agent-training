# Lab Spec \- Memory for AI Applications

## Track Info

| OS | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| :---- | :---- |
| Image type | Virtual Machine \* |
| MongoDB Version | Enterprise 8.0.x (latest) |
| Type | Local Atlas Deployment |
| Language(s) | Python |
| Lab config (eg. 3 node repl) | Local Atlas Deployment |
| Known dependencies | Python packages:pymongo langchain Langchain-openai langchanin-voyageai langgraph langgraph-checkpoint-mongodb langgraph-store-mongodb voyageai datasets utilities:uv (python package manager)api keys (for development only): openai Voyage AI datasets: ai\_agents.gz (chunked\_docs, full\_docs) voyageai\_embeddings.json  python: 3.10 |
| Notes | This lab corresponds to Lesson 5 of the Memory for AI Applications skill. Learners should be familiar with short-term memory checkpointers from the previous lesson. The lab is based on the approach taken in the \`agent\_simple.py\` file of the agentic-memory-playground (custom \`@tool\` functions) seen [here](https://github.com/mongodb-university/curriculum-private/blob/develop/Scripts/agentic-memory-playground/agent_simple.py), which keeps MongoDB-specific behavior explicit and pedagogically transparent. We will need to mock up VoyageAI Embeddings so the lab can be realistically spun up and run in a timely fashion and without needing a legitimate token from the customer. |

###### 

**AI summary**  
This document is a lab specification for implementing long-term memory for AI applications using MongoDB. It outlines two challenges:

1\. **Configure Long-Term Memory Store and Create Memory Tools:** Setting up a Voyage AI embedding model, configuring a MongoDB vector search index with \`create\_vector\_index\_config\`, initializing \`MongoDBStore\` as the long-term memory backend, and implementing \`save\_memory\` and \`retrieve\_memories\` LangChain tools that use namespace-based user isolation to store and semantically retrieve facts.  
2\. **Build the Agent and Verify Memory Persistence:** Completing the \`create\_memory\_agent()\` function by wiring together the memory tools and \`MongoDBSaver\` checkpointer, then running the pre-written demonstration script to prove that long-term memories persist across conversation threads and that each user's memories remain isolated from one another.

The lab uses Python, MongoDB Enterprise 8.0.x, and packages including \`langchain-voyageai\`, \`langgraph\`, \`langgraph-checkpoint-mongodb\`, and \`langgraph-store-mongodb\`. The goal is to build an AI agent with both short-term memory (a \`MongoDBSaver\` checkpointer for in-thread conversation history) and long-term memory (\`MongoDBStore\` with vector search for persistent cross-thread facts), demonstrating how the two memory systems work together to create agents that truly remember.

###### *Links:*

* [Memory for AI Applications Skill Outline](https://docs.google.com/document/d/1rVybYVROYMz8Q4EQngKt99MhdeJwnbVqmAR5I13072A/edit?usp=sharing)  
* [Lesson 0 - Introduction](https://docs.google.com/document/d/1CmxRLqxwyIUuK2vm8Bsiks8ZrbgDRrbm4sTDcw8EoDc/edit?usp=sharing)  
* [Lesson 1: What is Memory in AI Applications?](https://docs.google.com/document/d/1kK_e0bDOXsrFdNvTLDMsW4QMiThlnsA9QwkZ5CA_1eo/edit?usp=sharing)  
* [Lesson 2: Short-Term Memory in AI Applications](https://docs.google.com/document/d/1by_YUHlczfv4TsTpVrGLKNhs9TxQ-qSyUBWtCUQttX8/edit?usp=sharing)  
* [Lesson 3: Implementing Short-Term Memory with MongoDB](https://docs.google.com/document/d/1ne1LzMi3_eFfCHGaMq2oWxdEBDwmgAkZdaB39QlWl9Q/edit?usp=sharing)  
* [Lesson 4 - Long-Term Memory in AI Applications](https://docs.google.com/document/d/1Hl5tdQivZ1-uqP6YJpJG_97roDvjXd3ws8jRnTeUR6Q/edit?usp=sharing)  
* [Lesson 5: Implementing Long-Term Memory with MongoDB](https://docs.google.com/document/d/1es7dy0s6TIP-uRNKKKADkqeNgBeVp1mK5kOj8L4uDXk/edit?usp=sharing)  
* \[LangGraph MongoDBStore Documentation  
  ([https://langchain-ai.github.io/langgraph/reference/store/\#mongodb](https://langchain-ai.github.io/langgraph/reference/store/#mongodb))  
* VoyageAI Embeddings  
  ([https://docs.voyageai.com/docs/embeddings](https://docs.voyageai.com/docs/embeddings))  
* MongoDB Vector Search Documentation  
  ([https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/))  
* What is Agent Memory  
  ([https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory](https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory))  
* Powering Long-Term Memory for Agents With LangGraph and MongoDB  
  ([https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph](https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph))

###### *Overall LOs (sourced from Lessons 4+5 Video Scripts and Skill Outline)*

* Set up MongoDB vector store for long-term memory storage and retrieval  
* Create memory tools that save and retrieve information across threads  
* Demonstrate how long-term memory persists across different conversations

### Challenge 1: Create Memory Infrastructure 

###### *LOs addressed by this challenge*

* Configure a Voyage AI embedding model and MongoDB vector search index for semantic memory retrieval  
* Initialize \`MongoDBStore\` as the long-term memory backend  
* Implement a \`save\_memory\` tool that stores user information with namespace-based user isolation  
* Implement a \`retrieve\_memories\` tool that performs semantic vector search to recall stored facts

| Collection | memories |
| :---- | :---- |
| Change to data | Yes – \`memories\` collection created by \`MongoDBStore\` on first run; populated during testing. Database will be created via startup script. |
| Indexes created | Yes – vector search index created automatically by \`create\_vector\_index\_config\` (1024-dimensional, dotProduct similarity, on \`content\` field) |
| Tabs | editor, terminal |
| Notes | Prior to this challenge, learners are provided a partially completed \`agent\_simple.py\`. The embedding model instantiation, \`index\_config\` parameters, \`MongoDBStore\` initialization arguments, and the bodies of both memory tools will be “TODO” placeholders. |

#### Executive Summary

In this challenge, learners will set up the long-term memory infrastructure and implement the two custom memory tools that will power their agent. First, learners will instantiate a \`VoyageAIEmbeddings\` model using \`voyage-4-large\`, which converts text into 1024-dimensional vectors for semantic comparison. Next, they'll create a vector search index configuration using \`create\_vector\_index\_config\`, specifying the embedding model, dimensions, similarity function (\`dotProduct\`), and indexed fields. Then learners will initialize \`MongoDBStore\` against a MongoDB collection, passing the index configuration so that the vector index is created automatically on first use. With the store in place, learners will implement two LangChain \`@tool\` functions: \`save\_memory\`, which reads the current \`user\_id\` from runtime config via \`get\_config()\` and calls \`store.put()\` with a three-part namespace tuple to isolate memories by user, and \`retrieve\_memories\`, which calls \`store.search()\` to semantically match stored facts against a query. Learners will verify that a memory can be saved and retrieved before moving on.

```py

- agent_simple.py – 

"""
Simple Agent with MongoDB-backed Memory (Custom Tools Approach)
Uses custom @tool functions for direct control over memory operations.
Simpler and more transparent than the langmem approach.
"""

import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_core.tools import tool
from langchain_voyageai import VoyageAIEmbeddings
from langchain.agents import create_agent
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.store.mongodb import MongoDBStore, create_vector_index_config
from langgraph.utils.config import get_config
from pymongo import MongoClient

# Initialize embedding model
embedding_model = VoyageAIEmbeddings(
    model="voyage-4-large"
)

# Vector search index configuration for memory collection
index_config = create_vector_index_config(
    embed=embedding_model,
    dims=1024,
    relevance_score_fn="dotProduct",
    fields=["content"]
)


def create_memory_tools(store: MongoDBStore):
    """Create custom memory tools using MongoDBStore with vector search.
    
    Args:
        store: Pre-initialized MongoDBStore instance
    """
    
    @tool
    def save_memory(content: str) -> str:
        """Save important information to memory for the current user."""
        # Get user_id from runtime context
        config = get_config()
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        # Use the pre-initialized store
        store.put(
            namespace=("user", user_id, "memories"),
            key=f"memory_{hash(content)}",
            value={"content": content}
        )
        
        return f"Memory saved: {content}"

    @tool
    def retrieve_memories(query: str) -> str:
        """Retrieve relevant memories based on a query for the current user."""
        # Get user_id from runtime context
        config = get_config()
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        namespace = ("user", user_id, "memories")
        results = store.search(namespace, query=query, limit=5)

        if results:
            memories = [result.value["content"] for result in results]
            return f"Retrieved memories:\n" + "\n".join(f"- {mem}" for mem in memories)
        return "No relevant memories found."
    
    return [save_memory, retrieve_memories]


def create_memory_agent(mongodb_uri: str, model: str = None):
    """
    Create an agent with MongoDB-backed memory using custom tools.

    Args:
        mongodb_uri: MongoDB Atlas connection string
        model: Model identifier (e.g., "gpt-4o", "gpt-4-turbo"). If None, reads from MODEL env variable.

    Returns:
        Compiled LangGraph agent
    """
    
    # Get model from environment if not provided
    if model is None:
        model = os.getenv("MODEL")
    
    # System prompt for the agent
    system_prompt = """You are a helpful AI assistant with memory capabilities.

When a user sends you a message:
1. First, check your memory about them using retrieve_memories
2. Use what you find to personalize your response
3. If they share new information, save it using save_memory

Example:
- User: "I have a peanut allergy. I need to be careful when I eat at a restaurant."
  → Call save_memory("User has a peanut allergy and needs peanut-free, allergy-safe food options")
  → Respond: "Okay, I've saved that. I'll always keep your peanut allergy in mind when suggestings restaurants and meals."

- User: "Can you recommend somewhere for dinner tonight?"
  → Call retrieve_memories(query="dietary restrictions or food preferences")
  → If found: Recommend peanut-safe options based on saved preferences
  → If not found: Ask about any preferences or dietary needs first

Your memory persists across conversations, so you can remember users over time. Be conversational and helpful!"""
    
    # Create MongoDB client
    client = MongoClient(mongodb_uri)
    
    # Get database and collection for memory store
    db = client["agent_memory_simple"]
    collection = db["memories"]
    
    # Create MongoDBStore once (this creates the vector index on first run)
    store = MongoDBStore(
        collection=collection,
        index_config=index_config,
        auto_index_timeout=120,  # Increase timeout to 120 seconds for Atlas vector index creation
    )
    
    # Create custom memory tools with the pre-initialized store
    memory_tools = create_memory_tools(store)
    
    # Create checkpointer for short-term memory (conversation state)
    checkpointer = MongoDBSaver(client, db_name="agent_memory_simple")

    # Create the agent with custom memory tools
    agent = create_agent(
        model,
        system_prompt=system_prompt,
        tools=memory_tools,
        checkpointer=checkpointer,
    )

    return agent
```

#### Steps

1. Using the editor tab, open ‘agent\_simple.py’ and review the existing imports and structure.  
2. Complete the ‘embedding\_model’ variable by instantiating ‘VoyageAIEmbeddings’ with ‘model=”voyage-4-large”’ (sans brackets)  
   1. The track challenge instructions should specify the information necessary (“we need a model optimized for semantic understanding that outputs 1024 dimensional vectors, we’ll use voyage-4-large \- we decide to use dotProduct similarity”, etc.)  
3. Complete the ‘index\_config’ variable by calling ‘create\_vector\_index\_config’ with all four required arguments:  
   1. ‘embed=embedding\_model’ (variable defined in step 2\)  
   2. ‘dims=1024’  
   3. ‘relevance\_score\_fn=”dotProduct”’  
   4. ‘fields=\[“content”\]  
4. Finish the body of the ‘save\_memory’ tool:  
   1. Define the namespace tuple ‘(“user”, user\_id, “memories”)’ \- this will isolate each user’s memories distinctly.  
5. Finish the body of the ‘retrieve\_memories’ tool:  
   1. Create the same namespace tuple as for the ‘save\_memory’ tool.  
   2. Call \`store.search(namespace, query=query, limit=5)\` – \`MongoDBStore\` converts the query to a vector internally and searches by similarity.  
6. Save ‘agent\_simple.py’ and run it in the terminal to confirm there are no import or syntax errors.

#### Success Criteria

* \`embedding\_model\` is an instance of \`VoyageAIEmbeddings\` configured with \`model="voyage-4-large"\`  
* \`index\_config\` is created with \`dims=1024\`, \`relevance\_score\_fn="dotProduct"\`, and \`fields=\["content"\]\`  
* \`save\_memory\` tool: obtains \`user\_id\` from \`get\_config()\` and calls \`store.put()\` with a three-part namespace tuple \`("user", user\_id, "memories")\`  
* \`retrieve\_memories\` tool: calls \`store.search()\` on the correct namespace with \`limit=5\`   
* \`agent\_simple.py\` runs without errors in the terminal

### Challenge 2: Build the Agent and Verify Memory Persistence

| Collection | Memories, checkpoints, checkpoint\_writes |
| :---- | :---- |
| Change to data | Yes \- new memory documents written during agent conversations, checkpoint records created by ‘MongoDBSaver’ |
| Indexes created | No (vector index carries over from Challenge 1\) |
| Tabs | editor, terminal |
| Notes | Prior to this challenge, learners are provided the solved \`agent\_simple.py\` from Challenge 1 and a partially completed \`create\_memory\_agent()\` function: specifically, the \`create\_agent()\` call is missing its \`tools\` and \`checkpointer\` arguments. \`examples/create\_agent\_instance.py\` is fully pre-written and is run as-is. |

###### *LOs addressed by this challenge (derived from outline)*

* Integrate long-term memory tools and a short-term memory checkpointer into a single agent  
* Demonstrate cross-thread memory persistence: a fact saved in thread-1 is retrievable in a new thread-2  
* Verify user isolation: one user's namespace is inaccessible to another user

#### Executive Summary

In this challenge, learners will complete the \`create\_memory\_agent()\` function and then run a pre-written demonstration script that proves both memory systems are working correctly. First, learners will finish the \`create\_agent()\` call inside \`create\_memory\_agent()\` by passing \`memory\_tools\` (the long-term memory tools from Challenge 1\) and \`checkpointer\` (a \`MongoDBSaver\` instance for short-term in-thread state). This gives the agent both memory systems simultaneously: the checkpointer maintains conversation history within a given thread, while the tools provide cross-thread fact persistence backed by MongoDB vector search. Next, learners will run \`examples/create\_agent\_instance.py\`, which walks through four scripted conversations. In Conversations 1 and 2, Sarah mentions her peanut allergy in \`thread-1\`; the agent automatically calls \`save\_memory\` to store this fact. When Sarah starts a brand-new \`thread-2\` and asks for dinner recommendations, the agent calls \`retrieve\_memories\`, performs a vector search across Sarah's namespace in MongoDB, and replies with peanut-safe suggestions, demonstrating cross-thread persistence. In Conversations 3 and 4, Mike introduces himself as a foodie in ‘thread-3’, and later asks “are there any food allergies or dietary restrictions I should know about?” in ‘thread-4’. The agent searches only Mike's namespace and correctly reports no allergies \- demonstrating user isolation. This also demonstrates real-world stakes: if namespace isolation failed, Mike would incorrectly receive Sarah’s allergy information.  Finally, learners can run \`utils/check\_memories.py\` to inspect the raw MongoDB documents and confirm the namespace separation directly.

```py
"""
Simple Agent with MongoDB-backed Memory (Custom Tools Approach)
Uses custom @tool functions for direct control over memory operations.
Simpler and more transparent than the langmem approach.
"""

import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_core.tools import tool
from langchain_voyageai import VoyageAIEmbeddings
from langchain.agents import create_agent
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.store.mongodb import MongoDBStore, create_vector_index_config
from langgraph.utils.config import get_config
from pymongo import MongoClient

# Initialize embedding model
embedding_model = VoyageAIEmbeddings(
    model="voyage-4-large"
)

# Vector search index configuration for memory collection
index_config = create_vector_index_config(
    embed=embedding_model,
    dims=1024,
    relevance_score_fn="dotProduct",
    fields=["content"]
)


def create_memory_tools(store: MongoDBStore):
    """Create custom memory tools using MongoDBStore with vector search.
    
    Args:
        store: Pre-initialized MongoDBStore instance
    """
    
    @tool
    def save_memory(content: str) -> str:
        """Save important information to memory for the current user."""
        # Get user_id from runtime context
        config = get_config()
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        # Use the pre-initialized store
        store.put(
            namespace=("user", user_id, "memories"),
            key=f"memory_{hash(content)}",
            value={"content": content}
        )
        
        return f"Memory saved: {content}"

    @tool
    def retrieve_memories(query: str) -> str:
        """Retrieve relevant memories based on a query for the current user."""
        # Get user_id from runtime context
        config = get_config()
        user_id = config.get("configurable", {}).get("user_id", "default_user")
        
        namespace = ("user", user_id, "memories")
        results = store.search(namespace, query=query, limit=5)

        if results:
            memories = [result.value["content"] for result in results]
            return f"Retrieved memories:\n" + "\n".join(f"- {mem}" for mem in memories)
        return "No relevant memories found."
    
    return [save_memory, retrieve_memories]


def create_memory_agent(mongodb_uri: str, model: str = None):
    """
    Create an agent with MongoDB-backed memory using custom tools.

    Args:
        mongodb_uri: MongoDB Atlas connection string
        model: Model identifier (e.g., "gpt-4o", "gpt-4-turbo"). If None, reads from MODEL env variable.

    Returns:
        Compiled LangGraph agent
    """
    
    # Get model from environment if not provided
    if model is None:
        model = os.getenv("MODEL")
    
    # System prompt for the agent
    system_prompt = """You are a helpful AI assistant with memory capabilities.

When a user sends you a message:
1. First, check your memory about them using retrieve_memories
2. Use what you find to personalize your response
3. If they share new information, save it using save_memory

Example:
- User: "I have a peanut allergy — I need to be careful when eating out."
  → Call save_memory("User has a peanut allergy and needs peanut-safe food options")
  → Respond: "Okay, I've saved that. I'll always keep your peanut allergy in mind when suggestings restaurants and meals."

- User: "Can you recommend somewhere for dinner tonight?"
  → Call retrieve_memories(query="dietary restrictions or food preferences")
  → If found: Recommend peanut-safe options based on saved preferences
  → If not found: Ask about any preferences or dietary needs first

Your memory persists across conversations, so you can remember users over time. Be conversational and helpful!"""
    
    # Create MongoDB client
    client = MongoClient(mongodb_uri)
    
    # Get database and collection for memory store
    db = client["agent_memory_simple"]
    collection = db["memories"]
    
    # Create MongoDBStore once (this creates the vector index on first run)
    store = MongoDBStore(
        collection=collection,
        index_config=index_config,
        auto_index_timeout=120,  # Increase timeout to 120 seconds for Atlas vector index creation
    )
    
    # Create custom memory tools with the pre-initialized store
    memory_tools = create_memory_tools(store)
    
    # Create checkpointer for short-term memory (conversation state)
    checkpointer = MongoDBSaver(client, db_name="agent_memory_simple")

    # Create the agent with custom memory tools
    agent = create_agent(
        model,
        system_prompt=system_prompt,
        tools=memory_tools,
        checkpointer=checkpointer,
    )

    return agent



- create_agent_instance.py (pre-written; run as-is) -

"""
MongoDB Memory Store Demo - AI Agent with Persistent Memory
This demonstrates how MongoDB can be used as a memory store for AI agents.

Key MongoDB Features Used:
- Collections: Store both conversation checkpoints and long-term memories
- Vector Search: Enable semantic retrieval of relevant memories
- Namespaces: Isolate memories per user for multi-tenant applications
- Indexes: Optimize vector similarity search performance
"""
import os
import sys
import time

# Add parent directory to path so we can import agent_simple
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
from agent_simple import create_memory_agent
from pymongo import MongoClient

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment
mongodb_uri = os.getenv("MONGODB_URI")
openai_api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("MODEL")

# Set OpenAI API key if available
if openai_api_key:
    os.environ["OPENAI_API_KEY"] = openai_api_key

print("="*70)
print("  MongoDB Memory Store Demo for AI Agents")
print("="*70)
print(f"Model: {model}")
print(f"MongoDB: Connected\n")

# Create the agent instance (MongoDB vector index is created automatically)
agent = create_memory_agent(mongodb_uri)

def chat(user_id, thread_id, message):
    """Send a message and print the response"""
    config = {"configurable": {"user_id": user_id, "thread_id": thread_id}}
    response = agent.invoke(
        {"messages": [{"role": "user", "content": message}]},
        config=config
    )
    assistant_reply = response['messages'][-1].content
    print(f"\n[User: {user_id}, Thread: {thread_id}]")
    print(f"User: {message}")
    print(f"Agent: {assistant_reply}")
    
    return assistant_reply

# =============================================================================
# Conversation 1: Sarah shares a dietary restriction
# =============================================================================
print("\n" + "="*70)
print("  Conversation 1: Sarah - Introduction")
print("="*70)

chat("sarah", "thread-1", "Hey! Just so you know, I have a severe peanut allergy — it's really important when I'm eating out.")
# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("sarah", "thread-1", "I'm looking for a good Thai restaurant in my neighborhood.")

# =============================================================================
# Conversation 2: Sarah in a new thread asks for dinner suggestions
# =============================================================================
print("\n" + "="*70)
print("  Conversation 2: Sarah - New Thread")
print("="*70)

# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("sarah", "thread-2", "I'm heading out for dinner tonight — can you help me pick a restaurant?")

# =============================================================================
# Conversation 3: Mike introduces himself
# =============================================================================
print("\n" + "="*70)
print("  Conversation 3: Mike - Introduction")
print("="*70)

# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("mike", "thread-3", "Hi! I'm Mike. I'm a total foodie — I'll try pretty much anything.")
# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("mike", "thread-3", "What's a good spot for dinner tonight?")

# =============================================================================
# Conversation 4: Mike in a new thread - isolation test
# =============================================================================
print("\n" + "="*70)
print("  Conversation 4: Mike - New Thread")
print("="*70)

# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("mike", "thread-4", "What do you know about my food preferences?")
# Wait 15 seconds between interactions to mirror realistic conversation timing
time.sleep(15)
chat("mike", "thread-4", "I'm trying a Thai restaurant tonight. Are there any food allergies or dietary restrictions I should let them know about?")



```

#### Steps

1. Using the editor tab, open \`agent\_simple.py\` and locate the \`create\_memory\_agent()\` function. Find the \`create\_agent()\` call at the bottom of the function and complete it by passing:  
   1. \`tools=memory\_tools\` – the list returned by \`create\_memory\_tools(store)\` earlier in the function  
   2. \`checkpointer=checkpointer\` – the \`MongoDBSaver\` instance defined just above  
2. Save ‘agent\_simple.py’  
3. Using the editor tab, open \`examples/create\_agent\_instance.py\` and review the four conversations without making changes  
4. In the terminal tab, run the demo script (‘create\_agent\_instance.py’)  
5. Observe the output for Conversations 1 and 2 (Sarah):  
   1. In \`thread-1\`, the agent should autonomously call \`save\_memory\` after Sarah mentions her peanut allergy; no explicit instruction is needed  
   2. In \`thread-2\` (a completely new thread), Sarah asks for dinner recommendations. The agent should call \`retrieve\_memories\`, perform a vector search, and correctly factor in the allergy when suggesting restaurants \- despite having no in-thread context (the context in this case is stored in \`thread-1\`  
6. Observe the output for Conversations 3 and 4 (Mike):  
   1. The agent saves Mike's status as a foodie with no allergies or dietary restrictions to his own namespace in \`thread-3\`  
   2. In \`thread-4\`, Mike asks "Are there any food allergies or dietary restrictions I should let them know about?" and the agent searches only Mike's namespace, and thus should return no allergy information, confirming user isolation  
7. In the terminal tab, run the memory inspector utility to examine the raw MongoDB documents (‘check\_memories.py’)  
8. The learner should be able to observe that the ‘namespace’ field for Sarah’s memories reads: ‘\[“user”, “sarah”, “memories”\]’ and Mike’s reads: \[“user”, “mike”, “memories”\]’ \- confirming that they are stored separately, explaining the effective isolation, while being stored in the same collection.

   

#### Success Criteria

* ‘create\_agent()’ is called with both ‘tools=memory\_tools’ and ‘checkpointer=checkpointer’  
* ‘Create\_agent\_instance.py’ runs without errors  
* Learner executed the check\_memories.py script to view the raw documents  
* User isolation is observed in the results (assuming the code is correct, this should more or less be guaranteed, but it might be worth coding something in the check\_script to catch outliers.