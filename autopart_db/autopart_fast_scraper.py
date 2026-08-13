import sys, time, urllib.request, ssl, json, re, csv, xml.etree.ElementTree as ET, os, threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse

# ============ CONFIG ============
OUT = '.'  # Current directory - works on Windows, Mac, Linux
SITEMAP_URLS = [
    'https://autopart.tn/sitemap1.xml',
    'https://autopart.tn/sitemap2.xml'
]
SITEMAP_FILES = ['sitemap1.xml', 'sitemap2.xml']
DEFAULT_THREADS = 12

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HDRS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

SUBCAT_CAT = {
    '7':'Filtres','8':'Filtres','9':'Filtres','416':'Filtres','424':'Filtres',
    '78':'Freinage','82':'Freinage','83':'Freinage','123':'Freinage','124':'Freinage',
    '258':'Freinage','277':'Freinage','281':'Freinage','402':'Freinage','412':'Freinage','2746':'Freinage',
    '305':'Courroie, tendeur et chaine','306':'Courroie, tendeur et chaine','307':'Courroie, tendeur et chaine',
    '308':'Courroie, tendeur et chaine','540':'Courroie, tendeur et chaine','571':'Courroie, tendeur et chaine',
    '1075':'Courroie, tendeur et chaine','1123':'Courroie, tendeur et chaine',
    '3213':'Courroie, tendeur et chaine','10005':'Courroie, tendeur et chaine',
    '243':'Allumage','686':'Allumage','689':'Allumage','698':'Allumage',
    '188':'Suspension','332':'Suspension','854':'Suspension','1180':'Suspension','1182':'Suspension',
    '51':'Direction et Trains roulants','191':'Direction et Trains roulants','251':'Direction et Trains roulants',
    '273':'Direction et Trains roulants','284':'Direction et Trains roulants','286':'Direction et Trains roulants',
    '507':'Direction et Trains roulants','653':'Direction et Trains roulants','654':'Direction et Trains roulants',
    '1159':'Direction et Trains roulants','1334':'Direction et Trains roulants',
    '2066':'Direction et Trains roulants','2462':'Direction et Trains roulants','3229':'Direction et Trains roulants',
    '47':'Embrayage','234':'Embrayage','261':'Embrayage','262':'Embrayage','478':'Embrayage',
    '479':'Embrayage','577':'Embrayage','620':'Embrayage','3419':'Embrayage',
    '12':'Moteur','137':'Moteur','158':'Moteur','318':'Moteur','321':'Moteur',
    '458':'Moteur','592':'Moteur','596':'Moteur','618':'Moteur','977':'Moteur',
    '1145':'Moteur','1260':'Moteur','1591':'Moteur','2234':'Moteur',
    '3871':'Moteur','3886':'Moteur','10008':'Moteur','10015':'Moteur',
    '62':'Eclairage','259':'Eclairage','289':'Eclairage','391':'Eclairage',
    '2':'Demarrage electrique','4':'Demarrage electrique','1390':'Demarrage electrique',
    '830':'Capteurs et sondes','833':'Capteurs et sondes','3922':'Capteurs et sondes',
    '3926':'Capteurs et sondes','3938':'Capteurs et sondes','3946':'Capteurs et sondes',
    '298':'Carosserie','300':'Carosserie','794':'Carosserie','1361':'Carosserie',
    '1526':'Carosserie','1561':'Carosserie','4826':'Carosserie','10004':'Carosserie',
    '56':'Refroidissement moteur','316':'Refroidissement moteur','397':'Refroidissement moteur',
    '468':'Refroidissement moteur','469':'Refroidissement moteur','470':'Refroidissement moteur',
    '475':'Refroidissement moteur','508':'Refroidissement moteur','509':'Refroidissement moteur',
    '546':'Refroidissement moteur','3219':'Refroidissement moteur','3314':'Refroidissement moteur','9217':'Refroidissement moteur',
    '5':'Cardan et Transmission','13':'Cardan et Transmission','193':'Cardan et Transmission',
    '1420':'Cardan et Transmission','1427':'Cardan et Transmission','1787':'Cardan et Transmission',
    '447':'Climatisation','448':'Climatisation','467':'Climatisation','471':'Climatisation',
    '1360':'Climatisation','2669':'Climatisation','2975':'Climatisation',
    '572':'Moteur','3902':'Moteur','914':'Direction et Trains roulants',
    '247':'Moteur','1632':'Suspension','541':'Courroie, tendeur et chaine','219':'Carosserie',
}

PH = ['product_id','url','name','brand','sku','mpn','gtin13','price','price_currency','availability','condition','shipping_cost','image_url','category_name','subcategory_slug','subcategory_id','subcategory_name','description']

write_lock = threading.Lock()


def download_file(url, filepath):
    """Download a file from URL to local path. Returns True on success."""
    try:
        req = urllib.request.Request(url, headers=HDRS)
        resp = urllib.request.urlopen(req, timeout=120, context=ctx)
        data = resp.read()
        with open(filepath, 'wb') as f:
            f.write(data)
        return True
    except Exception as e:
        print(f'  ERROR: {e}')
        return False


def ensure_sitemaps():
    """Make sure sitemap files exist, download if missing."""
    print('Checking sitemap files...')
    for url, fname in zip(SITEMAP_URLS, SITEMAP_FILES):
        if os.path.exists(fname):
            size = os.path.getsize(fname)
            print(f'  OK: {fname} ({size:,} bytes)')
        else:
            print(f'  Downloading {fname} from {url} ...')
            sys.stdout.flush()
            if download_file(url, fname):
                size = os.path.getsize(fname)
                print(f'  Saved: {fname} ({size:,} bytes)')
            else:
                print(f'  FAILED to download {fname}!')
        sys.stdout.flush()


def load_urls():
    urls = []
    for fname in SITEMAP_FILES:
        if not os.path.exists(fname):
            print(f'WARNING: {fname} not found')
            continue
        tree = ET.parse(fname)
        count = 0
        for loc in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
            u = loc.text
            if '/fiche/' in u:
                urls.append(u)
                count += 1
        print(f'  Loaded {count} URLs from {fname}')
    return urls


def get_progress():
    pf = os.path.join(OUT, 'progress.txt')
    if os.path.exists(pf):
        try:
            val = int(open(pf, 'r').read().strip())
            return val
        except:
            return 0
    return 0


def save_progress(pos):
    with open(os.path.join(OUT, 'progress.txt'), 'w') as f:
        f.write(str(pos))


def init_csvs(start):
    os.makedirs(OUT, exist_ok=True)
    if start == 0:
        with open(os.path.join(OUT,'products.csv'), 'w', newline='', encoding='utf-8') as f:
            f.write(','.join(PH) + '\n')
        with open(os.path.join(OUT,'technical_specs.csv'), 'w', encoding='utf-8') as f:
            f.write('product_id,spec_label,spec_value\n')
        with open(os.path.join(OUT,'compatible_vehicles.csv'), 'w', encoding='utf-8') as f:
            f.write('product_id,brand,model,detail\n')
        with open(os.path.join(OUT,'oem_references.csv'), 'w', encoding='utf-8') as f:
            f.write('product_id,brand,reference\n')
        with open(os.path.join(OUT,'image_urls.csv'), 'w', encoding='utf-8') as f:
            f.write('product_id,image_url\n')


def process_one(url):
    try:
        req = urllib.request.Request(url, headers=HDRS)
        resp = urllib.request.urlopen(req, timeout=20, context=ctx)
        html = resp.read().decode('utf-8', errors='replace')
        if len(html) < 500:
            return None

        um = re.match(r'https://autopart\.tn/fiche/([^-]+(?:-[^-]+)*?)-(\d+)/', url)
        ss, si = (um.group(1), um.group(2)) if um else ('', '')
        pm = re.search(r'-(\d+)\.html$', url)
        pid = pm.group(1) if pm else ''

        name = brand = sku = mpn = gtin = desc = price = avail = cond = ship = img = ''
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
            try:
                d = json.loads(m.group(1))
                if isinstance(d, dict) and d.get('@type') == 'Product':
                    name = d.get('name', '')
                    sku = d.get('sku', '')
                    mpn = d.get('mpn', '')
                    gtin = d.get('gtin13', '')
                    desc = d.get('description', '')
                    b = d.get('brand', {})
                    brand = b.get('name', '') if isinstance(b, dict) else str(b)
                    imgs = d.get('image', [])
                    if isinstance(imgs, str):
                        img = imgs
                    elif isinstance(imgs, list) and imgs:
                        img = imgs[0]
                    else:
                        img = ''
                    o = d.get('offers', {})
                    if isinstance(o, dict):
                        price = o.get('price', '')
                        a = o.get('availability', '')
                        avail = 'En Stock' if 'InStock' in a else ('Rupture' if 'OutOfStock' in a else a)
                        cond = o.get('itemCondition', '')
                        sd = o.get('shippingDetails', {})
                        if isinstance(sd, dict):
                            sr = sd.get('shippingRate', {})
                            if isinstance(sr, dict):
                                ship = sr.get('value', '')
                    break
            except:
                pass
        if not name:
            return None

        sr_rows = []
        vr_rows = []
        or_rows = []
        pf_pos = html.find('Fiche Technique</label>')
        pv_pos = html.find('V\u00e9hicules Compatibles</label>')
        pr_pos = html.find('R\u00e9f\u00e9rences d\'origine</label>')

        if pf_pos > 0:
            es = pv_pos if pv_pos > pf_pos else pr_pos if pr_pos > pf_pos else len(html)
            for sm in re.finditer(r'pl-3">\s*([^:<>]+?)\s*:\s*<strong>([^<]+)', html[pf_pos:es]):
                l, v = sm.group(1).strip(), sm.group(2).strip()
                if l and v:
                    sr_rows.append(l + ',' + v)

        if pv_pos > 0:
            ev = pr_pos if pr_pos > pv_pos else len(html)
            panels = html[pv_pos:ev].split('<button class="accordion">')
            for pn in panels[1:]:
                bm = re.search(r'<strong>([^<]+)</strong></button>', pn)
                cb = bm.group(1).strip() if bm else ''
                cm = ''
                for mm in re.finditer(r'pl-3">\s*<strong>([^<]+)', pn):
                    cm = mm.group(1).strip()
                for dm in re.finditer(r'pl-3">\s*([^<]+?)\s*</div>', pn):
                    d = dm.group(1).strip()
                    if d:
                        vr_rows.append(cb + ',' + cm + ',' + d)

        if pr_pos > 0:
            panels = html[pr_pos:].split('<button class="accordion">')
            for pn in panels[1:]:
                bm = re.search(r'<strong>([^<]+)</strong></button>', pn)
                cb = bm.group(1).strip() if bm else ''
                for rm in re.finditer(r'pl-3">\s*([^<]+?)\s*</div>', pn):
                    r = rm.group(1).strip()
                    if r:
                        or_rows.append(cb + ',' + r)

        return {
            'product_id': pid, 'url': url, 'name': name, 'brand': brand,
            'sku': sku, 'mpn': mpn, 'gtin13': gtin, 'price': price,
            'price_currency': 'TND', 'availability': avail, 'condition': cond,
            'shipping_cost': ship, 'image_url': img,
            'category_name': SUBCAT_CAT.get(si, ''),
            'subcategory_slug': ss, 'subcategory_id': si, 'subcategory_name': '',
            'description': desc,
            '_sr': sr_rows, '_vr': vr_rows, '_or': or_rows
        }
    except:
        return None


def main():
    parser = argparse.ArgumentParser(description='Autopart.tn Fast Catalogue Scraper')
    parser.add_argument('start', nargs='?', type=int, default=-1, help='Start position (-1=auto-resume)')
    parser.add_argument('--threads', '-t', type=int, default=DEFAULT_THREADS)
    parser.add_argument('--fresh', action='store_true', help='Start from scratch')
    args = parser.parse_args()

    threads = args.threads
    start = args.start

    print('='*50)
    print('  AUTOPART.TN CATALOGUE SCRAPER')
    print('='*50)
    print()

    if args.fresh:
        start = 0
    elif start == -1:
        start = get_progress()
        if start > 0:
            print('Auto-resuming from position', start)

    # Step 1: Download sitemaps if needed
    ensure_sitemaps()
    print()

    # Step 2: Load all product URLs
    urls = load_urls()
    total = len(urls)
    remaining = total - start

    print()
    print('Total URLs:', total)
    print('Starting from:', start)
    print('Remaining:', remaining)
    print('Threads:', threads)
    print()

    if remaining <= 0:
        print('Already complete!')
        return

    init_csvs(start)

    pcf = open(os.path.join(OUT, 'products.csv'), 'a', newline='', encoding='utf-8')
    scf = open(os.path.join(OUT, 'technical_specs.csv'), 'a', encoding='utf-8')
    vcf = open(os.path.join(OUT, 'compatible_vehicles.csv'), 'a', encoding='utf-8')
    ocf = open(os.path.join(OUT, 'oem_references.csv'), 'a', encoding='utf-8')
    icf = open(os.path.join(OUT, 'image_urls.csv'), 'a', encoding='utf-8')

    ok = 0
    fail = 0
    t0 = time.time()
    done_count = 0
    CHUNK = 200

    with ThreadPoolExecutor(max_workers=threads) as ex:
        for chunk_start in range(start, total, CHUNK):
            chunk_urls = urls[chunk_start:chunk_start + CHUNK]
            futures = {ex.submit(process_one, u): u for u in chunk_urls}

            for future in as_completed(futures):
                try:
                    p = future.result()
                except:
                    p = None

                with write_lock:
                    if p is None:
                        fail += 1
                    else:
                        pid = p['product_id']
                        row = ','.join([str(p.get(f, '')).replace(',', ';').replace('\n', ' ').replace('\r', ' ') for f in PH])
                        pcf.write(row + '\n')
                        for s in p['_sr']:
                            scf.write(pid + ',' + s + '\n')
                        for v in p['_vr']:
                            vcf.write(pid + ',' + v + '\n')
                        for o in p['_or']:
                            ocf.write(pid + ',' + o + '\n')
                        if p['image_url']:
                            icf.write(pid + ',' + p['image_url'] + '\n')
                        ok += 1

                    done_count += 1
                    total_done = start + done_count

                    if done_count % 100 == 0:
                        pcf.flush()
                        scf.flush()
                        vcf.flush()
                        ocf.flush()
                        icf.flush()
                        save_progress(total_done)
                        el = time.time() - t0
                        rate = done_count / el if el > 0 else 0
                        eta = (remaining - done_count) / rate / 60 if rate > 0 else 0
                        print(str(total_done) + '/' + str(total) + ' | OK: ' + str(ok) + ' | Fail: ' + str(fail) + ' | ' + str(round(rate, 1)) + '/s | ETA: ' + str(int(eta)) + 'min', flush=True)

            pcf.flush()
            scf.flush()
            vcf.flush()
            ocf.flush()
            icf.flush()
            save_progress(start + done_count)

    pcf.flush()
    scf.flush()
    vcf.flush()
    ocf.flush()
    icf.flush()
    save_progress(start + ok + fail)
    el = time.time() - t0
    print()
    print('========== COMPLETE ==========')
    print('Total:', total, '| Scraped:', start + ok + fail, '| OK:', ok, '| Fail:', fail)
    print('Time:', int(el), 'seconds (', round(el/60, 1), 'min)')
    pcf.close()
    scf.close()
    vcf.close()
    ocf.close()
    icf.close()


if __name__ == '__main__':
    main()
