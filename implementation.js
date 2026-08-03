/**
 * satware(R) AI research - TypingMind plugin
 *
 * Unified Perplexity research plugin replacing:
 * - satware(R) AI Search Pro (search_via_perplexity_pro)
 * - satware(R) AI Deep Research Pro (deep_research_via_perplexity_pro)
 *
 * 3 functions, all synchronous, browser-native fetch():
 * - search: sonar model (quick factual, 30s timeout)
 * - research: sonar-reasoning-pro (multi-step reasoning, 180s timeout)
 * - deep_research: sonar-deep-research (exhaustive reports, 600s timeout)
 *
 * Per-call parameters (Perplexity best practice: use parameters, not prose):
 * - query (required)
 * - search_focus (optional enum)
 * - domain_filter (optional array, allowlist/denylist)
 * - recency_filter (optional enum)
 *
 * Returns structured output with citations + search_results so agents
 * can reference sources by title and URL.
 *
 * Owner: Jane Alesi (AI Architect), satware AG.
 * License: MIT
 */

/**
 * search - Quick web search using sonar model.
 * Best for: current prices, quick fact checks, news, recent regulatory updates.
 *
 * @param {Object} params
 * @param {string} params.query - Search query (required)
 * @param {string} [params.search_focus] - "general_search"|"product_specific"|"technical_how_to"|"current_events"|"factual_verification"|"market_prices"
 * @param {Array<string>} [params.domain_filter] - Allowlist domains (e.g. ["gesetze-im-internet.de"]) or denylist (prefix with "-", e.g. ["-reddit.com"])
 * @param {string} [params.recency_filter] - "hour"|"day"|"week"|"month"|"year"
 * @param {Object} userSettings
 * @param {string} userSettings.perplexityApiKey - Perplexity API key
 * @param {string} [userSettings.model] - Default model (default: "sonar")
 * @param {number} [userSettings.timeout] - Default timeout seconds (default: 30)
 * @param {number} [userSettings.maxTokens] - Default max tokens (default: 4000)
 * @param {number} [userSettings.temperature] - Default temperature (default: 0.2)
 * @returns {Object} { content, citations, search_results, metadata } or { isError, error }
 */
async function search(params, userSettings) {
  const config = buildConfig(params, userSettings, 'sonar', 30, 4000, 0.2);
  if (config.error) return config.error;

  const systemPrompt = getSystemPrompt(params.search_focus || 'general_search');
  const requestBody = buildRequestBody(config, systemPrompt, params);

  return await callPerplexity(config, requestBody, params);
}

/**
 * research - Deep reasoning search using sonar-reasoning-pro.
 * Best for: multi-step analysis, legal interpretation, cross-jurisdictional comparison.
 *
 * @param {Object} params - Same as search() plus:
 * @param {string} [params.search_focus] - Adds "company_research" option
 * @returns {Object} { content, citations, search_results, metadata } or { isError, error }
 */
async function research(params, userSettings) {
  const config = buildConfig(params, userSettings, 'sonar-reasoning-pro', 180, 4000, 0.1);
  if (config.error) return config.error;

  const systemPrompt = getSystemPrompt(params.search_focus || 'general_search');
  const requestBody = buildRequestBody(config, systemPrompt, params);

  return await callPerplexity(config, requestBody, params);
}

/**
 * deep_research - Exhaustive research using sonar-deep-research.
 * Best for: comprehensive legal opinions, exhaustive regulatory analysis, literature synthesis.
 * Note: this model can take several minutes and costs more.
 *
 * @param {Object} params - Same as research()
 * @returns {Object} { content, citations, search_results, metadata } or { isError, error }
 */
async function deep_research(params, userSettings) {
  const config = buildConfig(params, userSettings, 'sonar-deep-research', 600, 8000, 0.1);
  if (config.error) return config.error;

  const systemPrompt = getSystemPrompt(params.search_focus || 'general_search');
  const requestBody = buildRequestBody(config, systemPrompt, params);

  return await callPerplexity(config, requestBody, params);
}

// === Shared helpers ===

function buildConfig(params, userSettings, defaultModel, defaultTimeout, defaultMaxTokens, defaultTemp) {
  const apiKey = userSettings && userSettings.perplexityApiKey ? userSettings.perplexityApiKey.trim() : '';
  if (!apiKey) {
    return { error: { isError: true, error: 'Perplexity API key is required. Configure it in the plugin settings.' } };
  }
  const query = params && params.query != null ? String(params.query).trim() : '';
  if (!query) {
    return { error: { isError: true, error: 'query is required.' } };
  }
  const model = (userSettings.model && userSettings.model.trim()) || defaultModel;
  const timeout = Math.min(parseInt(userSettings.timeout, 10) || defaultTimeout, defaultTimeout);
  const maxTokens = Math.min(parseInt(userSettings.maxTokens, 10) || defaultMaxTokens, defaultMaxTokens);
  const temperature = Math.min(Math.max(parseFloat(userSettings.temperature) || defaultTemp, 0), 1);
  return { apiKey, query, model, timeout, maxTokens, temperature, error: null };
}

function getSystemPrompt(searchFocus) {
  const prompts = {
    general_search: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly rather than guessing. If search results are related but do not match the question (different year, parent company, similar product), state the mismatch explicitly before answering. Provide comprehensive, accurate information with credible sources and balanced perspectives.',
    product_specific: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly. Focus on current pricing, detailed specifications, availability, user reviews, and comparisons from reliable sources.',
    technical_how_to: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly. Provide step-by-step technical guidance with code examples, implementation details, and troubleshooting tips. Use official docs and verified tutorials.',
    current_events: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly. Present recent developments with accurate timestamps from credible news sources. Include multiple perspectives and context.',
    factual_verification: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly rather than guessing. Verify information with authoritative sources (.gov, .edu, peer-reviewed). Provide confidence levels and flag conflicts explicitly.',
    market_prices: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly. Focus on current market data from official exchanges and financial institutions. Include trends and context.',
    company_research: 'Only answer using the search results provided. If results do not contain the answer, say so explicitly. Research companies using official websites, technical docs, and authoritative sources. Prioritize primary sources over directories. Include domain discovery (company.com, company.ai, GitHub, etc.).'
  };
  return prompts[searchFocus] || prompts.general_search;
}

function buildRequestBody(config, systemPrompt, params) {
  const body = {
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: config.query }
    ]
  };
  // Perplexity best practice: use parameters, not prose for filters
  if (params.domain_filter && Array.isArray(params.domain_filter) && params.domain_filter.length > 0) {
    body.search_domain_filter = params.domain_filter.slice(0, 20);
  }
  if (params.recency_filter) {
    body.search_recency_filter = params.recency_filter;
  }
  return body;
}

async function callPerplexity(config, requestBody, params) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout * 1000);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { isError: true, error: 'Perplexity API error: ' + response.status + ' - ' + (errorData.error || response.statusText) };
    }

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      return { isError: true, error: 'No search results returned. Try a different query.' };
    }

    const content = data.choices[0].message.content;
    if (!content || !content.trim()) {
      return { isError: true, error: 'Empty search results. Refine your query.' };
    }

    // Structured output: agents can use search_results for proper citations
    const searchResults = (data.search_results || []).map(function(r) {
      return {
        title: r.title || '',
        url: r.url || '',
        date: r.date || '',
        last_updated: r.last_updated || '',
        snippet: r.snippet || '',
        source: r.source || 'web'
      };
    });

    return {
      query: config.query,
      content: content,
      citations: data.citations || [],
      search_results: searchResults,
      metadata: {
        model: data.model || config.model,
        search_focus: params.search_focus || 'general_search',
        domain_filter: params.domain_filter || null,
        recency_filter: params.recency_filter || null,
        tokens: data.usage ? data.usage.total_tokens : 0,
        cost: data.usage && data.usage.cost ? data.usage.cost.total_cost : null
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { isError: true, error: 'Request timed out after ' + config.timeout + 's. Try a shorter query or increase timeout.' };
    }
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return { isError: true, error: 'Network error. Check your internet connection.' };
    }
    return { isError: true, error: 'Research failed: ' + (err.message || String(err)) };
  }
}
