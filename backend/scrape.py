import requests, re, json, time

skus = [
  'YACCO-VX1000LL-0W-40-PRICE-TBD-5L',
  'SHELL-ULTRA-PRO-AVL-0W-20-PRICE-TBD-5L',
  'TOTALENERGIES-QUARTZ-INEO-FIRST-0W-20-PRICE-TBD-5L',
  'PETRONAS-SYNTIUM-7000-RN-0W-20-PRICE-TBD-5L',
  'SHELL-ULTRA-5W-40-PRICE-TBD-5L',
  'SHELL-HX8-5W-30-PRICE-TBD-5L',
  'SHELL-HX7-5W-40-PRICE-TBD-5L',
  'SHELL-ULTRA-PRO-AML-5W-30-PRICE-TBD-5L',
  'MOTUL-4100-SYN-NERGY-10W-40-PRICE-TBD-5L',
  'MOTUL-4100-TURBOLIGHT-10W-40-PRICE-TBD-5L',
  'MOTUL-8100-XCLEAN-FE-5W-30-PRICE-TBD-5L',
  'MOTUL-SPECIFIC-2312-0W-30-PRICE-TBD-5L',
  'MOTUL-SPECIFIC-913D-5W-30-PRICE-TBD-5L',
  'TOTALENERGIES-QUARTZ-INEO-ECS-5W-30-PRICE-TBD-5L',
  'TOTALENERGIES-QUARTZ-INEO-LL-5W-30-PRICE-TBD-5L',
  'TOTALENERGIES-QUARTZ-9000-5W-40-PRICE-TBD-5L',
  'ELF-EVO-900-NF-5W-40-PRICE-TBD-5L',
  'ELF-EVO-900-SXR-5W-40-PRICE-TBD-5L',
  'ELF-EVO-FULLTECH-PCX-5W-30-PRICE-TBD-5L',
  'ELF-EVO-FULLTECH-FE-5W-30-PRICE-TBD-5L',
  'CASTROL-EDGE-5W-30-PRICE-TBD-5L',
  'CASTROL-MAGNETEC-SS-5W-30-PRICE-TBD-5L',
  'MOTUL-SPECIFIC-508-00-509-00-0W-20-PRICE-TBD-5L',
  'YACCO-LUBE-RN17-FE-0W-20-PRICE-TBD-5L'
]

results = []
for sku in skus:
    term = sku.replace('-PRICE-TBD-5L', '').replace('-', ' ')
    url = f"https://tomobile.store/?s={requests.utils.quote(term)}&post_type=product"
    try:
        r = requests.get(url, timeout=10)
        # Search for first product block
        match = re.search(r'class="product-title".*?href="([^"]+)".*?>(.*?)</a>.*?<span class="price">(.*?)</span>', r.text, re.DOTALL | re.IGNORECASE)
        if match:
            link = match.group(1)
            title = match.group(2)
            price_html = match.group(3)
            # Find the actual price, handle sale prices (usually <ins> contains the new price, or just <bdi>)
            # get all <bdi> amounts and take the last one (if sale, it's the new price)
            prices = re.findall(r'<bdi>([\d\.,]+)', price_html)
            if prices:
                price = float(prices[-1].replace(',', '.'))
                results.append({"sku": sku, "title": title, "price": price})
            else:
                results.append({"sku": sku, "error": "No price in product block"})
        else:
            results.append({"sku": sku, "error": "No products found"})
    except Exception as e:
        results.append({"sku": sku, "error": str(e)})
    time.sleep(0.3)

for r in results:
    if "price" in r:
        print(f"UPDATE \"ProductVariant\" SET price = {r['price']}, \"skuVariant\" = '{r['sku'].replace('-PRICE-TBD', '')}' WHERE \"skuVariant\" = '{r['sku']}';")
    else:
        print(f"-- Missing price for {r['sku']}: {r['error']}")
