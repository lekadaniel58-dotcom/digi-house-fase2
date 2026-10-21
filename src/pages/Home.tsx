import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../lib/useCatalog';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { departments, products, loading, error } = useCatalog();
  const featured = products.filter(p => p.is_featured).slice(0, 8);
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Edilizia · Finiture · Casa</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl max-w-3xl leading-tight">
            Tutto per costruire, ristrutturare e arredare.
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-white">Sfoglia il catalogo <ArrowRight size={18} /></Link>
            <Link to="/contatti" className="rounded-full border border-white/30 px-6 py-3 font-semibold transition hover:border-gold hover:text-gold">Contattaci</Link>
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-2xl mb-6">I nostri reparti</h2>
        {loading ? <p>Caricamento…</p> : error ? <p role="alert" className="text-red-700">Errore nel caricamento: {error}</p> :
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {departments.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link to={`/catalogo?reparto=${d.slug}`} className="flex h-28 items-end rounded-2xl bg-white p-4 font-semibold ring-1 ring-navy/5 transition hover:bg-navy hover:text-gold hover:shadow-xl">{d.name}</Link>
              </motion.div>))}
          </div>}
      </section>
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="font-display text-2xl mb-6">In evidenza</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>)}
    </>
  );
}
