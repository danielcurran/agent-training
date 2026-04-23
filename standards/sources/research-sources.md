# Research Sources

Reference materials informing the instructional design approach for AI agent training labs.

---

## In-Context Learning & Context Engineering

- [Context Engineering — Weaviate](https://weaviate.io/blog/context-engineering)
- [AutoContext: Instance-Level Context Learning](https://arxiv.org/html/2510.02369)
- [Experience Compression Spectrum: Unifying Memory, Skills, and Rules in LLM Agents — arXiv](https://arxiv.org/html/2604.15877)

## Grounding LLMs in Unfamiliar Domains

- [A Researcher's Guide to LLM Grounding — Neptune.ai](https://neptune.ai/blog/llm-grounding)
- [Grounding and Evaluation for Large Language Models — Survey](https://arxiv.org/html/2407.12858v1)

## Documentation Structure for AI Agents

- [How to Write a Good Spec for AI Agents — Addy Osmani](https://addyosmani.com/blog/good-spec/)
- [Writing Effective Tools for Agents — Anthropic Engineering](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Documentation for Humans and AI Agents: Complete Guide — Document360](https://document360.com/blog/documentation-for-humans-and-ai-agents/)

## Instructional Design Frameworks for AI

- [EduPlanner: LLM-Based Multi-Agent Systems for Instructional Design](https://arxiv.org/html/2504.05370v1)
- [ISD-Agent-Bench: Benchmark for Instructional Design Agents](https://arxiv.org/html/2602.10620v1)
- [Enabling Multi-Agent Systems as Learning Designers — KLI Framework](https://arxiv.org/html/2508.16659)
- [A Scoping Review of Large Language Model-Based Pedagogical Agents — arXiv](https://arxiv.org/html/2604.12253)

## Few-Shot Learning & Tool Use

- [API Synthesis Using LLMs](https://arxiv.org/html/2502.15246v1)
- [Function Calling: Structured Tool Use for LLMs](https://mbrenndoerfer.com/writing/function-calling-llm-structured-tools)

## Learning Science Foundations

### Cognitive Load & Scaffolding

- **Sweller, J. (1988). "Cognitive Load During Problem Solving: Effects on Learning"** — Foundational theory distinguishing intrinsic load (topic difficulty), germane load (schema construction), and extraneous load (presentation format). Directly supports Section 6 (Scaffolding) principle of reducing extraneous cognitive load while maximizing germane load through structured content delivery.

- **Paas, F. & Van Merriënboer, J. (1994). "Variability of Worked Examples and Transfer of Geometrical Problem-Solving Skills"** — Research on worked examples vs. discovery learning, supporting the effectiveness of scaffolded instruction over unguided exploration.

### Metacognition & Self-Regulated Learning

- **Flavell, J. H. (1979). "Metacognition and Cognitive Monitoring: A New Area of Cognitive-Developmental Inquiry"** — Seminal framework defining metacognition as awareness of one's own thought processes, comprising metacognitive knowledge (declarative, procedural, conditional) and metacognitive regulation (planning, monitoring, evaluating). Core to Section 11 (Reflection and Decision Records) requirement for agents to articulate choices and reasoning.

- **Gall, M. D., Gall, J. P., Jacobsen, D. R., & Bullock, T. L. (1990). "Tools for Learning: A Guide to Teaching Study Skills"** — Emphasizes that metacognition ("Learning how to learn") must be explicitly taught alongside content. Supports explicit reflection artifacts in lab stages.

### Spaced Repetition & Long-Term Retention

- **Ebbinghaus, H. (1885). "Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie"** — Original research establishing the forgetting curve and the principle that reviewing learned material at expanding intervals preserves long-term memory. Foundation for all spaced retrieval practices.

- **Landauer, T. K. & Bjork, R. A. (1978). "Optimum Rehearsal Patterns and Name Learning"** — Empirical confirmation that spacing effects are strongest with expanding intervals, supporting Section 3 (KLI Learning Process Types) requirement for spaced practice appropriate to each learning type.

- **Karpicke, J. D. & Roediger, H. L. (2007). "Expanding Retrieval Practice Promotes Short-Term Retention, But Equally Spaced Repetition Enhances Long-Term Retention"** — Clarifies that while expanding intervals aid short-term performance, uniform spacing optimizes long-term retention—key for designing multi-stage labs.

### Desirable Difficulty & Effective Challenge

- **Bjork, R. A. (1994). "Institutional Impediments to Effective Training"** — Introduces the concept of desirable difficulty: learning tasks that require considerable but achievable effort produce stronger long-term memory and transfer than easy, fluent tasks. Directly supports Section 4 (Skill Gap Design) and Section 5 (Stage Design) principles of scaffolded challenge progression.

- **Bjork, E. & Bjork, R. (2011). "Making Things Hard on Yourself, But in a Good Way: Creating Desirable Difficulties to Enhance Learning"** — Practical framework showing how retrieval practice, delayed feedback, spacing, and interleaving create optimal learning conditions. Validates Section 6 (Scaffolding) reduction strategy and KLI practice patterns.

### Schema Formation & Mental Model Construction

- **Piaget, J. (1923). "Le Langage et la Pensée chez l'Enfant"** — Original introduction of schema concept (schème) as cognitive structures organizing knowledge. Foundational to understanding how learners construct and modify mental models through accommodation and assimilation—core to Sections 4 and 5.

- **Bartlett, F. C. (1932). "Remembering: A Study in Experimental and Social Psychology"** — Demonstrates that memory is reconstructive and schema-driven; people reinterpret new information to fit existing schemas. Essential for understanding the SQL-to-MongoDB conceptual transition in Section 0 (Backwards Design) and the need for explicit schema modification strategies.

- **Rumelhart, D. E. (1980). "Schemata: The Building Blocks of Cognition"** — Modern formalization of schema theory in cognitive science, explaining how schemata guide attention, organize perception, and enable rapid knowledge retrieval. Supports rationale for KLI framework's structured progression.

### Transfer of Learning

- **Thorndike, E. L. & Woodworth, R. S. (1901). "The Influence of Improvement in One Mental Function upon the Efficiency of Other Functions"** — Seminal identical-elements theory: transfer depends on similarity between learning context and application context. Directly supports Section 4 (Skill Gap Design) explicit bridging from SQL mental models to MongoDB.

- **Perkins, D. N. & Salomon, G. (1992). "Transfer of Learning"** — Modern extension distinguishing high-road transfer (conscious, deliberate application) from low-road transfer (automatic, skill-based). Validates Section 5 (Stage Design) progression from guided, conscious practice to increasingly automatic skill deployment. Introduces hugging and bridging strategies paralleling the rulebook's scaffolding reduction approach.
