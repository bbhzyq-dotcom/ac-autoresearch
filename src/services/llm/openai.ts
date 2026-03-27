import type { Message, LLMConfig } from '@/types';
import type { ChatOptions, ChatResponse, StreamChunk, LLMService } from './base';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAILLMService implements LLMService {
  private config: LLMConfig | null = null;

  configure(config: LLMConfig): void {
    if (config.provider !== 'openai') {
      throw new Error('Invalid provider for OpenAILLMService');
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

    const body = this.buildRequestBody(messages, options);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  async *streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.config) {
      throw new Error('LLM not configured');
    }

    const body = this.buildRequestBody(messages, { ...options, stream: true });
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
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
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
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

  private buildRequestBody(messages: Message[], options?: ChatOptions): object {
    if (!this.config) {
      throw new Error('LLM not configured');
    }

    return {
      model: this.config.model || 'gpt-4',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? this.config.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
      stream: options?.stream ?? false,
    };
  }

  private parseResponse(data: any): ChatResponse {
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model || 'gpt-4',
    };
  }
}
