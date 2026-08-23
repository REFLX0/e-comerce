const skus = [
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
];

async function main() {
  const results = [];
  for (const sku of skus) {
    const searchTerms = sku.replace('-PRICE-TBD-5L', '').replace(/-/g, ' ');
    const url = `https://tomobile.store/?s=${encodeURIComponent(searchTerms)}&post_type=product`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const text = await res.text();
      // Match the JSON
      const match = text.match(/data-gtm4wp_product_data="([^"]+)"/);
      if (match) {
        // Decode HTML entities
        let decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const data = JSON.parse(decoded);
        results.push({ sku, searchTerms, price: data.price, title: data.item_name, status: 'found' });
      } else {
        results.push({ sku, searchTerms, price: null, status: 'not_found' });
      }
    } catch (e) {
      results.push({ sku, searchTerms, price: null, status: 'error', error: e.message });
    }
    // sleep
    await new Promise(r => setTimeout(r, 500));
  }
  
  results.forEach(r => {
    if (r.price) {
      console.log(`UPDATE "ProductVariant" SET price = ${r.price}, "skuVariant" = '${r.sku.replace('-PRICE-TBD', '')}' WHERE "skuVariant" = '${r.sku}';`);
    } else {
      console.log(`-- Missing price for ${r.sku}: ${r.status}`);
    }
  });
}
main();
