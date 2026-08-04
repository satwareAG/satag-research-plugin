# satware® AI research

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
- **satware® AI Search Pro**: replaced by `search` (sonar model)
- **satware® AI Deep Research Pro**: replaced by `research` (sonar-reasoning-pro) + `deep_research` (sonar-deep-research)

The old Deep Research plugin used the **deprecated** `sonar-reasoning` model (returns
400 error). This plugin uses `sonar-reasoning-pro` (the replacement model).

## Perplexity best practices integrated

- System prompt does NOT influence search - only the user message drives search
- Domain filtering via parameters (`domain_filter`), not prose
- Recency filtering via parameters (`recency_filter`), not prose
- Anti-hallucination: "only answer from search results, say if not found"
- Near-miss disclosure: "state mismatch if results are related but don't match"
- Structured citations returned (not appended text)

## Pricing

This plugin uses three Perplexity Sonar models with different cost profiles.
See the public pricing table: https://docs.perplexity.ai/docs/getting-started/pricing

Key cost differences:

| Function | Model | Relative cost |
|----------|-------|---------------|
| `search` | sonar | Cheapest ($1/$1 per 1M tokens) |
| `research` | sonar-reasoning-pro | Mid ($2/$8 per 1M tokens) |
| `deep_research` | sonar-deep-research | Most expensive ($2/$8 + surcharges) |

`deep_research` meters internal search queries ($0.005/query), reasoning
tokens ($3/1M), and citation tokens ($2/1M) on top of token costs. A single
call can cost $0.50+. Use it for high-stakes research only.

Rate limits: https://docs.perplexity.ai/docs/admin/rate-limits-usage-tiers

## Owner

Jane Alesi (AI Architect), satware AG
