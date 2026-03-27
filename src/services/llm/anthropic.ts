import type { Message, LLMConfig } from '@/types';
import type { ChatOptions, ChatResponse, StreamChunk, LLMService } from './base';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export class AnthropicLLMService implements LLMService {
  private config: LLMConfig | null = null;

  configure(config: LLMConfig): void {
    if (config.provider !== 'anthropic') {
      throw new Error('Invalid provider for AnthropicLLMService');
    }
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.apiKey;
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.config) {
      throw new Error('LLM not configured');
    }

    const { anthropicMessages, systemMessage } = this.convertMessages(messages);
    
    const body: Record<string, unknown> = {
      model: this.config.model || 'claude-3-opus-20240229',
      messages: anthropicMessages,
      max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
    };

    if (systemMessage) {
      body.system = systemMessage;
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  async *streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.config) {
      throw new Error('LLM not configured');
    }

    const { anthropicMessages, systemMessage } = this.convertMessages(messages);
    
    const body: Record<string, unknown> = {
      model: this.config.model || 'claude-3-opus-20240229',
      messages: anthropicMessages,
      max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
      stream: true,
    };

    if (systemMessage) {
      body.system = systemMessage;
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text || '';
                if (content) {
                  yield { content, done: false };
                }
              } else if (parsed.type === 'message_stop') {
                yield { content: '', done: true };
                return;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { content: '', done: true };
  }

  private convertMessages(messages: Message[]): { anthropicMessages: Array<{role: string; content: string}>, systemMessage?: string } {
    let systemMessage: string | undefined;
    const convertedMessages: Array<{role: string; content: string}> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessage = (systemMessage ? systemMessage + '\n\n' : '') + msg.content;
      } else {
        convertedMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    return { anthropicMessages: convertedMessages, systemMessage };
  }

  private parseResponse(data: any): ChatResponse {
    const content = data.content?.[0]?.text || '';
    return {
      content,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model || 'claude-3-opus',
    };
  }
}
