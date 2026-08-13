SELECT 'Products' as table_name, COUNT(*) as count FROM "Product"
UNION ALL
SELECT 'staging_articles', COUNT(*) FROM staging_articles
UNION ALL
SELECT 'staging_attributes', COUNT(*) FROM staging_attributes
UNION ALL
SELECT 'staging_oe_numbers', COUNT(*) FROM staging_oe_numbers;
