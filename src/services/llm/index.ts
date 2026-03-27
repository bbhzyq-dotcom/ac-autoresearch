import type { LLMConfig } from '@/types';
import type { LLMService } from './base';
import { OpenAILLMService } from './openai';
import { AnthropicLLMService } from './anthropic';

export type LLMProvider = 'openai' | 'anthropic';

class LLMServiceFactory {
  private services: Map<LLMProvider, LLMService> = new Map();
  private currentProvider: LLMProvider | null = null;

  registerProvider(provider: LLMProvider, service: LLMService): void {
    this.services.set(provider, service);
  }

  setProvider(provider: LLMProvider): void {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not registered`);
    }
    this.currentProvider = provider;
  }

  getProvider(): LLMProvider | null {
    return this.currentProvider;
  }

  getService(): LLMService {
    if (!this.currentProvider) {
      throw new Error('No provider selected');
    }
    const service = this.services.get(this.currentProvider);
    if (!service) {
      throw new Error(`Service for provider ${this.currentProvider} not found`);
    }
    return service;
  }

  configure(config: LLMConfig): void {
    const service = this.services.get(config.provider);
    if (!service) {
      throw new Error(`Provider ${config.provider} not registered`);
    }
    service.configure(config);
    this.currentProvider = config.provider;
  }

  isConfigured(): boolean {
    if (!this.currentProvider) return false;
    const service = this.services.get(this.currentProvider);
    return service?.isConfigured() ?? false;
  }
}

export const llmFactory = new LLMServiceFactory();

llmFactory.registerProvider('openai', new OpenAILLMService());
llmFactory.registerProvider('anthropic', new AnthropicLLMService());

export { OpenAILLMService } from './openai';
export { AnthropicLLMService } from './anthropic';
export type { LLMService } from './base';
export type { ChatOptions, ChatResponse, StreamChunk } from './base';
