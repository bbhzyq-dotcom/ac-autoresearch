# Academic Research Web - 学术研究智能助手

## 项目概述

**项目名称**: Academic Research Web (学术研究智能助手)
**项目类型**: 智能学术研究辅助 Web 应用
**核心目标**: 将 Academic Research Skills (Claude Code Skill) 转换为 Node.js Web 系统，实现从研究到论文写作、评审、修订的完整学术研究流程。
**目标用户**: 学术研究人员、高校教师、研究生

## 核心功能

### 1. Deep Research (深度研究)
- 13-agent 研究团队
- 7种研究模式: full, quick, systematic-review, socratic, fact-check, lit-review, paper-review
- Socratic 引导式研究对话
- PRISMA 系统性综述支持

### 2. Academic Paper (学术论文写作)
- 12-agent 论文写作管道
- 9种写作模式: full, plan, revision, citation-check, format-convert, bilingual-abstract, writing-polish, outline-only, lit-review, revision-coach
- Style Calibration (写作风格学习)
- Writing Quality Check (写作质量检查)
- 多格式输出: LaTeX, DOCX, PDF, Markdown

### 3. Academic Paper Reviewer (学术论文评审)
- 7-agent 多视角评审团队
- 5种评审模式: full, re-review, quick, methodology-focus, guided
- EIC + 3评审人 + Devil's Advocate
- 0-100 质量评分系统

### 4. Academic Pipeline (学术研究管道)
- 10阶段完整流程编排
- 自适应检查点系统 (FULL/SLIM/MANDATORY)
- 完整性验证 (Stage 2.5 & 4.5)
- 两阶段评审 + Socratic 修订辅导

## 技术架构

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: TailwindCSS + Radix UI
- **状态管理**: Zustand
- **构建工具**: Vite
- **Markdown渲染**: react-markdown + rehype-highlight

### 后端 (可选，轻量级)
- **框架**: Express.js (仅用于API代理和文件服务)
- **用途**: 保护API密钥、文件管理、项目状态持久化

### AI模型集成
- **支持**: OpenAI API (GPT-4) + Anthropic API (Claude)
- **配置**: .env 文件管理，支持切换

## 数据流

```
用户输入 → 前端解析意图 → 选择对应Agent团队
         ↓
    Agent团队协作 → 生成内容
         ↓
    完整性验证 → 输出结果
```

## 核心概念

### Agent (智能体)
- 每个Agent是一个独立的LLM调用单元
- Agent之间通过共享上下文协作
- 支持流式输出 (Streaming)

### Pipeline Stage (管道阶段)
- 研究管道分为多个阶段
- 每个阶段有明确的输入输出
- 阶段之间需要用户确认检查点

### Material Passport (材料护照)
- 追踪每个材料的来源、版本、验证状态
- 确保流程可追溯

## 版本信息

- **版本**: 0.1.0 (规划中)
- **更新日期**: 2026-03-27
- **基于**: Academic Research Skills v2.9
