import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
/** null finché le credenziali Supabase non sono configurate: l'interfaccia lo segnala */
export const supabase = url && key ? createClient(url, key) : null;
export const WHATSAPP = '393283099390';
export const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
