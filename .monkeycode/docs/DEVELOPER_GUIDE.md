# Academic Research Web - 开发者指南

## 项目结构

```
academic-research-web/
├── src/
│   ├── components/          # React组件
│   │   ├── ui/              # 基础UI组件
│   │   ├── layout/          # 布局组件
│   │   ├── chat/            # 聊天界面
│   │   ├── pipeline/        # Pipeline相关组件
│   │   ├── editor/          # 编辑器组件
│   │   └── settings/        # 设置组件
│   ├── agents/              # Agent实现
│   │   ├── research/        # 研究相关Agent
│   │   ├── paper/           # 论文写作Agent
│   │   ├── reviewer/        # 评审Agent
│   │   └── pipeline/        # Pipeline Agent
│   ├── skills/              # Skill定义
│   │   ├── deep-research/
│   │   ├── academic-paper/
│   │   ├── academic-paper-reviewer/
│   │   └── academic-pipeline/
│   ├── services/            # 服务层
│   │   ├── llm/             # LLM服务
│   │   ├── storage/         # 存储服务
│   │   └── websearch/       # 搜索服务
│   ├── stores/              # Zustand状态
│   ├── hooks/               # React hooks
│   ├── types/               # TypeScript类型
│   ├── utils/               # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .env.example
```

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置:

```bash
cp .env.example .env
```

编辑 `.env`:

```env
# API配置
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_DEFAULT_PROVIDER=openai
VITE_DEFAULT_MODEL=gpt-4

# 应用配置
VITE_APP_TITLE=Academic Research Web
VITE_APP_VERSION=0.1.0
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 核心概念

### Agent开发

创建新的Agent需要:

1. 定义Agent类,继承 `BaseAgent`
2. 实现 `execute` 和 `executeStream` 方法
3. 在对应的Skill中注册

```typescript
// src/agents/research/example-agent.ts
import { BaseAgent, AgentContext, AgentResponse } from '@/types';

export class ExampleAgent extends BaseAgent {
  name = 'example-agent';
  role = 'research';
  description = 'Example research agent';
  
  async execute(context: AgentContext, input: unknown): Promise<AgentResponse> {
    const messages = this.buildMessages(input);
    const response = await this.llm.chat(messages);
    
    return {
      output: this.parseOutput(response.content),
      artifacts: [],
      passport: context.passport
    };
  }
  
  private buildMessages(input: unknown): Message[] {
    return [
      { role: 'system', content: this.instructions },
      { role: 'user', content: JSON.stringify(input) }
    ];
  }
}
```

### Skill开发

Skill是多个Agent的协调器:

```typescript
// src/skills/example-skill/index.ts
import { Skill, SkillContext } from '@/types';

export const exampleSkill: Skill = {
  name: 'example-skill',
  description: 'Example skill for demonstration',
  version: '1.0.0',
  
  matchesIntent(userInput: string): boolean {
    const keywords = ['example', 'test', 'demo'];
    return keywords.some(k => userInput.toLowerCase().includes(k));
  },
  
  recommendMode(): SkillMode[] {
    return [{ mode: 'full', description: 'Full execution' }];
  },
  
  async execute(mode: string, context: SkillContext, input: unknown) {
    const agent = new ExampleAgent();
    return agent.execute(context, input);
  }
};
```

### Pipeline Stage开发

新增Pipeline阶段需要:

1. 在 `pipeline-stages.ts` 中定义阶段
2. 实现阶段的执行逻辑
3. 定义检查点类型

```typescript
// src/agents/pipeline/stages.ts
export const newStage: PipelineStage = {
  number: 7,
  name: 'NEW_STAGE',
  skill: 'new-skill',
  mode: 'full',
  mandatory: true,
  skippable: false,
  inputs: ['previous_output'],
  outputs: ['stage_output']
};
```

## LLM服务集成

### OpenAI

```typescript
import { OpenAILLM } from '@/services/llm/openai';

const openai = new OpenAILLM({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  defaultModel: 'gpt-4'
});

const response = await openai.chat([
  { role: 'user', content: 'Hello' }
], {
  temperature: 0.7,
  max_tokens: 1000
});
```

### Anthropic

```typescript
import { AnthropicLLM } from '@/services/llm/anthropic';

const anthropic = new AnthropicLLM({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  defaultModel: 'claude-3-opus-20240229'
});

const response = await anthropic.chat([
  { role: 'user', content: 'Hello' }
], {
  temperature: 0.7,
  max_tokens: 1000
});
```

## 状态管理

使用Zustand:

```typescript
// src/stores/app-store.ts
import { create } from 'zustand';

interface AppState {
  // 状态
  currentProject: Project | null;
  pipelineState: PipelineState;
  
  // actions
  setProject: (project: Project) => void;
  startPipeline: (stage: number) => void;
  completeStage: (output: unknown) => void;
  // ...
}

export const useAppStore = create<AppState>((set) => ({
  currentProject: null,
  pipelineState: { status: 'idle' },
  
  setProject: (project) => set({ currentProject: project }),
  startPipeline: (stage) => set({ 
    pipelineState: { status: 'running', stage, stageName: getStageName(stage) }
  }),
  // ...
}));
```

## 组件开发

### 创建新组件

```typescript
// src/components/example/ExampleComponent.tsx
import React from 'react';

interface ExampleProps {
  title: string;
  onAction: () => void;
}

export const ExampleComponent: React.FC<ExampleProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={onAction}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Action
      </button>
    </div>
  );
};
```

## 构建和部署

### 构建生产版本

```bash
npm run build
```

输出在 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 测试

### 运行测试

```bash
npm run test
```

### 代码检查

```bash
npm run lint
npm run typecheck
```

## 调试

### LLM调用调试

启用调试模式:

```env
VITE_DEBUG_LLM=true
```

查看完整的API请求和响应。

### Pipeline调试

查看Pipeline状态:

```typescript
// 在浏览器控制台
window.__DEBUG_PIPELINE__ = true;
```

## 性能优化

### 流式输出

使用 `executeStream` 而非 `execute`:

```typescript
const stream = agent.executeStream(context, input);
for await (const chunk of stream) {
  updateUI(chunk);
}
```

### 上下文压缩

当上下文接近限制时:

```typescript
import { compressContext } from '@/utils/context';

const compressed = compressContext(messages, {
  maxTokens: 6000,
  preserveSystem: true,
  preserveLast: 5
});
```
