import { X, ExternalLink, Play } from 'lucide-react';
import { motion } from 'motion/react';
import type { Documentary } from '../types';

interface InlinePlayerModalProps {
  item: Documentary | null;
  onClose: () => void;
}

export function InlinePlayerModal({ item, onClose }: InlinePlayerModalProps) {
  if (!item) return null;
  const hasEmbed = Boolean(item.videoUrl);
  return <motion.div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-7"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose} role="dialog" aria-modal="true" aria-label={`${item.title} — ვიდეოს ფანჯარა`}
  >
    <motion.section
      className="relative overflow-hidden w-full max-w-6xl rounded-3xl border border-orange-400/40 bg-[#090a0d] shadow-[0_0_60px_rgba(255,120,20,.28)]"
      initial={{ opacity: 0, y: 22, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}
      transition={{ type: 'spring', stiffness: 250, damping: 26 }} onClick={event => event.stopPropagation()}
    >
      <header className="flex items-center gap-4 px-5 py-4 bg-gradient-to-b from-black/90 to-[#111217]">
        <div className="min-w-0 flex-1"><p className="text-xs text-orange-300 mb-1">{item.category}</p><h2 className="truncate font-bold text-base sm:text-lg">{item.title}</h2></div>
        <button autoFocus onClick={onClose} aria-label="ვიდეოს ფანჯრის დახურვა" className="shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-orange-500 flex items-center justify-center"><X size={20} /></button>
      </header>
      <div className="relative aspect-video bg-black">
        {hasEmbed ? <iframe title={item.title} src={item.videoUrl} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"><Play className="mb-4 text-orange-300" size={42} /><p className="text-lg font-semibold">ვიდეოს ბმული ჯერ არ არის დამატებული.</p><p className="mt-2 text-sm text-neutral-400">როდესაც ბმული დაემატება, ის ამ ფანჯარაში ჩაიტვირთება.</p></div>}
      </div>
      {hasEmbed && <footer className="flex justify-between gap-4 px-5 py-4 text-sm text-neutral-400"><span>ვიდეო იხსნება ამავე ფანჯარაში</span><a href={item.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-orange-300">Rumble-ზე გახსნა <ExternalLink size={15} /></a></footer>}
    </motion.section>
  </motion.div>;
}
