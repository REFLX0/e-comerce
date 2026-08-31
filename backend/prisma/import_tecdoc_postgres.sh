#!/usr/bin/env bash
# =============================================================================
# TecDoc 1Q2019 High-Speed PostgreSQL Batch Ingestion Script
# =============================================================================

set -e

DATA_DIR="${1:-$HOME/tecdoc-data}"
DB_CONTAINER="${2:-achref-db-1}"
DB_USER="${3:-postgres}"
DB_NAME="${4:-specpart_db}"

echo "========================================================"
echo " Starting TecDoc 1Q2019 Ingestion into PostgreSQL"
echo " Data Directory : $DATA_DIR"
echo " DB Container   : $DB_CONTAINER"
echo " Database       : $DB_NAME"
echo "========================================================"

if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Error: Data directory '$DATA_DIR' does not exist."
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    # Try finding alternative name if container name differs
    ALT_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "db|postgres" | head -n 1)
    if [ -n "$ALT_CONTAINER" ]; then
        echo "ℹ️ Using database container: $ALT_CONTAINER"
        DB_CONTAINER="$ALT_CONTAINER"
    else
        echo "❌ Error: PostgreSQL container '$DB_CONTAINER' is not running."
        exit 1
    fi
fi

# 1. Create Schema and Tables
echo "⏳ Step 1/3: Creating 'tecdoc' schema and tables..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$(dirname "$0")/tecdoc_schema.sql"

# Helper function to import TSV files safely
import_table() {
    local table_name="$1"
    local csv_file="$DATA_DIR/$2"
    
    if [ -f "$csv_file" ]; then
        echo "📥 Ingesting $table_name from $(basename "$csv_file")..."
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
            "\copy tecdoc.$table_name FROM STDIN WITH (FORMAT csv, DELIMITER E'\t', NULL 'NULL', QUOTE E'\b');" < "$csv_file"
        echo "   ✅ $table_name imported successfully."
    else
        echo "   ⚠️ Skipping $table_name: $csv_file not found."
    fi
}

echo "⏳ Step 2/3: Ingesting TecDoc CSV data..."

import_table "suppliers" "suppliers.csv"
import_table "products" "products.csv"
import_table "manufacturers" "manufacturers.csv"
import_table "models" "models.csv"
import_table "engines" "engines.csv"
import_table "passengercars" "passengercars.csv"
import_table "passengercars_link_engines" "passengercars_link_engines.csv"
import_table "articles" "articles.csv"
import_table "articles_linkages" "articles_linkages.csv"
import_table "article_oe_numbers" "article_oe_numbers.csv"
import_table "article_ea_numbers" "article_ea_numbers.csv"
import_table "article_attributes" "article_attributes.csv"
import_table "article_mediainformation" "article_mediainformation.csv"
import_table "article_cross_list" "article_cross_list.csv"
import_table "search_trees" "search_trees.csv"
import_table "tree_node_products" "tree_node_products.csv"
import_table "commercialvehicles" "commercialvehicles.csv"
import_table "article_parts_list" "article_parts_list.csv"
import_table "article_informations" "article_informations.csv"
import_table "article_replace_numbers" "article_replace_numbers.csv"

echo "⏳ Step 3/3: Running VACUUM ANALYZE on tecdoc schema..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE tecdoc.articles; VACUUM ANALYZE tecdoc.articles_linkages; VACUUM ANALYZE tecdoc.article_oe_numbers;"

echo "========================================================"
echo " 🎉 TecDoc 1Q2019 Ingestion Completed Successfully!"
echo "========================================================"
