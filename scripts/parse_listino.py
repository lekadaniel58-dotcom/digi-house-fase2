"""Estrae il listino PDF in data/catalogo.csv (solo dati realmente presenti nel PDF)."""
import re, csv, sys, glob, pdfplumber
src = sys.argv[1]
RX = re.compile(r'(\d{1,3}(?:\.\d{3})*,\d{2})\s*€\s*#(\d{4,6})')
rows, dept, nrows = [], '', 0
HEAD = {'Materiali edili':'Materiali edili','Pitture':'Pitture e decorazioni','Adesivi e sigillanti':'Adesivi e sigillanti','Finiture':'Finiture'}
PREFIX = {'Porte interne':'Porte interne','Porte blindate':'Porte blindate','Finestre e infissi':'Infissi','Zanzar':'Zanzariere'}
def fixv(v):
    if 'LLT' in v or 'LL' in v:
        v = re.sub(r'(\d)\1,\s*(\d)\2', r'\1,\2', v)
        v = re.sub(r'(\d)\1', r'\1', v).replace('LLT', 'LT')
    return v
def dept_from(sub):
    p = [x.strip() for x in sub.split('·')]
    if p[0] == 'Zanzar' and len(p) > 1 and p[1].startswith('Avvolgibili'): return 'Avvolgibili e tapparelle'
    return PREFIX.get(p[0])
with pdfplumber.open(src) as pdf:
    for pn, page in enumerate(pdf.pages):
        page = page.dedupe_chars(tolerance=1.5)
        left = page.crop((0, 0, 590, page.height)); right = page.dedupe_chars(tolerance=4).crop((590, 0, page.width, page.height)) if False else page.crop((590, 0, page.width, page.height))
        L = [(l['top'], l['chars'][0]['size'], l['chars'][0]['fontname'], l['text'].strip(), l['x0']) for l in left.extract_text_lines(return_chars=True)]
        for top, size, font, text, x0 in L:
            if size >= 20 and 'Bold' in font and text in HEAD: dept = HEAD[text]
        names = [i for i, l in enumerate(L) if l[1] >= 12 and 'Bold' in l[2] and l[4] > 150]
        prices = []
        for l in right.extract_text_lines(return_chars=True):
            # riga con prezzo: etichetta variante prima del prezzo
            m = RX.search(l['text'])
            if m: prices.append((l['top'], l['text'][:m.start()].strip(), m.group(1), m.group(2)))
        imgs = [(im['top'], im['bottom'], im) for im in page.images if im['x1'] < 200 and im['bottom'] - im['top'] > 40]
        for k, i in enumerate(names):
            top = L[i][0]; nxt = L[names[k+1]][0] if k+1 < len(names) else 1e9
            name = L[i][3]
            body = [l for l in L[i+1:(names[k+1] if k+1 < len(names) else len(L))] if l[4] > 150 and 'DIGI HOUSE SRL |' not in l[3]]
            sub = body[0][3] if body and body[0][1] < 9 else ''
            desc = ' '.join(l[3] for l in body if l[1] >= 9)
            ps = [p for p in prices if top - 8 <= p[0] < nxt - 8]
            im = next((x for x in imgs if top - 40 <= (x[0] + x[1]) / 2 <= nxt), None)
            imgfile = ''
            if im:
                imgfile = f"{ps[0][3] if ps else f'p{pn+1}-{k}'}.jpg"
                bb = im[2]
                page.crop((bb['x0'], bb['top'], bb['x1'], bb['bottom'])).to_image(resolution=80).original.convert('RGB').save('data/immagini/' + imgfile, quality=82)
            d = dept_from(sub) or dept
            for p in ps or [(0, '', '', '')]:
                rows.append(dict(sku=p[3], name=name, variant=fixv(p[1]) if p[1] != name else '', subtitle=re.sub(r'\s*\d{1,3},\d{2}\s*€.*', '', sub),
                                 department=d, price=p[2].replace('.', '').replace(',', '.'), description=desc, image=imgfile, page=pn + 1))
with open('data/catalogo.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
print(len(rows), 'righe;', sum(1 for r in rows if not r['price']), 'senza prezzo;', len({r['name'] for r in rows}), 'prodotti;', sorted({r['department'] for r in rows}))
