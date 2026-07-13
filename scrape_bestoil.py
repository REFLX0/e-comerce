import requests
from bs4 import BeautifulSoup
import re
import json
import time
from urllib.parse import urljoin

BASE = "https://www.bestoil.tn"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
session = requests.Session()
session.headers.update(HEADERS)

all_products = {}  # url -> data

def extract_listing(url):
    print(f"Fetching listing: {url}")
    r = session.get(url, timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    for article in soup.select("article.product-miniature"):
        link = article.select_one("a.product-thumbnail")
        if not link:
            continue
        href = link.get("href", "")
        if not href or "/automobile/" not in href:
            continue
        full_url = urljoin(BASE, href)
        name_el = article.select_one(".product-title a")
        name = name_el.get_text(strip=True) if name_el else ""
        price_el = article.select_one(".price")
        price = price_el.get_text(strip=True) if price_el else ""
        brand_el = article.select_one(".product-brand, .brand")
        brand = brand_el.get_text(strip=True) if brand_el else ""
        if full_url not in all_products:
            all_products[full_url] = {"name": name, "url": full_url, "price": price, "brand": brand}
            print(f"  Found: {name} - {price}")
    # pagination
    next_link = soup.select_one("a.next")
    if next_link:
        next_url = urljoin(BASE, next_link.get("href", ""))
        if next_url and next_url not in urls_done:
            urls_done.add(next_url)
            extract_listing(next_url)

urls_done = set()
# Primary listing pages
extract_listing("https://www.bestoil.tn/10-automobile")
extract_listing("https://www.bestoil.tn/10-automobile?q=Cat%C3%A9gories-Huiles+Moteur")
extract_listing("https://www.bestoil.tn/10-automobile?q=Cat%C3%A9gories-Additifs+%5C/+Entretien")

print(f"\nTotal unique products found in listings: {len(all_products)}")

def extract_product_details(url, data):
    print(f"Fetching product: {data['name']}")
    try:
        r = session.get(url, timeout=30)
        soup = BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  Error: {e}")
        return
    # og:image
    og_img = soup.select_one('meta[property="og:image"]')
    if og_img:
        data["image"] = og_img.get("content", "")
    else:
        img = soup.select_one("img#zoom_product, .js-qv-product-cover")
        if img:
            src = img.get("src", "")
            # prefer large_default
            data["image"] = src
    # SKU / Reference
    ref_el = soup.select_one(".product-reference span, [itemprop='sku']")
    if ref_el:
        data["sku"] = ref_el.get_text(strip=True)
    # Get brand from product page
    brand_el = soup.select_one("[itemprop='brand'] [itemprop='name'], .product-manufacturer a")
    if brand_el:
        data["brand"] = brand_el.get_text(strip=True)
    elif soup.select_one("[itemprop='brand']"):
        data["brand"] = soup.select_one("[itemprop='brand']").get("content", "")
    # Volume variations
    variations = []
    for radio in soup.select(".product-variants .radio-label, .product-variants select option"):
        txt = radio.get_text(strip=True)
        if txt:
            variations.append(txt)
    # Also check for volume in product name/description
    vol_match = re.search(r'(\d+[LCl])\b', data.get("name", ""), re.I)
    if vol_match:
        data["volume"] = vol_match.group(1)
    if variations:
        data["variations"] = variations
    print(f"  -> Brand: {data.get('brand','')} | SKU: {data.get('sku','')} | Image: {data.get('image','')[:60]}... | Volumes: {variations}")

# Fetch details for each product
for url, data in all_products.items():
    extract_product_details(url, data)
    time.sleep(0.5)

# Output
print("\n\n========== COMPLETE PRODUCT LIST ==========")
print(f"{'Name':<60} {'Brand':<15} {'Price':<15} {'SKU':<15} {'Volume':<15} {'URL'}")
print("="*160)
for url, data in sorted(all_products.items(), key=lambda x: x[1].get("name","")):
    name = data.get("name","")[:55]
    brand = data.get("brand","")[:12]
    price = data.get("price","")[:12]
    sku = data.get("sku","")[:12]
    vol = data.get("volume","")[:12]
    print(f"{name:<60} {brand:<15} {price:<15} {sku:<15} {vol:<15} {url}")

with open("bestoil_products.json", "w", encoding="utf-8") as f:
    json.dump(all_products, f, ensure_ascii=False, indent=2)
print(f"\nSaved to bestoil_products.json ({len(all_products)} products)")
