import { useEffect, useState } from 'react';
import type { Department, Product } from './types';

type CatalogState = { departments: Department[]; products: Product[]; loading: boolean; error: string | null };
type Row = Record<string, string>;

// CSV parser supporting quoted fields, escaped quotes and multiline descriptions.
function parseCSV(text: string): Row[] {
  const records: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(v => v.trim())) records.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some(v => v.trim())) records.push(row);
  const headers = (records.shift() ?? []).map(h => h.replace(/^\uFEFF/, '').trim());
  return records.map(values => Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()])));
}
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function useCatalog() {
  const [state, setState] = useState<CatalogState>({ departments: [], products: [], loading: true, error: null });
  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}data/catalogo.csv`)
      .then(async response => {
        if (!response.ok) throw new Error(`Catalogo non disponibile (HTTP ${response.status})`);
        const rows = parseCSV(await response.text());
        const names = [...new Set(rows.map(r => r.department).filter(Boolean))];
        const departments: Department[] = names.map(name => ({ id: slugify(name), slug: slugify(name), name }));
        const products: Product[] = rows.filter(r => r.name).map((r, i) => ({
          id: `${r.sku || 'prodotto'}-${i}`,
          sku: r.sku || '',
          slug: slugify(`${r.name}-${r.sku}-${i}`),
          name: r.variant ? `${r.name} – ${r.variant}` : r.name,
          subtitle: r.subtitle || null,
          description: r.description || null,
          department_id: slugify(r.department || ''),
          price: r.price && Number.isFinite(Number(r.price.replace(',', '.'))) ? Number(r.price.replace(',', '.')) : null,
          images: r.image ? [`${import.meta.env.BASE_URL}data/immagini/${encodeURIComponent(r.image)}`] : [],
          is_featured: i < 8,
        }));
        return { departments, products, loading: false, error: null };
      })
      .then(result => { if (alive) setState(result); })
      .catch(e => { if (alive) setState(s => ({ ...s, loading: false, error: String(e.message ?? e) })); });
    return () => { alive = false; };
  }, []);
  return state;
}
