import os
import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.slug, p."nameFr", 
               (SELECT count(*) FROM "ProductImage" pi WHERE pi."productId" = p.id) AS img_count,
               (SELECT array_agg(pi.url) FROM "ProductImage" pi WHERE pi."productId" = p.id) AS img_urls,
               (SELECT array_agg(pv."imageUrl") FROM "ProductVariant" pv WHERE pv."productId" = p.id) AS var_img_urls
        FROM "Product" p 
        WHERE p."isPublished" = true
        ORDER BY p."createdAt" DESC 
        LIMIT 20;
    """)
    rows = cur.fetchall()
    print("--- TOP 20 PUBLISHED PRODUCTS ---")
    for r in rows:
        print(f"Slug: {r[1]} | Name: {r[2]}")
        print(f"  Images count: {r[3]} | Images: {r[4]} | Variant Images: {r[5]}")
except Exception as e:
    print(f"Error: {e}")
