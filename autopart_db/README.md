# Autopart.tn Catalogue Database

Complete product catalogue scraped from [autopart.tn](https://autopart.tn) — Tunisian auto parts e-commerce.

---

## Contents

| File | Description | Rows |
|------|-------------|------|
| `products.csv` | Main product data (name, brand, price, SKU, etc.) | ~4,400+ (growing) |
| `technical_specs.csv` | Product technical specifications | ~24,000+ |
| `compatible_vehicles.csv` | Vehicle compatibility per product | ~280,000+ |
| `oem_references.csv` | OEM cross-reference numbers | ~48,000+ |
| `image_urls.csv` | Product image URLs for downloading | ~3,700+ |
| `autopart_fast_scraper.py` | Scraper script to continue/resume scraping | — |
| `download_images.py` | Script to download all product images | — |

---

## CSV File Structure

### products.csv (Main Table)

| Column | Description | Example |
|--------|-------------|--------|
| `product_id` | Unique product ID (numeric) | `1659` |
| `url` | Full product page URL | `https://autopart.tn/fiche/...` |
| `name` | Product name | `Filtre a huile ASHIKA` |
| `brand` | Brand name | `ASHIKA` |
| `sku` | Stock Keeping Unit | `FO-331S` |
| `mpn` | Manufacturer Part Number | `FO-331S` |
| `gtin13` | EAN/GTIN-13 barcode | `4984746003311` |
| `price` | Price in TND | `24.900` |
| `price_currency` | Currency | `TND` |
| `availability` | Stock status | `En Stock` / `Rupture` |
| `condition` | Item condition | `NewCondition` |
| `shipping_cost` | Shipping cost | `7.000` |
| `image_url` | Main product image URL | `https://autopart.tn/...` |
| `category_name` | Category (French) | `Filtres` |
| `subcategory_slug` | Subcategory URL slug | `filtre-a-huile` |
| `subcategory_id` | Subcategory numeric ID | `7` |
| `description` | Product description | Full text description |

### technical_specs.csv

| Column | Description |
|--------|-------------|
| `product_id` | Links to products.csv |
| `spec_label` | Spec name (e.g., "Hauteur") |
| `spec_value` | Spec value (e.g., "70 mm") |

### compatible_vehicles.csv

| Column | Description |
|--------|-------------|
| `product_id` | Links to products.csv |
| `brand` | Vehicle brand (e.g., "RENAULT") |
| `model` | Vehicle model/engine |
| `detail` | Additional detail |

### oem_references.csv

| Column | Description |
|--------|-------------|
| `product_id` | Links to products.csv |
| `brand` | OEM brand name |
| `reference` | OEM reference number |

### image_urls.csv

| Column | Description |
|--------|-------------|
| `product_id` | Links to products.csv |
| `image_url` | Full URL to product image (WebP) |

---

## Current Statistics

- **Products scraped**: ~4,400+ (out of 53,221 total)
- **Brands**: 45+
- **Price range**: 12.000 – 3,484.000 TND
- **Categories covered**: Filtres, Cardan et Transmission, Demarrage electrique, and more
- **Technical specs**: ~24,000+ rows
- **Vehicle compatibilities**: ~280,000+ rows
- **OEM references**: ~48,000+ rows

---

## How to Continue Scraping (Get All 53K Products)

The scraper auto-saves progress. To continue:

```bash
# Resume from where it stopped (reads progress.txt automatically)
python3 autopart_fast_scraper.py

# Or specify a position manually
python3 autopart_fast_scraper.py 5000

# Use more threads for faster scraping (default: 12)
python3 autopart_fast_scraper.py --threads 16

# Start completely from scratch
python3 autopart_fast_scraper.py --fresh --threads 12
```

**Requirements:** Python 3.6+ (no external libraries needed, uses only stdlib)

**Note:** The sitemap files (`sitemap1.xml`, `sitemap2.xml`) contain all 53,221 product URLs.
You need these files in `/home/z/my-project/` for the scraper to work.
If running on your own machine, download them first:

```bash
curl -o sitemap1.xml https://autopart.tn/sitemap1.xml
curl -o sitemap2.xml https://autopart.tn/sitemap2.xml
```

---

## How to Download Product Images

```bash
python3 download_images.py
```

This reads `image_urls.csv` and downloads all product images (WebP format).
Images are saved to an `autopart_images/` folder, named by product ID.

**Requirements:** Python 3.6+

---

## Database Schema (for Import)

### SQL Import Example (MySQL)

```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    url VARCHAR(500),
    name VARCHAR(500),
    brand VARCHAR(200),
    sku VARCHAR(100),
    mpn VARCHAR(100),
    gtin13 VARCHAR(20),
    price DECIMAL(10,3),
    price_currency VARCHAR(5) DEFAULT 'TND',
    availability VARCHAR(50),
    condition VARCHAR(50),
    shipping_cost DECIMAL(10,3),
    image_url VARCHAR(500),
    category_name VARCHAR(200),
    subcategory_slug VARCHAR(200),
    subcategory_id VARCHAR(20),
    subcategory_name VARCHAR(200),
    description TEXT
);

CREATE TABLE technical_specs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    spec_label VARCHAR(200),
    spec_value VARCHAR(500),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE compatible_vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    brand VARCHAR(100),
    model VARCHAR(200),
    detail VARCHAR(500),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE oem_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    brand VARCHAR(100),
    reference VARCHAR(200),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Import CSV files
LOAD DATA LOCAL INFILE 'products.csv'
    INTO TABLE products
    FIELDS TERMINATED BY ','
    ENCLOSED BY '''
    LINES TERMINATED BY '\n'
    IGNORE 1 ROWS;
```

### PostgreSQL Import

```sql
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    url TEXT,
    name TEXT,
    brand TEXT,
    sku TEXT,
    mpn TEXT,
    gtin13 TEXT,
    price NUMERIC(10,3),
    price_currency VARCHAR(5) DEFAULT 'TND',
    availability TEXT,
    condition TEXT,
    shipping_cost NUMERIC(10,3),
    image_url TEXT,
    category_name TEXT,
    subcategory_slug TEXT,
    subcategory_id TEXT,
    subcategory_name TEXT,
    description TEXT
);

-- Then use \copy or COPY command
\copy products FROM 'products.csv' WITH (FORMAT csv, HEADER true);
```

---

## Category Reference

| Category (French) | English | Subcategory IDs |
|-------------------|---------|-----------------|
| Filtres | Filters | 7, 8, 9, 416, 424 |
| Freinage | Braking | 78, 82, 83, 123, 124, 258, 277, 281, 402, 412, 2746 |
| Courroie, tendeur et chaine | Belts, tensioners & chains | 305, 306, 307, 308, 540, 571, 1075, 1123, 3213, 10005 |
| Allumage | Ignition | 243, 686, 689, 698 |
| Suspension | Suspension | 188, 332, 854, 1180, 1182, 1632 |
| Direction et Trains roulants | Steering & Running Gear | 51, 191, 251, 273, 284, 286, 507, 653, 654, 914, 1159, 1334, 2066, 2462, 3229 |
| Embrayage | Clutch | 47, 234, 261, 262, 478, 479, 577, 620, 3419 |
| Moteur | Engine | 12, 137, 158, 247, 318, 321, 458, 572, 592, 596, 618, 977, 1145, 1260, 1591, 2234, 3871, 3886, 3902, 10008, 10015 |
| Eclairage | Lighting | 62, 259, 289, 391 |
| Demarrage electrique | Electrical Starting | 2, 4, 1390 |
| Capteurs et sondes | Sensors & Probes | 830, 833, 3922, 3926, 3938, 3946 |
| Carosserie | Bodywork | 219, 298, 300, 794, 1361, 1526, 1561, 4826, 10004 |
| Refroidissement moteur | Engine Cooling | 56, 316, 397, 468, 469, 470, 475, 508, 509, 546, 3219, 3314, 9217 |
| Cardan et Transmission | Driveshaft & Transmission | 5, 13, 193, 1420, 1427, 1787 |
| Climatisation | Air Conditioning | 447, 448, 467, 471, 1360, 2669, 2975 |

---

## Notes

- All prices are in **Tunisian Dinars (TND)**
- Lubrifiants category was **excluded** per request
- Some products may have empty fields (not all products have all data)
- Vehicle compatibility and OEM references are parsed from HTML (not AJAX API)
- Images are in **WebP format** hosted on autopart.tn CDN
- The scraper uses Python stdlib only — **no pip install needed**
- Progress is saved every 100 products — safe to interrupt and resume

---

## Source

- **Website**: [autopart.tn](https://autopart.tn)
- **Scraped**: 2026-08-13
- **Total catalogue size**: 53,221 products across 15 categories
