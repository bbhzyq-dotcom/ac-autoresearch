import type { Message, LLMConfig } from '@/types';

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface LLMService {
  configure(config: LLMConfig): void;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamChunk>;
  isConfigured(): boolean;
}

export abstract class BaseLLMService implements LLMService {
  protected config: LLMConfig | null = null;

  abstract chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  abstract streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamChunk>;

  configure(config: LLMConfig): void {
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.apiKey;
  }

  protected abstract buildRequestBody(messages: Message[], options?: ChatOptions): object;
  protected abstract parseResponse(response: unknown): ChatResponse;
}
