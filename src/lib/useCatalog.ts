import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Department, Product } from './types';

export function useCatalog() {
  const [state, setState] = useState<{ departments: Department[]; products: Product[]; loading: boolean; error: string | null }>(
    { departments: [], products: [], loading: true, error: null });
  useEffect(() => {
    if (!supabase) { setState(s => ({ ...s, loading: false })); return; }
    let alive = true;
    Promise.all([
      supabase.from('departments').select('id,slug,name').eq('active', true).order('sort_order'),
      supabase.from('products').select('id,sku,slug,name,subtitle,description,department_id,price,images,is_featured,product_variants(id)').eq('active', true).order('name').limit(2000),
    ]).then(([d, p]) => {
      if (!alive) return;
      const error = d.error?.message ?? p.error?.message ?? null;
      setState({ departments: (d.data ?? []) as Department[], products: (p.data ?? []) as Product[], loading: false, error });
    });
    return () => { alive = false; };
  }, []);
  return state;
}
