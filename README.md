# satware(R) AI research

A unified TypingMind plugin for web search, deep reasoning research, and exhaustive
research using the Perplexity Sonar API. Three functions in one plugin:

1. **search** - Quick factual search (sonar, 30s, cheapest)
2. **research** - Deep reasoning with Chain of Thought (sonar-reasoning-pro, 180s)
3. **deep_research** - Exhaustive research reports (sonar-deep-research, 600s)

All functions support per-call domain filtering and recency filtering (Perplexity
best practice: use parameters, not prose). Returns structured citations (title, URL,
snippet) so agents can reference sources properly.

## Setup

1. Import from GitHub: `https://github.com/satwareAG/satag-research-plugin`
2. Enter your Perplexity API key in the plugin settings (get one at https://www.perplexity.ai/settings/api)
3. Enable the plugin

## Why this plugin exists

Replaces two plugins with a single unified plugin:
- **satware(R) AI Search Pro**: replaced by `search` (sonar model)
- **satware(R) AI Deep Research Pro**: replaced by `research` (sonar-reasoning-pro) + `deep_research` (sonar-deep-research)

The old Deep Research plugin used the **deprecated** `sonar-reasoning` model (returns
400 error). This plugin uses `sonar-reasoning-pro` (the replacement model).

## Perplexity best practices integrated

- System prompt does NOT influence search - only the user message drives search
- Domain filtering via parameters (`domain_filter`), not prose
- Recency filtering via parameters (`recency_filter`), not prose
- Anti-hallucination: "only answer from search results, say if not found"
- Near-miss disclosure: "state mismatch if results are related but don't match"
- Structured citations returned (not appended text)

## Owner

Jane Alesi (AI Architect), satware AG
