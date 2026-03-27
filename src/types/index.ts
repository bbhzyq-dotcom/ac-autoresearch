// 消息类型
export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 材料类型
export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  content: unknown;
  createdAt: number;
  version: string;
  passport: MaterialPassport;
}

export type MaterialType = 
  | 'research_brief'
  | 'bibliography'
  | 'synthesis'
  | 'paper_draft'
  | 'review_report'
  | 'integrity_report'
  | 'response'
  | 'final'
  | 'other';

// 材料护照
export interface MaterialPassport {
  id: string;
  version: string;
  originSkill: string;
  originMode: string;
  originDate: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'STALE';
  contentHash: string;
}

// Agent上下文
export interface AgentContext {
  projectId: string;
  skillName: string;
  mode: string;
  materials: Record<string, Material>;
  passport: MaterialPassport;
  userPreferences: UserPreferences;
  messages: Message[];
}

// 用户偏好
export interface UserPreferences {
  language: 'en' | 'zh';
  citationFormat: CitationFormat;
  paperType: PaperType;
  targetJournal?: string;
  wordCountTarget: number;
  styleProfile?: StyleProfile;
}

export type CitationFormat = 'APA7' | 'Chicago' | 'MLA' | 'IEEE' | 'Vancouver';
export type PaperType = 'IMRaD' | 'literature_review' | 'theoretical' | 'case_study' | 'policy_brief' | 'conference';

// 风格配置
export interface StyleProfile {
  sentenceRhythm: 'short' | 'medium' | 'long';
  vocabularyLevel: 'simple' | 'moderate' | 'academic';
  citationIntegration: 'minimal' | 'moderate' | 'extensive';
  voiceLevel: 'passive' | 'active' | 'mixed';
  paragraphLength: 'short' | 'medium' | 'long';
  hedgingLevel: 'minimal' | 'moderate' | 'strong';
}

// LLM配置
export interface LLMConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Pipeline阶段
export interface PipelineStage {
  number: number;
  name: string;
  skill: string;
  mode: string;
  mandatory: boolean;
  skippable: boolean;
  inputs: string[];
  outputs: string[];
}

// Pipeline状态
export type PipelineState = 
  | { status: 'idle' }
  | { status: 'running'; stage: number; stageName: string }
  | { status: 'awaiting_confirmation'; stage: number; stageName: string }
  | { status: 'paused'; completedStages: number[] }
  | { status: 'completed'; summary: ProcessSummary }
  | { status: 'failed'; error: string };

// 流程总结
export interface ProcessSummary {
  topic: string;
  startedAt: string;
  completedAt: string;
  totalStages: number;
  stages: StageResult[];
  collaborationScore: CollaborationScore;
}

export interface StageResult {
  stage: number;
  name: string;
  mode: string;
  output: unknown;
  duration: number;
}

export interface CollaborationScore {
  overall: number;
  dimensions: {
    directionSetting: number;
    intellectualContribution: number;
    qualityGatekeeping: number;
    iterationDiscipline: number;
    delegationEfficiency: number;
    metaLearning: number;
  };
}

// 项目
export interface Project {
  id: string;
  title: string;
  topic: string;
  createdAt: number;
  updatedAt: number;
  currentStage: number;
  stageStatus: string;
  materials: Material[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  language: 'en' | 'zh';
  citationFormat: CitationFormat;
  paperType: PaperType;
  targetJournal?: string;
  wordCountTarget: number;
}

// 检查点
export interface Checkpoint {
  type: 'FULL' | 'SLIM' | 'MANDATORY';
  stage: number;
  stageName: string;
  completed: boolean;
  metrics?: {
    wordCount?: number;
    referenceCount?: number;
    sectionCoverage?: number;
    qualityScore?: number;
  };
}

// 完整性报告
export interface IntegrityReport {
  verdict: 'PASS' | 'PASS_WITH_NOTES' | 'FAIL';
  phases: {
    phaseA: ReferencePhase;
    phaseB: CitationPhase;
    phaseC: DataPhase;
    phaseD: OriginalityPhase;
    phaseE: ClaimPhase;
  };
  issues: IntegrityIssue[];
}

export interface ReferencePhase {
  total: number;
  verified: number;
  issues: IntegrityIssue[];
}

export interface CitationPhase {
  total: number;
  checked: number;
  issues: IntegrityIssue[];
}

export interface DataPhase {
  total: number;
  verified: number;
  issues: IntegrityIssue[];
}

export interface OriginalityPhase {
  grade: 'ORIGINAL' | 'COMMON_KNOWLEDGE' | 'PARAPHRASE' | 'CLOSE_MATCH' | 'VERBATIM';
  issues: IntegrityIssue[];
}

export interface ClaimPhase {
  total: number;
  verified: number;
  issues: IntegrityIssue[];
}

export interface IntegrityIssue {
  severity: 'SERIOUS' | 'MEDIUM' | 'MINOR';
  category: 'reference' | 'citation' | 'data' | 'originality' | 'claim';
  location: string;
  description: string;
  correction?: string;
  source?: string;
}

// 评审报告
export interface ReviewReport {
  reviewerId: string;
  reviewerRole: string;
  strengths: string[];
  weaknesses: ReviewWeakness[];
  overallScore: number;
  confidence: number;
}

export interface ReviewWeakness {
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  dimension: string;
  description: string;
  suggestion: string;
  location?: string;
}

// 评审决定
export interface EditorialDecision {
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  scores: {
    originality: number;
    methodologicalRigor: number;
    evidenceSufficiency: number;
    argumentCoherence: number;
    writingQuality: number;
  };
  consensusLevel: 'CONSENSUS' | 'SPLIT' | 'DA_CRITICAL';
  revisionRoadmap: RevisionItem[];
}

export interface RevisionItem {
  priority: 1 | 2 | 3;
  reviewer: string;
  originalComment: string;
  requiredAction: string;
  section?: string;
  status?: 'RESOLVED' | 'PARTIALLY_ADDRESSED' | 'NOT_ADDRESSED' | 'DELIBERATE_LIMITATION';
}

// Agent响应
export interface AgentResponse {
  output: unknown;
  artifacts: Material[];
  messages: Message[];
}

// Skill定义
export interface Skill {
  name: string;
  description: string;
  version: string;
  matchesIntent(userInput: string): boolean;
  getModes(): SkillMode[];
  execute(mode: string, context: AgentContext, input: unknown): Promise<AgentResponse>;
}

export interface SkillMode {
  mode: string;
  description: string;
  agents: string[];
}
