# DIGI HOUSE SRL - sito web
1. `npm install`
2. Crea un progetto Supabase ed esegui in ordine `supabase/migrations/0001_schema.sql` e `0002_catalogo.sql` (SQL Editor).
3. Copia `.env.example` in `.env` e inserisci URL e anon key del progetto.
4. Importa il catalogo: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import:catalog`
5. `npm run dev` per provare in locale, `npm run build` per il controllo TypeScript e la build.
