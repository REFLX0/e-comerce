-- Setup staging tables
DROP TABLE IF EXISTS staging_articles;
DROP TABLE IF EXISTS staging_attributes;
DROP TABLE IF EXISTS staging_oe_numbers;
DROP TABLE IF EXISTS staging_vehicle_links;

CREATE TABLE IF NOT EXISTS staging_articles (
    article_id TEXT,
    DataSupplierArticleNumber TEXT,
    Supplier TEXT,
    CurrentProduct TEXT,
    NormalizedDescription TEXT,
    HasLinkitems TEXT,
    HasPassengerCar TEXT,
    HasCommercialVehicle TEXT,
    HasMotorbike TEXT,
    HasEngine TEXT,
    HasAxle TEXT,
    HasCVManuID TEXT,
    LotSize1 TEXT,
    LotSize2 TEXT,
    FlagMaterialCertification TEXT,
    FlagSelfServicePacking TEXT,
    FlagRemanufactured TEXT,
    FlagAccessory TEXT,
    IsPseudoArticle TEXT,
    IsValid TEXT,
    Description TEXT,
    ArticleStateAttributeGroup TEXT,
    ArticleStateAttributeType TEXT,
    ArticleStateDisplayTitle TEXT,
    ArticleStateDisplayValue TEXT,
    PackingUnit TEXT,
    QuantityPerPackingUnit TEXT
);

CREATE TABLE IF NOT EXISTS staging_attributes (
    article_id TEXT,
    attribute_id TEXT,
    AttributeInformationType TEXT,
    DisplayTitle TEXT,
    DisplayValue TEXT,
    ShowImmediately TEXT,
    AttributeType TEXT
);

CREATE TABLE IF NOT EXISTS staging_oe_numbers (
    article_id TEXT,
    OENbr TEXT,
    IsAdditive TEXT,
    Manufacturer TEXT,
    ReferenceInformation TEXT
);

CREATE TABLE IF NOT EXISTS staging_vehicle_links (
    item_type TEXT,
    item TEXT,
    product TEXT,
    supplier TEXT,
    article TEXT,
    universal TEXT,
    linkages_attributes TEXT,
    article_id TEXT
);

-- Note: The actual \copy commands will be run via psql wrapper
