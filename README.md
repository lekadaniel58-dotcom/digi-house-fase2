# DIGI HOUSE SRL

Sito React + TypeScript + Vite. Il catalogo pubblico legge `data/catalogo.csv`
e le fotografie in `data/immagini/`: non richiede Supabase né credenziali.

## Sviluppo

Usare Node.js 24 e installare le dipendenze con `npm ci`.
Avviare `npm run dev -- --host 0.0.0.0`. Il percorso base è `/digi-house-fase2/`.
La configurazione Vite serve i dati anche in sviluppo e li copia nella build.

`npm run build` esegue il controllo TypeScript e produce `dist/`, incluso il catalogo.
`npm run preview -- --host 0.0.0.0` serve la build per le verifiche locali.

## GitHub Pages

In GitHub, scegliere **Settings → Pages → Source → GitHub Actions**.
Il workflow `.github/workflows/deploy.yml` installa dal lockfile, compila e pubblica
`dist/` dopo un push su `main` o un avvio manuale del workflow.
Le rotte usano l'hash (per esempio `/digi-house-fase2/#/catalogo`) per supportare
l'apertura diretta e il ricaricamento su GitHub Pages senza un server applicativo.

## Aggiornamento fotografie

Conservare invariati codici, nomi, varianti, prezzi, descrizioni e reparti del CSV.
Sostituire le immagini soltanto dopo aver verificato la corrispondenza con i prodotti
nel catalogo originale. Più varianti possono condividere la stessa fotografia:
non dedurre l'associazione dal solo ordine dei file o delle pagine.
Prima della pubblicazione controllare tutte le immagini referenziate, ricerca per
codice, filtri per reparto, ordinamento, navigazione e impaginazione mobile.

## Strumenti opzionali Supabase

Le migrazioni in `supabase/migrations/` e `npm run import:catalog` sono strumenti
separati per importare il catalogo in Supabase; non servono per il sito statico.
Le eventuali credenziali di importazione vanno configurate nell'ambiente e mai
inserite nei file pubblici o nel repository.

Il rapporto delle fotografie ricevute, dei controlli e dell'eccezione `00360.jpg`
è in [docs/image-update.md](docs/image-update.md); il registro dei file è in
[docs/image-update-audit.csv](docs/image-update-audit.csv).
