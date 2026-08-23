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
      const res = await fetch(url);
      const text = await res.text();
      // Match price in HTML: <bdi>98,00&nbsp;<span class="woocommerce-Price-currencySymbol">
      const match = text.match(/<bdi>([\d\.,]+)&nbsp;<span class="woocommerce-Price-currencySymbol">/);
      if (match) {
        const priceStr = match[1].replace(',', '.');
        results.push({ sku, searchTerms, price: parseFloat(priceStr), status: 'found' });
      } else {
        results.push({ sku, searchTerms, price: null, status: 'not_found' });
      }
    } catch (e) {
      results.push({ sku, searchTerms, price: null, status: 'error' });
    }
    // sleep
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(JSON.stringify(results, null, 2));
}
main();
