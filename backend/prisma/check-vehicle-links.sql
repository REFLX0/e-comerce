-- See how many products have Tunisia vehicle links
SELECT COUNT(DISTINCT article_id) as linked_articles FROM staging_vehicle_links;

-- Preview what vehicle links look like
SELECT * FROM staging_vehicle_links LIMIT 10;
