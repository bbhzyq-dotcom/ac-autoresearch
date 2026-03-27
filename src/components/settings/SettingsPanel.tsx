import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { LLMConfig } from '@/types';

interface SettingsPanelProps {
  initialConfig: LLMConfig | null;
  onSave: (config: LLMConfig | null) => void;
  onClose: () => void;
}

export function SettingsPanel({ initialConfig, onSave, onClose }: SettingsPanelProps) {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>(
    initialConfig?.provider || 'openai'
  );
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [model, setModel] = useState(initialConfig?.model || 'gpt-4');
  const [showApiKey, setShowApiKey] = useState(false);
  const [temperature, setTemperature] = useState(initialConfig?.temperature || 0.7);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }
    onSave({ provider, apiKey, model, temperature });
  };

  const openaiModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  const anthropicModels = [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">API Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">API Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4');
                }}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  provider === 'openai'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">OpenAI</div>
                <div className="text-xs text-muted-foreground">GPT-4, GPT-3.5</div>
              </button>
              <button
                onClick={() => {
                  setProvider('anthropic');
                  setModel('claude-3-opus-20240229');
                }}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  provider === 'anthropic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">Anthropic</div>
                <div className="text-xs text-muted-foreground">Claude 3</div>
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 pr-10 border rounded-lg bg-background"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {provider === 'openai' ? (
                openaiModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              ) : (
                anthropicModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              )}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
