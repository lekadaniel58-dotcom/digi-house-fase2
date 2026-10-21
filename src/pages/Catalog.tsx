import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCatalog } from '../lib/useCatalog';
import ProductCard from '../components/ProductCard';

type Sort = 'name' | 'price-asc' | 'price-desc';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Catalog() {
  const { departments, products, loading, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [onlyPriced, setOnlyPriced] = useState(false);
  const dep = params.get('reparto') ?? '';
  const depId = departments.find(d => d.slug === dep)?.id;

  const list = useMemo(() => {
    const t = norm(q.trim());
    const r = products.filter(p =>
      (!depId || p.department_id === depId) && (!onlyPriced || p.price !== null) &&
      (!t || norm(`${p.name} ${p.subtitle ?? ''} ${p.sku} ${p.description ?? ''}`).includes(t)));
    const cmp: Record<Sort, (a: typeof r[0], b: typeof r[0]) => number> = {
      name: (a, b) => a.name.localeCompare(b.name, 'it'),
      'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1),
    };
    return [...r].sort(cmp[sort]);
  }, [products, q, depId, sort, onlyPriced]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl mb-6">Catalogo</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[220px]">
          <span className="sr-only">Cerca prodotto</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" size={18} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca per nome, codice o descrizione"
            className="w-full rounded-full bg-white py-3 pl-10 pr-4 ring-1 ring-navy/10 focus:ring-gold" />
        </label>
        <select aria-label="Reparto" value={dep} onChange={e => setParams(e.target.value ? { reparto: e.target.value } : {})} className="rounded-full bg-white px-4 py-3 ring-1 ring-navy/10">
          <option value="">Tutti i reparti</option>{departments.map(d => <option key={d.id} value={d.slug}>{d.name}</option>)}
        </select>
        <select aria-label="Ordina" value={sort} onChange={e => setSort(e.target.value as Sort)} className="rounded-full bg-white px-4 py-3 ring-1 ring-navy/10">
          <option value="name">Nome A-Z</option><option value="price-asc">Prezzo crescente</option><option value="price-desc">Prezzo decrescente</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyPriced} onChange={e => setOnlyPriced(e.target.checked)} />Solo con prezzo</label>
      </div>
      {loading ? <p>Caricamento…</p> : error ? <p role="alert" className="text-red-700">Errore: {error}</p> :
        list.length === 0 ? <p>Nessun prodotto trovato.</p> :
        <>
          <p className="mb-4 text-sm text-navy/60">{list.length} prodotti</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </>}
    </div>
  );
}
