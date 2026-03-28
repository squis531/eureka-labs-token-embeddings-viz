import { motion, AnimatePresence } from 'framer-motion';

export default function StageTokenization({ tokens }) {
  if (!tokens.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        Type something above to see tokenization...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Your input is split into <span className="text-orange font-semibold">subword tokens</span> using
        Byte Pair Encoding (BPE). Each token maps to a unique integer ID in the model's vocabulary.
      </p>

      {/* Token pills */}
      <div className="flex flex-wrap gap-3">
        <AnimatePresence mode="popLayout">
          {tokens.map((token, i) => (
            <motion.div
              key={`${token.text}-${i}`}
              layoutId={`token-pill-${i}`}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="px-4 py-2 rounded-lg border font-semibold text-sm relative overflow-hidden"
                style={{
                  background: token.color.bg,
                  borderColor: token.color.border,
                  color: token.color.text,
                }}
              >
                <span className="relative z-10">{token.text}</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                #{token.id}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        <StatCard label="Total Tokens" value={tokens.length} color="var(--orange)" />
        <StatCard label="Vocab Source" value="cl100k_base" color="#818cf8" />
        <StatCard label="Encoding" value="BPE/UTF-8" color="#34d399" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl p-3 border border-slate-800 bg-slate-900/60">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold mono" style={{ color }}>{value}</div>
    </div>
  );
}
