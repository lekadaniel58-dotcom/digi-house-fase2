import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { Product } from '../lib/types';
import { eur } from '../lib/types';
import { waLink } from '../lib/supabase';

export default function ProductCard({ p }: { p: Product }) {
  const hasVariants = (p.product_variants?.length ?? 0) > 1;
  const code = p.sku.startsWith('NOCODE') ? '' : `Cod. ${p.sku}`;
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5 transition hover:shadow-xl">
      <div className="aspect-square bg-navy-50 overflow-hidden">
        {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
          : <div className="h-full grid place-items-center text-navy/30 text-sm">Foto non disponibile</div>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-tight">{p.name}</h3>
        {p.subtitle && <p className="text-xs text-navy/60">{p.subtitle}</p>}
        {code && <p className="text-xs text-navy/50">{code}</p>}
        <p className="mt-auto pt-3 text-lg font-bold text-gold-600">
          {p.price !== null ? <>{hasVariants && <span className="text-xs font-medium text-navy/60">da </span>}{eur(p.price)}</> : <span className="text-sm">Su preventivo</span>}
        </p>
        <a href={waLink(`Buongiorno, vorrei un preventivo per: ${p.name}${code ? ' (' + code + ')' : ''}`)} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-gold">
          <MessageCircle size={16} />Richiedi preventivo
        </a>
      </div>
    </motion.article>
  );
}
