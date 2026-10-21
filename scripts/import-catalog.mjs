// Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-catalog.mjs [data/catalogo.csv]
// La service role key resta SOLO sul tuo computer: mai nel frontend o su Netlify.
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const file = process.argv[2] || 'data/catalogo.csv';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'); process.exit(1);
}
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true, trim: true, bom: true });

const { data: deps, error: de } = await db.from('departments').select('id,name');
if (de) { console.error(de.message); process.exit(1); }
const depByName = Object.fromEntries(deps.map(d => [d.name, d.id]));

// Raggruppa le righe: stesso nome + stesso sottotitolo = un prodotto con varianti
const groups = new Map();
for (const r of rows) {
  if (!r.name) continue;
  const key = `${r.name}|${r.subtitle}|${r.department}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}
const errors = [];
let n = 0, imgs = 0;
for (const [, g] of groups) {
  const f = g[0];
  if (f.department && !depByName[f.department]) { errors.push(`Reparto sconosciuto: ${f.department} (${f.name})`); continue; }
  const prices = g.map(r => (r.price === '' ? null : Number(r.price))).filter(p => p !== null && !Number.isNaN(p));
  const slug = slugify(f.name + (f.subtitle ? '-' + f.subtitle : ''));
  let images = [];
  if (f.image) {
    const p = path.join(path.dirname(file), 'immagini', f.image);
    if (fs.existsSync(p)) {
      const dest = `${slug}.jpg`;
      const { error } = await db.storage.from('product-images').upload(dest, fs.readFileSync(p), { contentType: 'image/jpeg', upsert: true });
      if (error) errors.push(`Foto ${f.image}: ${error.message}`);
      else { images = [db.storage.from('product-images').getPublicUrl(dest).data.publicUrl]; imgs++; }
    }
  }
  const prod = {
    sku: g.find(r => r.sku)?.sku || `NOCODE-${slug}`, slug, name: f.name, subtitle: f.subtitle || null,
    description: f.description || null, department_id: depByName[f.department] ?? null,
    price: prices.length ? Math.min(...prices) : null, // con varianti: prezzo "da"
    availability: 'on_request', images,
  };
  const { data: saved, error } = await db.from('products').upsert(prod, { onConflict: 'slug' }).select('id').single();
  if (error) { errors.push(`${f.name}: ${error.message}`); continue; }
  const variants = g.filter(r => r.variant || g.length > 1).map(r => ({
    product_id: saved.id, label: r.variant || r.sku, sku: r.sku || null, price: r.price === '' ? null : Number(r.price), availability: 'on_request',
  }));
  if (variants.length) {
    const { error: ve } = await db.from('product_variants').upsert(variants, { onConflict: 'product_id,label' });
    if (ve) errors.push(`Varianti ${f.name}: ${ve.message}`);
  }
  n++;
}
console.log(`Importati ${n} prodotti, ${imgs} foto caricate.`);
if (errors.length) { console.error(`\n${errors.length} problemi:\n` + errors.join('\n')); process.exit(1); }
