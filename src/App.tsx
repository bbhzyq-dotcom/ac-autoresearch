import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ProjectList } from '@/components/layout/ProjectList';
import { useAppStore } from '@/stores/app-store';
import { llmFactory } from '@/services/llm';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const { llmConfig, setLLMConfig, currentProject } = useAppStore();

  const handleSaveSettings = (config: typeof llmConfig) => {
    if (config) {
      setLLMConfig(config);
      llmFactory.configure(config);
    }
    setShowSettings(false);
  };

  const isLLMConfigured = !!(llmConfig && llmConfig.apiKey);

  return (
    <MainLayout
      onOpenSettings={() => setShowSettings(true)}
      onOpenProjects={() => setShowProjectList(true)}
      isConfigured={isLLMConfigured}
    >
      <div className="flex flex-col h-full">
        {!isLLMConfigured ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-2xl font-bold mb-4">API Configuration Required</h2>
              <p className="text-muted-foreground mb-6">
                Please configure your API settings to start using Academic Research Web.
                You can use OpenAI GPT-4 or Anthropic Claude APIs.
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Configure API Settings
              </button>
            </div>
          </div>
        ) : (
          <ChatInterface skillName={currentProject ? getSkillForProject(currentProject.currentStage) : 'deep-research'} />
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          initialConfig={llmConfig}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProjectList && (
        <ProjectList
          onClose={() => setShowProjectList(false)}
        />
      )}
    </MainLayout>
  );
}

function getSkillForStage(stage: number): string {
  switch (stage) {
    case 1:
      return 'deep-research';
    case 2:
    case 4:
    case 5:
      return 'academic-paper';
    case 2.5:
    case 4.5:
      return 'integrity-verification';
    case 3:
    case 3.5:
      return 'academic-paper-reviewer';
    case 6:
      return 'academic-pipeline';
    default:
      return 'deep-research';
  }
}

function getSkillForProject(currentStage: number): string {
  return getSkillForStage(currentStage);
}

export default App;
