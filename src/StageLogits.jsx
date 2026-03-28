import { motion, AnimatePresence } from 'framer-motion';
import { getLogits } from './tokenizer';
import { TrendingUp } from 'lucide-react';

export default function StageLogits({ tokens }) {
  if (!tokens.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        Complete previous stages first...
      </div>
    );
  }

  const lastToken = tokens[tokens.length - 1];
  const logits = getLogits(lastToken);
  const maxProb = Math.max(...logits.map(l => l.prob));

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        After passing through the transformer layers, the final hidden state is projected to a
        <span className="text-orange font-semibold"> logit vector</span> over the full vocabulary (~100k tokens for cl100k_base).
        We show the <span className="text-emerald-400 font-semibold">top 3</span> predicted next tokens after softmax.
      </p>

      {/* Prompt context */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Input Context</div>
        <div className="flex flex-wrap gap-2">
          {tokens.map((t, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-sm font-mono font-semibold"
              style={{
                background: t.color.bg,
                color: t.color.text,
                border: `1px solid ${t.color.border}`,
                opacity: i === tokens.length - 1 ? 1 : 0.5,
              }}
            >
              {t.text}
            </span>
          ))}
          <span className="text-slate-600 text-sm">→ ?</span>
        </div>
      </div>

      {/* Logits bar chart */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <TrendingUp size={16} className="text-orange" />
          Top-3 Predictions (softmax probabilities)
        </div>
        {logits.map((item, i) => (
          <motion.div
            key={`${item.word}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {/* Rank badge */}
              <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: i === 0 ? 'rgba(255,173,17,0.2)' : 'rgba(30,41,59,0.8)',
                  color: i === 0 ? '#ffad11' : '#64748b',
                  border: i === 0 ? '1px solid #ffad11' : '1px solid #334155',
                }}
              >
                {i + 1}
              </div>

              {/* Token text + id */}
              <div className="flex flex-col w-28 shrink-0">
                <span className="font-mono font-bold text-base truncate"
                  style={{ color: i === 0 ? '#ffad11' : '#e2e8f0' }}
                >
                  "{item.word}"
                </span>
                {item.id !== undefined && (
                  <span className="text-[10px] text-slate-600 mono">#{item.id}</span>
                )}
              </div>

              {/* Bar */}
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.prob / maxProb) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                  style={{
                    background: i === 0
                      ? 'linear-gradient(90deg, #ffad11, #f59e0b)'
                      : i === 1
                      ? 'linear-gradient(90deg, #818cf8, #6366f1)'
                      : 'linear-gradient(90deg, #34d399, #10b981)',
                  }}
                />
              </div>

              {/* Probability */}
              <span className="text-sm mono font-semibold shrink-0 w-12 text-right"
                style={{ color: i === 0 ? '#ffad11' : '#94a3b8' }}
              >
                {(item.prob * 100).toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-500 leading-relaxed">
        💡 In GPT-4 (cl100k_base), the full logit vector has{' '}
        <span className="text-slate-400">~100,000</span> entries — one per vocabulary token.
        Temperature and sampling strategies (top-k, nucleus) are applied before generation.
      </div>
    </div>
  );
}
