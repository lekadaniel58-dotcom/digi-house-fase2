export interface Department { id: string; slug: string; name: string }
export interface Product {
  id: string; sku: string; slug: string; name: string; subtitle: string | null; description: string | null;
  department_id: string | null; price: number | null; images: string[]; is_featured: boolean;
  product_variants?: { id: string }[];
}
export const eur = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
