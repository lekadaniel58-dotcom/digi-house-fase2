# Verifica aggiornamento fotografie Digi House

Archivio fornito: `immagini_digi_house_da_pdf.zip` (121 JPEG; nessun PDF incluso).

Sono state sostituite 120 fotografie, utilizzate da 194 righe prodotto, mantenendo
i nomi dei file e tutti i dati di `data/catalogo.csv` identici alla versione originale.
Le associazioni condivise fra varianti rimangono invariate.

Il confronto visivo prima/dopo ha verificato la continuità dei soggetti; il controllo
nel browser ha confrontato nomi, codici e URL immagine di tutti i 357 prodotti con il CSV.
Tutte le 271 immagini referenziate si caricano e vengono decodificate correttamente.

## Eccezione da risolvere prima di completare tutte le sostituzioni

`00360.jpg` nello ZIP raffigura un frattone dentato con impugnatura superiore,
mentre il catalogo lo associa alle **SPATOLE ANCORA RIGIDE**, codici 00360–00368.
La foto precedente raffigura una spatola rigida e viene conservata.
Serve la fotografia corretta o il PDF originale, pagina 65, per completare questo gruppo.
Non è stata riassegnata l'immagine a un altro prodotto per deduzione.

Lo ZIP copre 121 delle 271 immagini referenziate. Le 150 immagini assenti dallo ZIP,
oltre all'eccezione sopra, restano invariate. La risoluzione fornita è variabile:
alcune foto sono soltanto 200×200, altre arrivano a 850 px sul lato maggiore.
Non è stato applicato ingrandimento artificiale. Il PDF non è disponibile per una
verifica indipendente delle associazioni già presenti nel catalogo.

## Tracciabilità e verifiche

`image-update-audit.csv` elenca tutti i file ricevuti, i codici prodotto associati,
le dimensioni prima/dopo, l'esito e lo SHA-256 del file installato.

SHA-256 del CSV prodotti, invariato:
`c4248dab5cbcaf1d2376ff77feb7f95e8b03067d966c9575ba0559d746a419df`

Verifiche eseguite: build TypeScript/Vite; corrispondenza byte per byte fra dati
sorgenti e dati compilati; caricamento e decodifica immagini; ricerca per codice;
nessun risultato; nove filtri reparto; ordinamento prezzi; ricaricamento delle rotte
hash; menu mobile; assenza di overflow orizzontale a 320, 375, 768 e 1440 px.
I controlli funzionali sono stati eseguiti sia sul server di sviluppo sia sulla build.

Le modifiche sono preparate localmente. Non è stato eseguito un push né un deploy.
Il workflow GitHub Actions esistente pubblica su Pages dopo un push su `main`,
con Pages configurato per usare GitHub Actions.
