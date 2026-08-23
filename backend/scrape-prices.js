const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn?schema=public'
  });
  
  await client.connect();
  
  const result = await client.query(`
    SELECT p.id as product_id, p.name, p.slug, v.id as variant_id, v.sku 
    FROM "Product" p 
    JOIN "ProductVariant" v ON p.id = v."productId" 
    WHERE v.sku LIKE '%PRICE-TBD%'
  `);
  
  const products = result.rows;
  console.log(`Found ${products.length} products needing price.`);

  for (const p of products) {
    const searchQuery = encodeURIComponent(p.name);
    try {
      const res = await fetch(`https://tomobile.store/?s=${searchQuery}&post_type=product`);
      const html = await res.text();
      
      const priceMatch = html.match(/<span class="woocommerce-Price-amount amount"><bdi>([\d\.,]+)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        console.log(`Found price for ${p.name}: ${price} TND`);
        
        const newSku = p.sku.replace('-PRICE-TBD', '');
        await client.query(`UPDATE "ProductVariant" SET price = $1, sku = $2 WHERE id = $3`, [price, newSku, p.variant_id]);
      } else {
        console.log(`Could NOT find price for ${p.name}`);
      }
    } catch (e) {
      console.log(`Error scraping ${p.name}: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  await client.end();
}

main().catch(console.error);
