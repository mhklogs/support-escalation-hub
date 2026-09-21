import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../../store/index';

export default function Toast() {
  const { state } = useAppState();

  return (
    <AnimatePresence>
      {state.toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="glass-strong fixed bottom-5 right-5 z-50 flex items-center space-x-2 rounded-lg border border-line px-5 py-3 text-xs font-medium text-ink shadow-[0_0_32px_-8px_rgba(255,138,61,0.6)]"
        >
          <div className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-accent" />
          <span>{state.toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}