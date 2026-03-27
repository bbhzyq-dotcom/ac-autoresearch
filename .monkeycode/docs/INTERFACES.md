# Academic Research Web - 接口文档

## LLM服务接口

### 聊天完成接口

```typescript
// 请求
interface ChatRequest {
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  messages: Message[];
  temperature?: number;  // 默认 0.7
  max_tokens?: number;   // 默认 4096
  stream?: boolean;      // 默认 false
  tools?: Tool[];
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 响应
interface ChatResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}
```

### 工具调用接口

```typescript
interface Tool {
  name: string;
  description: string;
  input_schema: object;
}

interface ToolCallRequest extends ChatRequest {
  tool_choice?: 'auto' | 'none';
}

interface ToolCallResponse {
  content: string;
  tool_calls?: {
    id: string;
    name: string;
    input: object;
  }[];
}
```

## Agent接口

### Base Agent

```typescript
interface BaseAgent {
  id: string;
  name: string;
  role: 'research' | 'writing' | 'review' | 'verification' | 'orchestration';
  description: string;
  instructions: string;
  
  execute(context: AgentContext, input: unknown): Promise<AgentResponse>;
  executeStream(context: AgentContext, input: unknown): AsyncGenerator<string>;
}

interface AgentContext {
  projectId: string;
  skillName: string;
  mode: string;
  materials: Record<string, Material>;
  passport: MaterialPassport;
  userPreferences: UserPreferences;
}

interface AgentResponse {
  output: unknown;
  artifacts: Material[];
  passport: MaterialPassport;
}
```

### Research Agents

```typescript
// 研究问题Agent
interface ResearchQuestionAgent extends BaseAgent {
  execute(context: AgentContext, topic: string): Promise<ResearchBrief>;
}

interface ResearchBrief {
  research_question: string;
  finer_score: {
    feasible: number;
    interesting: number;
    notable: number;
    ethical: number;
    relevant: number;
  };
  keywords: string[];
  suggested_methodology: string;
}

// 文献检索Agent
interface BibliographyAgent extends BaseAgent {
  execute(context: AgentContext, params: SearchParams): Promise<Bibliography>;
}

interface SearchParams {
  keywords: string[];
  databases: string[];
  inclusion_criteria: string[];
  exclusion_criteria: string[];
}

interface Bibliography {
  sources: Source[];
  search_strategy: string;
  inclusion_matrix: string[][];
}

// 溯源验证Agent
interface SourceVerificationAgent extends BaseAgent {
  execute(context: AgentContext, sources: Source[]): Promise<VerifiedSources>;
}

interface Source {
  id: string;
  type: 'journal' | 'book' | 'conference' | 'thesis' | 'web';
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  url?: string;
}

interface VerifiedSources extends Bibliography {
  verification_results: {
    source_id: string;
    status: 'VERIFIED' | 'NOT_FOUND' | 'MISMATCH' | 'UNVERIFIABLE';
    evidence: string;
    issues?: string[];
  }[];
  quality_scores: {
    source_id: string;
    credibility: number;  // 0-100
    relevance: number;     // 0-100
    currency: number;      // 0-100
  }[];
}
```

### Writing Agents

```typescript
// 论文写作Agent
interface AcademicPaperAgent extends BaseAgent {
  modes: {
    full: FullModeConfig;
    plan: PlanModeConfig;
    revision: RevisionModeConfig;
    citation_check: CitationCheckConfig;
    format_convert: FormatConvertConfig;
  };
}

interface PaperConfiguration {
  paper_type: 'IMRaD' | 'literature_review' | 'theoretical' | 
              'case_study' | 'policy_brief' | 'conference';
  discipline: string;
  target_journal?: string;
  citation_format: 'APA7' | 'Chicago' | 'MLA' | 'IEEE' | 'Vancouver';
  output_format: ('LaTeX' | 'DOCX' | 'PDF' | 'Markdown')[];
  language: 'EN' | 'ZH' | 'bilingual';
  word_count_target: number;
}

interface PaperDraft {
  title: string;
  abstract_en: string;
  abstract_zh: string;
  keywords_en: string[];
  keywords_zh: string[];
  sections: {
    name: string;
    content: string;
    word_count: number;
  }[];
  references: Reference[];
  figures?: Figure[];
  tables?: Table[];
}
```

### Review Agents

```typescript
// 论文评审Agent
interface PaperReviewerAgent extends BaseAgent {
  modes: {
    full: FullReviewConfig;
    re_review: ReReviewConfig;
    quick: QuickReviewConfig;
    methodology_focus: MethodologyFocusConfig;
    guided: GuidedReviewConfig;
  };
}

interface ReviewerPersona {
  id: string;
  role: 'EIC' | 'methodology' | 'domain' | 'perspective' | 'devils_advocate';
  name: string;
  expertise: string[];
  institution: string;
  review_focus: string[];
}

interface ReviewReport {
  reviewer_id: string;
  reviewer_role: string;
  strengths: string[];
  weaknesses: {
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    dimension: string;
    description: string;
    suggestion: string;
    location?: string;
  }[];
  overall_score: number;  // 0-100
  confidence: number;     // 0-100
}

interface EditorialDecision {
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  scores: {
    originality: number;
    methodological_rigor: number;
    evidence_sufficiency: number;
    argument_coherence: number;
    writing_quality: number;
  };
  consensus_level: 'CONSENSUS' | 'SPLIT' | 'DA_CRITICAL';
  revision_roadmap: RevisionItem[];
}

interface RevisionItem {
  priority: 1 | 2 | 3;
  reviewer: string;
  original_comment: string;
  required_action: string;
  section?: string;
  status?: 'RESOLVED' | 'PARTIALLY_ADDRESSED' | 'NOT_ADDRESSED' | 'DELIBERATE_LIMITATION';
}
```

## Pipeline接口

```typescript
// Pipeline编排器
interface PipelineOrchestrator extends BaseAgent {
  stages: PipelineStage[];
  
  detectEntryPoint(userInput: string): StageNumber;
  recommendModes(entryPoint: StageNumber, userType: UserType): ModeRecommendation;
  executeStage(stage: PipelineStage, context: AgentContext): Promise<StageOutput>;
  handleCheckpoint(stage: PipelineStage, output: StageOutput): Promise<CheckpointDecision>;
}

interface PipelineStage {
  number: 1 | 2 | 2.5 | 3 | 4 | 3.5 | 4.5 | 5 | 6;
  name: string;
  skill: string;
  mode: string;
  mandatory: boolean;
  skippable: boolean;
  inputs: string[];
  outputs: string[];
}

interface Checkpoint {
  type: 'FULL' | 'SLIM' | 'MANDATORY';
  stage: PipelineStage;
  output: StageOutput;
  metrics: {
    word_count?: number;
    reference_count?: number;
    section_coverage?: number;
    quality_score?: number;
  };
}

interface CheckpointDecision {
  action: 'continue' | 'pause' | 'adjust' | 'rollback' | 'skip' | 'abort';
  nextStage?: PipelineStage;
  settings?: Partial<PipelineSettings>;
}
```

## 完整性验证接口

```typescript
// 完整性验证Agent
interface IntegrityVerificationAgent extends BaseAgent {
  modes: {
    initial: InitialVerificationConfig;  // Stage 2.5
    final: FinalVerificationConfig;      // Stage 4.5
  };
}

interface IntegrityReport {
  verdict: 'PASS' | 'PASS_WITH_NOTES' | 'FAIL';
  phases: {
    phase_a: {
      total: number;
      verified: number;
      issues: IntegrityIssue[];
    };
    phase_b: {
      total: number;
      checked: number;
      issues: IntegrityIssue[];
    };
    phase_c: {
      total: number;
      verified: number;
      issues: IntegrityIssue[];
    };
    phase_d: {
      originality_grade: 'ORIGINAL' | 'COMMON_KNOWLEDGE' | 'PARAPHRASE' | 'CLOSE_MATCH' | 'VERBATIM';
      issues: IntegrityIssue[];
    };
    phase_e: {
      claims_verified: number;
      distortions: number;
      issues: IntegrityIssue[];
    };
  };
  audit_trail: AuditEntry[];
}

interface IntegrityIssue {
  severity: 'SERIOUS' | 'MEDIUM' | 'MINOR';
  category: 'reference' | 'citation' | 'data' | 'originality' | 'claim';
  location: string;
  description: string;
  correction?: string;
  source?: string;
}
```

## 存储接口

```typescript
// 项目存储
interface ProjectStorage {
  // 项目CRUD
  createProject(project: Project): Promise<string>;
  getProject(id: string): Promise<Project | null>;
  updateProject(id: string, updates: Partial<Project>): Promise<void>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<ProjectMeta[]>;
  
  // 材料管理
  saveMaterial(projectId: string, material: Material): Promise<void>;
  getMaterial(projectId: string, materialId: string): Promise<Material | null>;
  listMaterials(projectId: string): Promise<MaterialMeta[]>;
}

interface Project {
  id: string;
  title: string;
  topic: string;
  created_at: string;
  updated_at: string;
  current_stage: number;
  stage_status: string;
  materials: Material[];
  passport: MaterialPassport;
  settings: ProjectSettings;
}

interface Material {
  id: string;
  type: 'research_brief' | 'bibliography' | 'synthesis' | 'paper_draft' | 
        'review_report' | 'integrity_report' | 'response' | 'final';
  name: string;
  content: unknown;
  created_at: string;
  version: string;
  passport: MaterialPassport;
}
```

## 前端组件接口

```typescript
// React组件props接口
interface MainLayoutProps {
  children: React.ReactNode;
}

interface ChatInterfaceProps {
  skillName: string;
  mode: string;
  onSendMessage: (message: string) => void;
  messages: Message[];
  isStreaming: boolean;
}

interface AgentOutputProps {
  output: unknown;
  type: 'text' | 'markdown' | 'json' | 'file';
}

interface PipelineDashboardProps {
  currentStage: number;
  stages: PipelineStageStatus[];
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
}

interface SettingsPanelProps {
  apiProvider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  temperature: number;
  onSave: (settings: AppSettings) => void;
}
```

## 事件接口

```typescript
// 应用事件
type AppEvent = 
  | { type: 'PROJECT_CREATED'; project: Project }
  | { type: 'STAGE_STARTED'; stage: PipelineStage }
  | { type: 'STAGE_COMPLETED'; stage: PipelineStage; output: StageOutput }
  | { type: 'CHECKPOINT_REACHED'; checkpoint: Checkpoint }
  | { type: 'AGENT_OUTPUT'; agentId: string; output: string }
  | { type: 'ERROR'; source: string; error: Error }
  | { type: 'SETTINGS_CHANGED'; settings: AppSettings };

// SSE事件流
interface SSEEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}
```
