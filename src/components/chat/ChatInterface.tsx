import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, FileText, Users, Cog } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '@/stores/app-store';
import { llmFactory } from '@/services/llm';
import type { Message } from '@/types';

interface ChatInterfaceProps {
  skillName: string;
  mode?: string;
}

const skillIcons: Record<string, React.ReactNode> = {
  'deep-research': <BookOpen className="w-5 h-5" />,
  'academic-paper': <FileText className="w-5 h-5" />,
  'academic-paper-reviewer': <Users className="w-5 h-5" />,
  'academic-pipeline': <Cog className="w-5 h-5" />,
};

const skillDescriptions: Record<string, string> = {
  'deep-research': 'Deep academic research with 13-agent team, Socratic guided mode, and PRISMA systematic review support.',
  'academic-paper': 'Academic paper writing with 12-agent team, Style Calibration, and Writing Quality Check.',
  'academic-paper-reviewer': 'Multi-perspective peer review with EIC + 3 reviewers + Devil\'s Advocate.',
  'academic-pipeline': 'Complete 10-stage pipeline orchestrator with integrity verification.',
};

export function ChatInterface({ skillName, mode = 'auto' }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    currentProject,
    llmConfig,
  } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await processUserInput(userMessage.content, skillName, mode);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Skill Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            {skillIcons[skillName] || <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-medium capitalize">{skillName.replace(/-/g, ' ')}</h2>
            <p className="text-sm text-muted-foreground">
              {skillDescriptions[skillName] || 'Academic research assistant'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeMessage 
            skillName={skillName} 
            projectTitle={currentProject?.title}
          />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${skillName.replace(/-/g, ' ')}...`}
            disabled={isStreaming}
            className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function WelcomeMessage({ skillName, projectTitle }: { skillName: string; projectTitle?: string }) {
  const quickActions: Record<string, string[]> = {
    'deep-research': [
      'Research the impact of AI on higher education',
      'Do a systematic review on machine learning in healthcare',
      'Guide my research on climate change mitigation',
    ],
    'academic-paper': [
      'Write a paper on sustainable business practices',
      'Help me plan my paper structure',
      'Convert my citations to APA format',
    ],
    'academic-paper-reviewer': [
      'Review my paper draft',
      'Check the methodology of my research',
      'Verify my revision addressed all comments',
    ],
    'academic-pipeline': [
      'Start a complete research pipeline',
      'I have a paper ready for review',
      'Continue my current project',
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="max-w-md">
        <h3 className="text-2xl font-bold mb-2">
          {projectTitle ? `Project: ${projectTitle}` : 'Welcome to Academic Research Web'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {skillDescriptions[skillName]}
        </p>
        
        <div className="space-y-2 text-left">
          <p className="text-sm font-medium">Quick Actions:</p>
          {(quickActions[skillName] || quickActions['deep-research']).map((action, i) => (
            <div
              key={i}
              className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors text-sm"
              onClick={() => useAppStore.getState().addMessage({
                id: crypto.randomUUID(),
                role: 'user',
                content: action,
                timestamp: Date.now(),
              })}
            >
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}
      >
        <div className={`markdown-content ${isUser ? 'text-primary-foreground' : ''}`}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className={`${isUser ? 'bg-primary-foreground/10' : 'bg-muted-foreground/10'} px-1 py-0.5 rounded text-sm`}>
                    {children}
                  </code>
                ) : (
                  <pre className={`${isUser ? 'bg-primary-foreground/10' : 'bg-card'} p-3 rounded-lg overflow-x-auto mt-2`}>
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

async function processUserInput(
  userInput: string, 
  skillName: string, 
  mode: string
): Promise<string> {
  const llm = llmFactory.getService();
  
  const systemPrompt = getSystemPrompt(skillName);
  const messages: Message[] = [
    { id: '1', role: 'system', content: systemPrompt, timestamp: Date.now() },
    { id: '2', role: 'user', content: userInput, timestamp: Date.now() },
  ];

  let responseContent = '';
  
  for await (const chunk of llm.streamChat(messages)) {
    responseContent += chunk.content;
  }

  return responseContent;
}

function getSystemPrompt(skillName: string): string {
  const prompts: Record<string, string> = {
    'deep-research': `You are part of the Deep Research team (13 agents). Your role is to help users conduct rigorous academic research.
    
Available modes:
- full: Complete research report
- quick: Quick research summary
- systematic-review: PRISMA-style systematic review
- socratic: Guided research exploration
- fact-check: Fact verification
- lit-review: Literature review
- paper-review: Review research quality

When user asks research questions:
1. First analyze the research question
2. Design methodology if needed
3. Suggest search strategy
4. Help synthesize findings
5. Always cite sources properly

Use APA 7 citation format.`,
    
    'academic-paper': `You are part of the Academic Paper writing team (12 agents). Your role is to help users write academic papers.

Available modes:
- full: Complete paper writing
- plan: Socratic chapter-by-chapter guidance
- revision: Revise based on feedback
- citation-check: Check citations
- format-convert: Convert format (LaTeX, DOCX, etc.)
- bilingual-abstract: Write bilingual abstracts
- writing-polish: Polish writing style
- outline-only: Paper outline only
- lit-review: Literature review
- revision-coach: Parse reviewer comments

Paper types: IMRaD, literature review, theoretical, case study, policy brief, conference

Citation formats: APA 7 (default), Chicago, MLA, IEEE, Vancouver`,
    
    'academic-paper-reviewer': `You are part of the Academic Paper Reviewer team (7 agents). Your role is to provide multi-perspective peer review.

Review team:
- EIC: Editor-in-Chief (journal fit, novelty)
- Methodology Reviewer: Research design, statistics
- Domain Reviewer: Literature, theoretical framework
- Perspective Reviewer: Cross-disciplinary, practical impact
- Devil's Advocate: Core argument challenges
- Editorial Synthesizer: Consensus, editorial decision

Available modes:
- full: Complete 5-person review
- re-review: Verify revisions
- quick: Quick quality assessment
- methodology-focus: Deep methodology review
- guided: Socratic guided review

Quality rubric: 0-100 scoring with decision mapping (≥80 Accept, 65-79 Minor, 50-64 Major, <50 Reject)`,
    
    'academic-pipeline': `You are the Academic Pipeline Orchestrator. You coordinate the full research-to-publication workflow.

Pipeline stages:
1. RESEARCH (deep-research)
2. WRITE (academic-paper)
2.5 INTEGRITY CHECK (mandatory)
3. REVIEW (academic-paper-reviewer)
4. REVISE (academic-paper)
3' RE-REVIEW (verification)
4' RE-REVISE (final)
4.5 FINAL INTEGRITY (mandatory)
5. FINALIZE (format conversion)
6. PROCESS SUMMARY

Key features:
- Adaptive checkpoints (FULL/SLIM/MANDATORY)
- Two-stage review with Devil's Advocate
- 100% reference and data verification
- Style Calibration support
- Writing Quality Check

User can enter at any stage with existing materials.`,
  };

  return prompts[skillName] || prompts['deep-research'];
}
