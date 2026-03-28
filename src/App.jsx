import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Hash, Grid3x3, GitBranch, BarChart2, BookOpen,
  ChevronRight, ChevronLeft, Beaker, Sparkles, GitFork
} from 'lucide-react';
import { tokenize } from './tokenizer';
import StageTokenization from './StageTokenization';
import StageEmbedding from './StageEmbedding';
import StageAttention from './StageAttention';
import StageLogits from './StageLogits';
import Sidebar from './Sidebar';

const STAGES = [
  {
    id: 0,
    key: 'tokenization',
    label: 'Tokenization',
    short: 'Tokens',
    icon: Hash,
    color: '#ffad11',
    desc: 'Text → Token IDs via cl100k_base',
  },
  {
    id: 1,
    key: 'embedding',
    label: 'Embedding Space',
    short: 'Embeddings',
    icon: Grid3x3,
    color: '#818cf8',
    desc: 'Token IDs → Dense Vectors',
  },
  {
    id: 2,
    key: 'attention',
    label: 'Self-Attention',
    short: 'Attention',
    icon: GitBranch,
    color: '#34d399',
    desc: 'Tokens attend to context',
  },
  {
    id: 3,
    key: 'logits',
    label: 'Output Logits',
    short: 'Logits',
    icon: BarChart2,
    color: '#f472b6',
    desc: 'Predict next token',
  },
];

export default function App() {
  const [input, setInput] = useState('AI is simple');
  const [tokens, setTokens] = useState(() => tokenize('AI is simple'));
  const [stage, setStage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live preview token count — memoised so tokenize() only re-runs when input changes
  const previewCount = useMemo(() => tokenize(input).length, [input]);

  const handleVisualize = useCallback(() => {
    const newTokens = tokenize(input);
    setTokens(newTokens);
    setStage(0);
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleVisualize();
  };

  const canGoNext = stage < STAGES.length - 1;
  const canGoPrev = stage > 0;

  const StageComponent = [StageTokenization, StageEmbedding, StageAttention, StageLogits][stage];
  const currentStage = STAGES[stage];

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020617' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,173,17,0.15)', border: '1px solid rgba(255,173,17,0.4)' }}
            >
              <Beaker size={14} style={{ color: '#ffad11' }} />
            </div>
            <div>
              <div className="text-xs text-slate-500 leading-none mb-0.5 font-medium tracking-widest uppercase">Eureka Labs</div>
              <div className="text-sm font-bold text-white leading-none tracking-tight">LLM101n Visualizer</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/karpathy/LLM101n"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600"
            >
              <GitFork size={13} />
              LLM101n
            </a>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200"
              style={{
                color: '#ffad11',
                borderColor: 'rgba(255,173,17,0.4)',
                background: 'rgba(255,173,17,0.08)',
              }}
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Learn More</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero tagline ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border"
            style={{ color: '#ffad11', borderColor: 'rgba(255,173,17,0.3)', background: 'rgba(255,173,17,0.08)' }}
          >
            <Sparkles size={11} />
            Interactive · Based on Karpathy's LLM101n
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            How does an <span style={{ color: '#ffad11' }}>LLM</span> work?
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Type any text and step through every stage of a large language model —
            from raw bytes to predicted tokens.
          </p>
        </motion.div>

        {/* ── Input Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-800 overflow-hidden"
          style={{ background: '#0f172a' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <Cpu size={14} style={{ color: '#ffad11' }} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Input Text</span>
            <span className="ml-auto text-xs text-slate-600">⌘+Enter to visualize</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder='e.g. "AI is simple"'
            className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-700 text-base resize-none outline-none mono"
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-600">
              {input.length} chars · {previewCount} tokens (cl100k_base)
            </span>
            <button
              onClick={handleVisualize}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ffad11, #f59e0b)',
                color: '#020617',
                boxShadow: '0 4px 20px rgba(255,173,17,0.3)',
              }}
            >
              <Sparkles size={14} />
              Visualize
            </button>
          </div>
        </motion.div>

        {/* ── Stage Stepper ── */}
        <div>
          {/* Step indicators */}
          <div className="relative flex items-start justify-between mb-6">
            {/* Connector line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-slate-800 -z-0" style={{ margin: '0 40px' }} />
            <div
              className="absolute top-4 left-0 h-px bg-gradient-to-r from-transparent transition-all duration-500"
              style={{
                margin: '0 40px',
                width: `calc(${(stage / (STAGES.length - 1)) * 100}% - 0px)`,
                background: 'linear-gradient(90deg, #ffad11, #f59e0b)',
              }}
            />

            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stage;
              const isDone = i < stage;
              return (
                <button
                  key={s.id}
                  onClick={() => setStage(i)}
                  className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group transition-all"
                  style={{ width: '25%' }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    animate={{
                      borderColor: isActive ? s.color : isDone ? s.color : '#334155',
                      background: isActive ? `${s.color}22` : isDone ? `${s.color}15` : 'rgba(15,23,42,1)',
                      scale: isActive ? 1.1 : 1,
                    }}
                  >
                    <Icon size={14} style={{ color: isActive || isDone ? s.color : '#475569' }} />
                  </motion.div>
                  <div className="text-center">
                    <div className="hidden sm:block text-xs font-semibold"
                      style={{ color: isActive ? s.color : isDone ? '#94a3b8' : '#475569' }}
                    >
                      {s.short}
                    </div>
                    <div className="text-[10px] text-slate-600 hidden md:block">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stage Card */}
          <motion.div
            className="rounded-2xl border overflow-hidden"
            style={{ background: '#0f172a', borderColor: `${currentStage.color}30` }}
            animate={{ boxShadow: `0 0 30px ${currentStage.color}0a` }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b"
              style={{ borderColor: `${currentStage.color}20`, background: `${currentStage.color}08` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${currentStage.color}20`, border: `1px solid ${currentStage.color}40` }}
              >
                <currentStage.icon size={16} style={{ color: currentStage.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Stage {stage + 1} of {STAGES.length}</span>
                </div>
                <div className="font-bold text-white text-base leading-tight">{currentStage.label}</div>
              </div>
              <div className="ml-auto text-xs mono"
                style={{ color: currentStage.color }}
              >
                {currentStage.desc}
              </div>
            </div>

            {/* Stage body */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: 18, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -18, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  <StageComponent tokens={tokens} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
              <button
                onClick={() => setStage(s => s - 1)}
                disabled={!canGoPrev}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: '#334155', color: '#94a3b8' }}
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <div className="flex gap-1.5">
                {STAGES.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: i === stage ? currentStage.color : '#334155' }}
                  />
                ))}
              </div>
              <button
                onClick={() => setStage(s => s + 1)}
                disabled={!canGoNext}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
                style={{ borderColor: currentStage.color, color: currentStage.color, background: `${currentStage.color}10` }}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Token Pipeline Summary ── */}
        {tokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-800 p-5"
            style={{ background: '#0f172a' }}
          >
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Full Token Pipeline</div>
            <div className="flex flex-wrap items-center gap-2">
              {tokens.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="px-2.5 py-1 rounded-lg text-sm font-semibold mono"
                    style={{ background: t.color.bg, color: t.color.text, border: `1px solid ${t.color.border}` }}
                  >
                    {t.text}
                  </span>
                  <span className="text-[10px] text-slate-600 mono">#{t.id}</span>
                  {i < tokens.length - 1 && <span className="text-slate-700 text-xs">→</span>}
                </div>
              ))}
              <span className="text-slate-700 text-xs">→</span>
              <span className="text-xs text-slate-500 px-2 py-1 rounded border border-slate-800">logits...</span>
            </div>
          </motion.div>
        )}

        {/* ── Footer ── */}
        <footer className="text-center pb-8">
          <div className="text-xs text-slate-600">
            Built with{' '}
            <span style={{ color: '#ffad11' }}>♥</span>{' '}
            inspired by{' '}
            <a href="https://github.com/karpathy/LLM101n" target="_blank" rel="noreferrer"
              className="hover:underline" style={{ color: '#ffad11' }}>
              Andrej Karpathy's LLM101n
            </a>
            {' '}· Powered by{' '}
            <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer"
              className="hover:underline" style={{ color: '#818cf8' }}>
              gpt-tokenizer
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
