import psycopg2

try:
    conn = psycopg2.connect("postgresql://kiosquetn:kiosquetn_local_secret@127.0.0.1:5433/kiosquetn")
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM "Product"')
    count = cur.fetchone()[0]
    print(f"Products in DB: {count}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
