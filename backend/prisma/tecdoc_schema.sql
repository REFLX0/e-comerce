-- =============================================================================
-- TECdoc 1Q2019 PostgreSQL Schema Definition
-- Multi-Schema Architecture for SpecPat
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS tecdoc;

-- 1. Suppliers (Brands: BOSCH, VALEO, MANN-FILTER, etc.)
CREATE TABLE IF NOT EXISTS tecdoc.suppliers (
    id INTEGER NOT NULL,
    internal_id INTEGER,
    data_version INTEGER,
    matchcode VARCHAR(255),
    nbr_of_articles INTEGER,
    has_new_version_articles BOOLEAN,
    description TEXT,
    CONSTRAINT pk_tecdoc_suppliers PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_suppliers_internal_id ON tecdoc.suppliers(internal_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_suppliers_matchcode ON tecdoc.suppliers(matchcode);

-- 2. Generic Products Nomenclature (e.g. Brake Disc, Oil Filter)
CREATE TABLE IF NOT EXISTS tecdoc.products (
    id INTEGER NOT NULL,
    internal_id INTEGER,
    normalized_description VARCHAR(255),
    assembly_group_description VARCHAR(255),
    usage_description VARCHAR(255),
    description VARCHAR(255),
    CONSTRAINT pk_tecdoc_products PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_products_internal_id ON tecdoc.products(internal_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_products_description ON tecdoc.products(description);

-- 3. Vehicle Manufacturers (Car Makers: Renault, Peugeot, VW, Ford...)
CREATE TABLE IF NOT EXISTS tecdoc.manufacturers (
    id INTEGER NOT NULL,
    matchcode VARCHAR(255),
    is_vgl BOOLEAN,
    description VARCHAR(255),
    is_passenger_car BOOLEAN DEFAULT FALSE,
    is_commercial_vehicle BOOLEAN DEFAULT FALSE,
    is_engine BOOLEAN DEFAULT FALSE,
    is_motorbike BOOLEAN DEFAULT FALSE,
    is_axle BOOLEAN DEFAULT FALSE,
    is_transporter BOOLEAN DEFAULT FALSE,
    is_cv_manufacturer_id BOOLEAN DEFAULT FALSE,
    can_be_displayed BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_tecdoc_manufacturers PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_manufacturers_matchcode ON tecdoc.manufacturers(matchcode);
CREATE INDEX IF NOT EXISTS idx_tecdoc_manufacturers_pc ON tecdoc.manufacturers(is_passenger_car, can_be_displayed);

-- 4. Vehicle Models (Series: Clio, Golf, Megane, Series 3...)
CREATE TABLE IF NOT EXISTS tecdoc.models (
    id INTEGER NOT NULL,
    manufacturer_id INTEGER,
    date_from DATE,
    date_to DATE,
    description TEXT,
    can_be_displayed BOOLEAN DEFAULT TRUE,
    is_passenger_car BOOLEAN DEFAULT FALSE,
    is_commercial_vehicle BOOLEAN DEFAULT FALSE,
    is_engine BOOLEAN DEFAULT FALSE,
    is_motorbike BOOLEAN DEFAULT FALSE,
    is_axle BOOLEAN DEFAULT FALSE,
    is_transporter BOOLEAN DEFAULT FALSE,
    is_cv_manufacturer_id BOOLEAN DEFAULT FALSE,
    has_link BOOLEAN DEFAULT FALSE,
    is_valid_for_current_country BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_tecdoc_models PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_models_mfr ON tecdoc.models(manufacturer_id, is_passenger_car, can_be_displayed);
CREATE INDEX IF NOT EXISTS idx_tecdoc_models_desc ON tecdoc.models(description);

-- 5. Passenger Cars (Exact Vehicle Trims / Motorisations)
CREATE TABLE IF NOT EXISTS tecdoc.passengercars (
    id INTEGER NOT NULL,
    internal_id INTEGER,
    model_id INTEGER,
    manufacturer_matchcode VARCHAR(255),
    manufacturer_id INTEGER,
    date_from DATE,
    date_to DATE,
    description TEXT,
    full_description VARCHAR(255),
    can_be_displayed BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_tecdoc_passengercars PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_passengercars_internal_id ON tecdoc.passengercars(internal_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_passengercars_model ON tecdoc.passengercars(model_id, manufacturer_id);

-- 6. Engines (Engine codes: K9K, EA288, F9Q...)
CREATE TABLE IF NOT EXISTS tecdoc.engines (
    id INTEGER NOT NULL,
    internal_id INTEGER,
    manufacturer INTEGER,
    sales_description TEXT,
    has_linkitem BOOLEAN DEFAULT FALSE,
    description TEXT,
    date_from DATE,
    date_to DATE,
    can_be_displayed BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_tecdoc_engines PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_engines_internal_id ON tecdoc.engines(internal_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_engines_mfr ON tecdoc.engines(manufacturer);

-- 7. Passenger Cars ↔ Engines Link
CREATE TABLE IF NOT EXISTS tecdoc.passengercars_link_engines (
    car_id INTEGER,
    engine_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_pcar_engines_car ON tecdoc.passengercars_link_engines(car_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_pcar_engines_engine ON tecdoc.passengercars_link_engines(engine_id);

-- 8. Articles (Spare Parts Catalog Header)
CREATE TABLE IF NOT EXISTS tecdoc.articles (
    id INTEGER NOT NULL,
    data_supplier_article_number VARCHAR(255) NOT NULL,
    supplier INTEGER NOT NULL,
    current_product INTEGER,
    normalized_description TEXT,
    has_linkitems BOOLEAN DEFAULT FALSE,
    has_passenger_car BOOLEAN DEFAULT FALSE,
    has_commercial_vehicle BOOLEAN DEFAULT FALSE,
    has_motorbike BOOLEAN DEFAULT FALSE,
    has_engine BOOLEAN DEFAULT FALSE,
    has_axle BOOLEAN DEFAULT FALSE,
    has_cv_manu_id BOOLEAN DEFAULT FALSE,
    lot_size1 INTEGER,
    lot_size2 INTEGER,
    flag_material_certification BOOLEAN DEFAULT FALSE,
    flag_self_service_packing BOOLEAN DEFAULT FALSE,
    flag_remanufactured BOOLEAN DEFAULT FALSE,
    flag_accessory BOOLEAN DEFAULT FALSE,
    is_pseudo_article BOOLEAN DEFAULT FALSE,
    is_valid BOOLEAN DEFAULT TRUE,
    description TEXT,
    article_state_attribute_group VARCHAR(255),
    article_state_attribute_type VARCHAR(255),
    article_state_display_title VARCHAR(255),
    article_state_display_value VARCHAR(255),
    packing_unit INTEGER,
    quantity_per_packing_unit INTEGER,
    CONSTRAINT pk_tecdoc_articles PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_partno ON tecdoc.articles(data_supplier_article_number);
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_partno_clean ON tecdoc.articles(regexp_replace(upper(data_supplier_article_number), '[^A-Z0-9]', '', 'g'));
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_supplier ON tecdoc.articles(supplier, is_valid);
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_product ON tecdoc.articles(current_product, is_valid);

-- 9. Article ↔ Vehicle Linkages (The Compatibility Matrix)
CREATE TABLE IF NOT EXISTS tecdoc.articles_linkages (
    item_type SMALLINT,
    item INTEGER,
    product INTEGER,
    supplier INTEGER,
    article VARCHAR(50),
    universal BOOLEAN DEFAULT FALSE,
    linkages_attributes TEXT
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_linkages_vehicle ON tecdoc.articles_linkages(item_type, item, product);
CREATE INDEX IF NOT EXISTS idx_tecdoc_linkages_article ON tecdoc.articles_linkages(item_type, supplier, article);

-- 10. Original Equipment (OE) Numbers
CREATE TABLE IF NOT EXISTS tecdoc.article_oe_numbers (
    article_id INTEGER,
    oe_nbr VARCHAR(255),
    is_additive BOOLEAN DEFAULT FALSE,
    manufacturer INTEGER,
    reference_information TEXT
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_oe_article ON tecdoc.article_oe_numbers(article_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_oe_nbr ON tecdoc.article_oe_numbers(oe_nbr);
CREATE INDEX IF NOT EXISTS idx_tecdoc_oe_nbr_clean ON tecdoc.article_oe_numbers(regexp_replace(upper(oe_nbr), '[^A-Z0-9]', '', 'g'));
CREATE INDEX IF NOT EXISTS idx_tecdoc_oe_mfr ON tecdoc.article_oe_numbers(manufacturer, oe_nbr);

-- 11. Article Barcodes (EAN-13)
CREATE TABLE IF NOT EXISTS tecdoc.article_ea_numbers (
    article_id INTEGER,
    ean VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_ean_article ON tecdoc.article_ea_numbers(article_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_ean_code ON tecdoc.article_ea_numbers(ean);

-- 12. Article Technical Attributes & Specifications
CREATE TABLE IF NOT EXISTS tecdoc.article_attributes (
    article_id INTEGER,
    attribute_id SMALLINT,
    attribute_information_type VARCHAR(255),
    display_title VARCHAR(255),
    display_value VARCHAR(255),
    show_immediately BOOLEAN DEFAULT FALSE,
    attribute_type VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_attribs_article ON tecdoc.article_attributes(article_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_attribs_title_val ON tecdoc.article_attributes(display_title, display_value);

-- 13. Article Media / Image Information
CREATE TABLE IF NOT EXISTS tecdoc.article_mediainformation (
    article_id INTEGER,
    document_type VARCHAR(255),
    additional_description TEXT,
    show_immediately BOOLEAN DEFAULT FALSE,
    tecdoc_hyperlink_name VARCHAR(255),
    topmotive_hyperlink_name VARCHAR(255),
    normed_description_id INTEGER,
    document_name VARCHAR(255),
    picture_name VARCHAR(255),
    description TEXT
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_media_article ON tecdoc.article_mediainformation(article_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_media_picture ON tecdoc.article_mediainformation(picture_name);

-- 14. Aftermarket Cross References (Interchanges)
CREATE TABLE IF NOT EXISTS tecdoc.article_cross_list (
    article_id INTEGER,
    supplier INTEGER,
    article VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_cross_article ON tecdoc.article_cross_list(article_id);
CREATE INDEX IF NOT EXISTS idx_tecdoc_cross_target ON tecdoc.article_cross_list(supplier, article);

-- 15. Category Search Trees
CREATE TABLE IF NOT EXISTS tecdoc.search_trees (
    tree_id SMALLINT,
    node_id INTEGER,
    parent_node_id INTEGER,
    description VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_trees_node ON tecdoc.search_trees(tree_id, node_id, parent_node_id);

-- 16. Search Tree ↔ Vehicle ↔ Products
CREATE TABLE IF NOT EXISTS tecdoc.tree_node_products (
    item_id INTEGER,
    tree_id SMALLINT,
    parent_node_id INTEGER,
    node_id INTEGER,
    product_id INTEGER,
    valid_state SMALLINT
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_tree_prod_item ON tecdoc.tree_node_products(tree_id, item_id, valid_state);
CREATE INDEX IF NOT EXISTS idx_tecdoc_tree_prod_node ON tecdoc.tree_node_products(tree_id, node_id, product_id);

-- 17. Commercial Vehicles
CREATE TABLE IF NOT EXISTS tecdoc.commercialvehicles (
    id INTEGER NOT NULL,
    internal_id INTEGER,
    model INTEGER,
    date_from DATE,
    date_to DATE,
    description TEXT,
    full_description VARCHAR(255),
    can_be_displayed BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_tecdoc_commercialvehicles PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_cv_internal_id ON tecdoc.commercialvehicles(internal_id);

-- 18. Article Parts List (Kit components)
CREATE TABLE IF NOT EXISTS tecdoc.article_parts_list (
    article_id INTEGER,
    article VARCHAR(255),
    supplier INTEGER,
    sequence_id INTEGER,
    quantity DECIMAL(10,2)
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_parts_list_art ON tecdoc.article_parts_list(article_id, supplier);

-- 19. Article Bulletins / Information Notes
CREATE TABLE IF NOT EXISTS tecdoc.article_informations (
    article_id INTEGER,
    information_text TEXT,
    show_immediately BOOLEAN DEFAULT FALSE,
    information_type VARCHAR(255),
    information_type_key INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_info_article ON tecdoc.article_informations(article_id);

-- 20. Direct Replacement Numbers
CREATE TABLE IF NOT EXISTS tecdoc.article_replace_numbers (
    article_id INTEGER,
    replace_nbr VARCHAR(255),
    supplier INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tecdoc_replace_art ON tecdoc.article_replace_numbers(article_id, supplier);

-- ── PERFORMANCE: pg_trgm Trigram indexes ──────────────────────────────────────
-- These enable fast ILIKE / fuzzy text search on the 6.7M-row articles table.
-- Required for the PostgreSQL fallback in SearchService when OpenSearch is down.
-- Run once on the VM:  docker exec -it specpart-db psql -U specparttn -d specparttn -f /tmp/tecdoc_schema.sql
-- or apply individually as shown below.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Part number fuzzy search (most critical — user types "HU 815" → "HU815/2X")
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_partno_trgm
  ON tecdoc.articles USING gin (data_supplier_article_number gin_trgm_ops);

-- Description fuzzy search (category filtering falls back to description ILIKE)
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_desc_trgm
  ON tecdoc.articles USING gin (description gin_trgm_ops);

-- Normalized description (used in category filter ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_tecdoc_articles_normdesc_trgm
  ON tecdoc.articles USING gin (normalized_description gin_trgm_ops);

-- Product type / generic description (e.g. "Brake Disc", "Oil Filter")
CREATE INDEX IF NOT EXISTS idx_tecdoc_products_desc_trgm
  ON tecdoc.products USING gin (description gin_trgm_ops);

-- Supplier matchcode (brand name search)
CREATE INDEX IF NOT EXISTS idx_tecdoc_suppliers_matchcode_trgm
  ON tecdoc.suppliers USING gin (matchcode gin_trgm_ops);

-- OE number fuzzy search (users often search with dashes/spaces removed)
CREATE INDEX IF NOT EXISTS idx_tecdoc_oe_nbr_trgm
  ON tecdoc.article_oe_numbers USING gin (oe_nbr gin_trgm_ops);
