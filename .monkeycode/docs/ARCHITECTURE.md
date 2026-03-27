# Academic Research Web - 系统架构

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Academic Research Web                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Web UI    │◄──►│  Agent Core │◄──►│  AI Model Gateway   │ │
│  │  (React)    │    │  (Browser)   │    │  (OpenAI/Anthropic) │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│         │                  │                      │           │
│         │                  ▼                      │           │
│         │         ┌─────────────┐                 │           │
│         │         │   Pipeline  │                 │           │
│         │         │   Manager   │                 │           │
│         │         └─────────────┘                 │           │
│         │                  │                      │           │
│         ▼                  ▼                      ▼           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Local Storage                             ││
│  │  (Projects, Papers, Research Materials, Session State)      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. Agent Core (智能体核心)

负责在各技能(Skill)中协调多个Agent的工作。

```
Agent Core
├── agents/
│   ├── research-question-agent.ts
│   ├── research-architect-agent.ts
│   ├── bibliography-agent.ts
│   ├── source-verification-agent.ts
│   ├── synthesis-agent.ts
│   ├── report-compiler-agent.ts
│   ├── editor-in-chief-agent.ts
│   ├── devils-advocate-agent.ts
│   ├── ethics-review-agent.ts
│   ├── socratic-mentor-agent.ts
│   ├── risk-of-bias-agent.ts
│   ├── meta-analysis-agent.ts
│   └── monitoring-agent.ts
├── skills/
│   ├── deep-research/
│   ├── academic-paper/
│   ├── academic-paper-reviewer/
│   └── academic-pipeline/
└── services/
    ├── llm-service.ts
    └── websearch-service.ts
```

#### Agent 协作模式

**并行模式**: 多个Agent同时处理不同子任务
```typescript
// 例如：5个评审人同时评审
await Promise.all([
  eicAgent.review(paper),
  methodologyReviewer.review(paper),
  domainReviewer.review(paper),
  perspectiveReviewer.review(paper),
  devilsAdvocate.review(paper)
]);
```

**串行模式**: Agent按顺序处理依赖任务
```typescript
// 例如：论文写作流程
const config = await intakeAgent.configure();
const literature = await literatureStrategist.search(config);
const outline = await structureArchitect.buildOutline(literature);
const draft = await draftWriter.write(outline);
```

### 2. LLM Service (大语言模型服务)

统一接口调用不同的AI模型。

```typescript
interface LLMService {
  // 配置
  configure(provider: 'openai' | 'anthropic', apiKey: string, model?: string): void;
  
  // 聊天完成
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  
  // 流式聊天
  streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<string>;
  
  // 工具调用
  toolCall(messages: Message[], tools: Tool[]): Promise<ToolCallResponse>;
}
```

### 3. Pipeline Manager (流程管理器)

协调多阶段学术研究管道。

```
Pipeline Stages
├── Stage 1: RESEARCH (deep-research)
│   └── 13-agent research team
├── Stage 2: WRITE (academic-paper)
│   └── 12-agent writing team
├── Stage 2.5: INTEGRITY CHECK
│   └── integrity-verification-agent
├── Stage 3: REVIEW (academic-paper-reviewer)
│   └── 7-agent review team
├── Stage 4: REVISE
│   └── revision workflow
├── Stage 3': RE-REVIEW
│   └── verification review
├── Stage 4': RE-REVISE
│   └── final revision
├── Stage 4.5: FINAL INTEGRITY
│   └── final verification
├── Stage 5: FINALIZE
│   └── format conversion
└── Stage 6: PROCESS SUMMARY
    └── collaboration report
```

### 4. Material Passport (材料护照)

追踪每个材料的元数据。

```typescript
interface MaterialPassport {
  id: string;
  version: string;
  origin_skill: string;
  origin_mode: string;
  origin_date: string;
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'STALE';
  content_hash: string;
}
```

## 数据流

### 研究管道数据流

```
用户输入
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Pipeline Orchestrator                                        │
│  ├── 检测入口阶段                                             │
│  ├── 推荐模式                                                 │
│  ├── 调度技能                                                 │
│  ├── 管理转换                                                 │
│  └── 跟踪状态                                                 │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 1: RESEARCH                                           │
│  Input: 用户主题                                              │
│  Output: RQ Brief + Bibliography + Synthesis                │
│  Agents: research-question → research-architect →           │
│          bibliography → source-verification → synthesis      │
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [用户确认]
┌──────────────────────────────────────────────────────────────┐
│  Stage 2: WRITE                                             │
│  Input: Research materials                                  │
│  Output: Paper Draft                                         │
│  Agents: intake → literature-strategist →                   │
│          structure-architect → argument-builder →            │
│          draft-writer → citation-compliance                  │
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [用户确认]
┌──────────────────────────────────────────────────────────────┐
│  Stage 2.5: INTEGRITY CHECK                                  │
│  Input: Paper Draft                                          │
│  Output: Integrity Report + Verified Paper                  │
│  Verification: 100% refs + citation context + data +        │
│                originality + claims                          │
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [必须PASS]
┌──────────────────────────────────────────────────────────────┐
│  Stage 3: REVIEW                                            │
│  Input: Verified Paper                                       │
│  Output: 5 Review Reports + Editorial Decision + Roadmap    │
│  Agents: field-analyst → eic + 3 reviewers + devil's-advocate
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [用户确认]
┌──────────────────────────────────────────────────────────────┐
│  Stage 4: REVISE                                            │
│  Input: Review Reports + Roadmap                            │
│  Output: Revised Draft + Response to Reviewers              │
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [循环直到通过]
┌──────────────────────────────────────────────────────────────┐
│  Stage 4.5: FINAL INTEGRITY                                 │
│  Input: Revised Draft                                        │
│  Output: Final Integrity Report (必须100%通过)              │
└──────────────────────────────────────────────────────────────┘
    │
    ▼ [必须PASS]
┌──────────────────────────────────────────────────────────────┐
│  Stage 5: FINALIZE                                          │
│  Input: Final Draft                                          │
│  Output: MD + DOCX + LaTeX + PDF                            │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 6: PROCESS SUMMARY                                    │
│  Input: All pipeline artifacts                               │
│  Output: Paper Creation Process Record + PDF                 │
└──────────────────────────────────────────────────────────────┘
```

## 组件接口

### Agent接口

```typescript
interface Agent {
  name: string;
  role: string;
  instructions: string;
  
  // 执行
  execute(context: Context, input: unknown): Promise<AgentOutput>;
  
  // 流式执行
  executeStream(context: Context, input: unknown): AsyncGenerator<string>;
}

interface Context {
  projectId: string;
  stageId: string;
  materials: Map<string, Material>;
  passport: MaterialPassport;
}
```

### Skill接口

```typescript
interface Skill {
  name: string;
  description: string;
  version: string;
  
  // 触发条件
  matchesIntent(userInput: string): boolean;
  
  // 获取推荐模式
  recommendMode(userInput: string, context: Context): SkillMode[];
  
  // 执行
  execute(mode: string, context: Context, input: unknown): Promise<SkillOutput>;
}
```

## 状态管理

使用 Zustand 进行状态管理。

```typescript
interface AppState {
  // 当前项目
  currentProject: Project | null;
  
  // Pipeline状态
  pipelineState: PipelineState;
  
  // Agent执行状态
  agentStates: Map<string, AgentState>;
  
  // 用户偏好
  preferences: UserPreferences;
}

// Pipeline状态机
type PipelineState = 
  | { status: 'idle' }
  | { status: 'running'; stage: number; stageName: string }
  | { status: 'awaiting_confirmation'; stage: number }
  | { status: 'paused'; completedStages: number[] }
  | { status: 'completed'; summary: ProcessSummary }
  | { status: 'failed'; error: string };
```

## 错误处理

### Agent错误处理

```typescript
class AgentError extends Error {
  constructor(
    message: string,
    public agentName: string,
    public stage: string,
    public retryable: boolean
  ) {}
}

// 错误恢复策略
const errorHandling: Record<string, () => Promise<void>> = {
  'timeout': async () => { /* 重试 */ },
  'rate_limit': async () => { /* 等待后重试 */ },
  'invalid_response': async () => { /* 重新生成 */ },
  'context_overflow': async () => { /* 压缩上下文 */ }
};
```

### Pipeline错误恢复

```typescript
interface PipelineErrorRecovery {
  stage: string;
  failureType: string;
  strategy: 'retry' | 'skip' | 'rollback' | 'abort';
  fallbackMode?: string;
}
```

## 性能优化

### 流式输出
- 所有Agent支持流式输出
- 使用 Server-Sent Events (SSE) 前端渲染

### 上下文压缩
- 当上下文超出限制时，自动压缩历史消息
- 保留关键信息：用户偏好、项目状态、最新输出

### 并行执行
- 独立的Agent可并行运行
- 使用 Promise.all 并行化

## 安全考虑

### API密钥保护
- API密钥存储在 .env 文件
- 不在前端代码中暴露
- 使用后端代理调用AI API（可选）

### 数据隔离
- 每个项目的数据独立存储
- 使用 localStorage 的项目隔离机制

### 内容过滤
- 对输出内容进行安全过滤
- 防止生成有害内容
