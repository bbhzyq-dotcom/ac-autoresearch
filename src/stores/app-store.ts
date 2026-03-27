import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Project, 
  PipelineState, 
  Message, 
  LLMConfig, 
  UserPreferences,
  Checkpoint
} from '@/types';

interface AppState {
  // LLM配置
  llmConfig: LLMConfig | null;
  setLLMConfig: (config: LLMConfig) => void;

  // 当前项目
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // 所有项目列表
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Pipeline状态
  pipelineState: PipelineState;
  setPipelineState: (state: PipelineState) => void;
  
  // 检查点
  currentCheckpoint: Checkpoint | null;
  setCheckpoint: (checkpoint: Checkpoint | null) => void;

  // 聊天消息
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // 当前执行的Agent
  activeAgents: string[];
  setActiveAgents: (agents: string[]) => void;

  // 用户偏好
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;

  // 流式输出状态
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  citationFormat: 'APA7',
  paperType: 'IMRaD',
  wordCountTarget: 8000,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // LLM配置
      llmConfig: null,
      setLLMConfig: (config) => set({ llmConfig: config }),

      // 当前项目
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),

      // 项目列表
      projects: [],
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project],
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ),
        currentProject: state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
          : state.currentProject,
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      })),

      // Pipeline状态
      pipelineState: { status: 'idle' },
      setPipelineState: (pipelineState) => set({ pipelineState }),

      // 检查点
      currentCheckpoint: null,
      setCheckpoint: (checkpoint) => set({ currentCheckpoint: checkpoint }),

      // 消息
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      clearMessages: () => set({ messages: [] }),

      // 当前执行的Agent
      activeAgents: [],
      setActiveAgents: (agents) => set({ activeAgents: agents }),

      // 用户偏好
      preferences: defaultPreferences,
      setPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs },
      })),

      // 流式输出
      isStreaming: false,
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      streamingContent: '',
      setStreamingContent: (content) => set({ streamingContent: content }),
      appendStreamingContent: (chunk) => set((state) => ({
        streamingContent: state.streamingContent + chunk,
      })),
    }),
    {
      name: 'academic-research-storage',
      partialize: (state) => ({
        llmConfig: state.llmConfig,
        projects: state.projects,
        preferences: state.preferences,
      }),
    }
  )
);
