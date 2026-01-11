import Anthropic from '@anthropic-ai/sdk';

// Lazily initialize the client to avoid errors during build/module evaluation
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    // Get API key from environment variables
    // Note: In Next.js, server-side env vars don't need NEXT_PUBLIC_ prefix
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Debug logging to help diagnose env var loading issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Anthropic API Key Check:', {
      exists: !!apiKey,
        length: apiKey?.length || 0,
        prefix: apiKey?.substring(0, 10) || 'N/A',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')),
      });
    }

    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. ' +
        'Please add it to your .env file. ' +
        'If you\'re using Turbopack with paths containing spaces, try: ' +
        '1. Restart the dev server, 2. Check .env file location, 3. Use absolute paths in .env'
      );
    }

    _anthropic = new Anthropic({
      apiKey,
    });
  }
  return _anthropic;
}

export const anthropic = new Proxy({} as Anthropic, {
  get(target, prop) {
    const client = getAnthropicClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Use the alias format recommended by Anthropic (automatically uses latest version)
// Full dated identifier: 'claude-sonnet-4-5-20250929'
// See: https://docs.anthropic.com/en/docs/about-claude/models
export const CLAUDE_MODEL = 'claude-sonnet-4-5';
