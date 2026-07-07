--
-- PostgreSQL database dump
--

\restrict bgmTH26J0Xc2IZ5h1ZfF2B14TnW7V3t4f4L2V9oGdbhzY6Jo8kOtNhwmTRJPwbv

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: CouponType; Type: TYPE; Schema: public; Owner: kiosquetn
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENT',
    'FIXED',
    'SHIPPING'
);


ALTER TYPE public."CouponType" OWNER TO kiosquetn;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: kiosquetn
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO kiosquetn;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: kiosquetn
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'PRO'
);


ALTER TYPE public."Role" OWNER TO kiosquetn;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: kiosquetn
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."TicketStatus" OWNER TO kiosquetn;

--
-- Name: TicketType; Type: TYPE; Schema: public; Owner: kiosquetn
--

CREATE TYPE public."TicketType" AS ENUM (
    'RETURN',
    'SUPPORT'
);


ALTER TYPE public."TicketType" OWNER TO kiosquetn;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO kiosquetn;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    wilaya text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Address" OWNER TO kiosquetn;

--
-- Name: Brand; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text
);


ALTER TABLE public."Brand" OWNER TO kiosquetn;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "nameFr" text NOT NULL,
    slug text NOT NULL,
    "imageUrl" text,
    "parentId" text
);


ALTER TABLE public."Category" OWNER TO kiosquetn;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    type public."CouponType" NOT NULL,
    value double precision NOT NULL,
    "minAmount" double precision,
    "maxUses" integer,
    "currentUses" integer DEFAULT 0 NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO kiosquetn;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text,
    link text,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Notification" OWNER TO kiosquetn;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" double precision NOT NULL,
    "idempotencyKey" text,
    "shipFullName" text NOT NULL,
    "shipPhone" text NOT NULL,
    "shipWilaya" text NOT NULL,
    "shipCity" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO kiosquetn;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO kiosquetn;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    sku text NOT NULL,
    "nameFr" text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "brandId" text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Product" OWNER TO kiosquetn;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altFr" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO kiosquetn;

--
-- Name: ProductSpecs; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."ProductSpecs" (
    id text NOT NULL,
    "productId" text NOT NULL,
    viscosity text,
    "apiStandard" text,
    "aeceaStandard" text,
    "isFullySynth" boolean DEFAULT false NOT NULL,
    "isSemiSynth" boolean DEFAULT false NOT NULL,
    "isMinerale" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductSpecs" OWNER TO kiosquetn;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    volume text NOT NULL,
    price double precision NOT NULL,
    "stockQty" integer DEFAULT 0 NOT NULL,
    "skuVariant" text NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO kiosquetn;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text,
    "authorName" text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO kiosquetn;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO kiosquetn;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    type public."TicketType" NOT NULL,
    reason text NOT NULL,
    message text,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportTicket" OWNER TO kiosquetn;

--
-- Name: User; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "passwordHash" text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resetPasswordToken" text,
    "resetPasswordExpires" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO kiosquetn;

--
-- Name: VehicleCompatibility; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."VehicleCompatibility" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "vehicleModelId" text NOT NULL,
    "engineCode" text,
    "yearFrom" integer,
    "yearTo" integer
);


ALTER TABLE public."VehicleCompatibility" OWNER TO kiosquetn;

--
-- Name: VehicleMake; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."VehicleMake" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."VehicleMake" OWNER TO kiosquetn;

--
-- Name: VehicleModel; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."VehicleModel" (
    id text NOT NULL,
    "makeId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."VehicleModel" OWNER TO kiosquetn;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO kiosquetn;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO kiosquetn;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: kiosquetn
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO kiosquetn;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Address" (id, "userId", "fullName", phone, city, wilaya, "isDefault") FROM stdin;
\.


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Brand" (id, name, slug, "logoUrl") FROM stdin;
cmr8l27zc0002n06zslci5g3v	Castrol	castrol	/img/b/castrol.svg
cmr8l27zu0003n06zj05m4tkt	Yacco	yacco	/img/b/yacco.svg
cmr8l280f0005n06zkmiw6e8n	Bosch	bosch	/img/b/bosch.svg
cmr8l280d0004n06zg9h7ldfh	Motul	motul	/img/b/motul.svg
cmr8l280h0006n06zpdmjseu6	Liqui Moly	liqui-moly	/img/b/liqui-moly.svg
cmr8l280i0007n06zq9d5d8y9	Wynn's	wynns	/img/b/wynns.svg
cmr8l280i0008n06z4yb14u5g	Shell	shell	/img/b/shell.svg
cmr8l280j0009n06z86awytqt	Purflux	purflux	/img/b/purflux.svg
cmr8l280j000an06z1aeo36ow	TotalEnergies	totalenergies	/img/b/total.svg
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Category" (id, "nameFr", slug, "imageUrl", "parentId") FROM stdin;
cmr8l280q000bn06zqu4cw69h	Automobile	automobile	https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800	\N
cmr8l280u000cn06zidb4vbws	Moto	moto	https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800	\N
cmr8l280x000dn06zvtvwedmp	Poids Lourd & Agricole	poids-lourd-agricole	https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800	\N
cmr8l2811000en06z3eqkizjc	Filtres	filtres	https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800	\N
cmr8l2818000hn06zlma63pcs	100% Synthèse	auto-synthese	\N	cmr8l280q000bn06zqu4cw69h
cmr8l281d000jn06zkon5iphm	Semi-Synthèse	auto-semi	\N	cmr8l280q000bn06zqu4cw69h
cmr8l281g000ln06zncpcamaj	Minérale	auto-minerale	\N	cmr8l280q000bn06zqu4cw69h
cmr8l2814000fn06z73tokfux	Additifs & Entretien	additifs	/img/product.jpg	\N
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Coupon" (id, code, type, value, "minAmount", "maxUses", "currentUses", "expiryDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Notification" (id, type, title, message, link, read, "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Order" (id, "userId", status, "totalAmount", "idempotencyKey", "shipFullName", "shipPhone", "shipWilaya", "shipCity", notes, "createdAt", "updatedAt") FROM stdin;
cmr8wu18j0009o50i7gbckpwk	cmr8wtm1n0007nc0i0cjzocls	SHIPPED	16.5	28734f44-23da-465e-96e7-4511fe848af0	Click Test	29670429	Tunis	Tunis		2026-07-06 07:40:11.587	2026-07-06 20:58:33.219
cmr8unpm70006pj0i3c0sfatf	cmr8un7av0004pj0is2f5qzv2	SHIPPED	28.5	366fbc73-b47c-4a75-8b9d-26c2ed69edd7	mohamed jlassi	29670427	Béja	nabeul		2026-07-06 06:39:17.359	2026-07-06 20:58:33.267
cmr8ulnm50001pj0iacogyysv	cmr8un7av0004pj0is2f5qzv2	SHIPPED	25	2f1c7b78-d3e1-4c43-a64b-7ae184849712	mohamed jlassi	29670427	Kasserine	nabeul		2026-07-06 06:37:41.451	2026-07-06 20:58:33.272
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", quantity, "unitPrice") FROM stdin;
cmr8ulnm50003pj0ixogbjilv	cmr8ulnm50001pj0iacogyysv	cmr8l283l0020n06zdlwfivvo	cmr8l283l0021n06zl2oemi63	1	25
cmr8unpm70008pj0iup0fu9o6	cmr8unpm70006pj0i3c0sfatf	cmr8l283s0026n06zahj27cf7	cmr8l283s0027n06z6x3yq22a	1	28.5
cmr8wu18k000bo50i9pgs1e96	cmr8wu18j0009o50i7gbckpwk	cmr8l286l004fn06zupntqz00	cmr8l286l004gn06z7ivcupah	1	16.5
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt") FROM stdin;
cmr8l286l004fn06zupntqz00	STD-15W40-V15	Huile Standard V15 15W-40	huile-standard-v15-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V15.	f	f	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.445
cmr8zgxut0000mv0ifrvoeyb3	TEST-1783328039509	Test Product 1783328039509	test-product-1783328039386	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 08:53:59.525
cmr91bdvu0006o60i3l9y2izl	TEST-1783331139576	Test Product 1783331139576	test-product-1783331139315	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 09:45:39.594
cmr924pec0003mv0i9cbs7kgc	TEST-1783332507525	Test Product 1783332507525	test-product-1783332507395	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 10:08:27.54
cmr9qt6rx000ao60i86af7vfd	TEST-1783373960564	Test Product 1783373960564	test-product-1783373960215	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 21:39:20.589
cmr9riboz0009mv0ih7kbsco8	TEST-1783375133351	Test Product 1783375133350	test-product-1783375133180	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 21:58:53.363
cmr9ss92y000bmv0is7mor6r6	TEST-1783377276135	Test Product 1783377276135	test-product-1783377275787	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 22:34:36.153
cmr9xmvl40006rx0iokwfuk81	410	7410	410	10000000000	f	f	cmr8l280h0006n06zpdmjseu6	cmr8l2814000fn06z73tokfux	2026-07-07 00:50:23.464
cmr8l28680045n06z6ug83h5s	STD-15W40-V13	Huile Standard V13 15W-40	huile-standard-v13-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V13.	f	f	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.432
cmr9xzx480004mu0isxa98aq9	SKU-delete-test-656928865-1783386031976	DeleteTest	delete-test-656928865	test	f	t	cmr8l280f0005n06zkmiw6e8n	cmr8l2814000fn06z73tokfux	2026-07-07 01:00:31.977
cmr8l282d0010n06zezbv4vg5	YAC-0W20	Yacco Lube DI 0W-20 C6	yacco-lube-di-0w20-c6	Huile 100% synthèse de toute dernière technologie pour les moteurs essence et diesel récents.	t	t	cmr8l27zu0003n06zj05m4tkt	cmr8l2818000hn06zlma63pcs	2026-07-06 02:10:38.293
cmr8l282w0019n06z3tlgb10n	SHL-5W40-U	Shell Helix Ultra 5W-40	shell-helix-ultra-5w40	Huile moteur entièrement synthétique formulée avec la technologie PurePlus de Shell.	t	t	cmr8l280i0008n06z4yb14u5g	cmr8l2818000hn06zlma63pcs	2026-07-06 02:10:38.312
cmr8l2835001in06zao62hu1k	TOT-10W40-Q7	Total Quartz 7000 10W-40	total-quartz-7000-10w40	Huile moteur semi-synthétique performante conçue pour s'adapter à tous les usages.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281d000jn06zkon5iphm	2026-07-06 02:10:38.321
cmr8l283d001rn06zf8q0yv7w	CAS-5W30-EDGE	Castrol Edge 5W-30 LL	castrol-edge-5w30-ll	Le fluide Titanium fortifie l'huile pour résister à la pression et maximiser les performances.	t	t	cmr8l27zc0002n06zslci5g3v	cmr8l2818000hn06zlma63pcs	2026-07-06 02:10:38.329
cmr8l283l0020n06zdlwfivvo	MOT-300V-10W40	Motul 300V Factory Line 10W-40	motul-300v-10w40	Huile moto 4T haute performance 100% synthèse utilisant la technologie ESTER Core.	t	t	cmr8l280d0004n06zg9h7ldfh	cmr8l280u000cn06zidb4vbws	2026-07-06 02:10:38.337
cmr8l283s0026n06zahj27cf7	LIQ-CERATEC	Liqui Moly Ceratec Additif	liqui-moly-ceratec	Additif haute technologie de protection contre l'usure.	t	t	cmr8l280h0006n06zpdmjseu6	cmr8l2814000fn06z73tokfux	2026-07-06 02:10:38.344
cmr8l2840002an06zviruk7gv	BOSCH-P3045	Filtre à Huile Bosch P3045	bosch-filtre-p3045	Filtre à huile haute qualité pour protéger votre moteur.	f	t	cmr8l280f0005n06zkmiw6e8n	cmr8l2811000en06z3eqkizjc	2026-07-06 02:10:38.352
cmr8l2847002hn06zwd7ek7d7	STD-15W40-V1	Huile Standard V1 15W-40	huile-standard-v1-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V1.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.359
cmr8l284d002mn06zzdy7dr98	STD-15W40-V2	Huile Standard V2 15W-40	huile-standard-v2-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V2.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.366
cmr8l284j002rn06z3ba740hn	STD-15W40-V3	Huile Standard V3 15W-40	huile-standard-v3-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V3.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.372
cmr8l284p002wn06zcnxpclxx	STD-15W40-V4	Huile Standard V4 15W-40	huile-standard-v4-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V4.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.378
cmr8l284w0031n06zilqtup9r	STD-15W40-V5	Huile Standard V5 15W-40	huile-standard-v5-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V5.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.384
cmr8l28520036n06zaq0vresa	STD-15W40-V6	Huile Standard V6 15W-40	huile-standard-v6-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V6.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.39
cmr8l2858003bn06zbj3fdk51	STD-15W40-V7	Huile Standard V7 15W-40	huile-standard-v7-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V7.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.396
cmr8l285e003gn06ztgssux0h	STD-15W40-V8	Huile Standard V8 15W-40	huile-standard-v8-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V8.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.402
cmr8l285k003ln06zmsbcwdlr	STD-15W40-V9	Huile Standard V9 15W-40	huile-standard-v9-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V9.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.408
cmr8l285q003qn06zwl3dbvoq	STD-15W40-V10	Huile Standard V10 15W-40	huile-standard-v10-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V10.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.414
cmr8l285w003vn06zibebqymx	STD-15W40-V11	Huile Standard V11 15W-40	huile-standard-v11-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V11.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.42
cmr8l28620040n06zn4x6zcwe	STD-15W40-V12	Huile Standard V12 15W-40	huile-standard-v12-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V12.	f	t	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.426
cmr8w5m160001o50iqlaziwuf	TEST-1783322472114	Test Product 1783322472114	test-product-1783322471922	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 07:21:12.138
cmr8ude9l0000p20itpq8d971	TEST-1783319476079	Test Product 1783319476079	test-product-1783319475923	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 06:31:16.089
cmr8vspu20000nc0i7y0nxc8t	TEST-1783321870527	Test Product 1783321870527	test-product-1783321870393	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 07:11:10.539
cmr919br10004o60i1qqy5nwz	TEST-1783331043497	Test Product 1783331043496	test-product-1783331043277	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 09:44:03.517
cmr91sabv0008o60ihv8zgi8z	TEST-1783331928128	Test Product 1783331928128	test-product-1783331927924	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 09:58:48.139
cmr9qddjx0005mv0i0i2jbxkc	TEST-1783373222859	Test Product 1783373222859	test-product-1783373222718	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 21:27:02.877
cmr9r4at80007mv0ivp8vva0u	TEST-1783374479025	Test Product 1783374479025	test-product-1783374478849	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 21:47:59.037
cmr9rwsaa000co60i844sbnfh	TEST-1783375808030	Test Product 1783375808030	test-product-1783375807527	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-06 22:10:08.05
cmr9x76tl0000rx0ibmswbvfq	TEST-1783384691511	Test Product 1783384691511	test-product-1783384691390	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-07 00:38:11.529
cmr8l286f004an06zdfn84yyb	STD-15W40-V14	Huile Standard V14 15W-40	huile-standard-v14-15w40	Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V14.	f	f	cmr8l280j000an06z1aeo36ow	cmr8l281g000ln06zncpcamaj	2026-07-06 02:10:38.439
cmr9xlf3h0004rx0ifq9x7hq5	TEST-1783385355423	Test Product 1783385355423	test-product-1783385355149	Automated test product description for E2E	f	f	cmr8l27zc0002n06zslci5g3v	cmr8l280q000bn06zqu4cw69h	2026-07-07 00:49:15.438
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."ProductImage" (id, "productId", url, "altFr", "isPrimary", "sortOrder") FROM stdin;
cmr8l283l0023n06zdm6qruy4	cmr8l283l0020n06zdlwfivvo	https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=800	\N	t	0
cmr8l282d0013n06zjpjpc6o7	cmr8l282d0010n06zezbv4vg5	/img/product.jpg	\N	t	0
cmr8l282w001cn06zfaf13730	cmr8l282w0019n06z3tlgb10n	/img/product.jpg	\N	t	0
cmr8l2835001ln06z38g4eom9	cmr8l2835001in06zao62hu1k	/img/product.jpg	\N	t	0
cmr8l283d001un06zkvtphsym	cmr8l283d001rn06zf8q0yv7w	/img/product.jpg	\N	t	0
cmr8l283s0028n06z4flmmsoq	cmr8l283s0026n06zahj27cf7	https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800	\N	t	0
cmr8l2840002cn06zdy9280xq	cmr8l2840002an06zviruk7gv	https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800	\N	t	0
cmr8l2847002kn06zyr4ralrf	cmr8l2847002hn06zwd7ek7d7	/img/product.jpg	\N	t	0
cmr8l284e002pn06zi3hv9ay7	cmr8l284d002mn06zzdy7dr98	/img/product.jpg	\N	t	0
cmr8l284j002un06zfujyfyxd	cmr8l284j002rn06z3ba740hn	/img/product.jpg	\N	t	0
cmr8l284p002zn06zvo4f7hci	cmr8l284p002wn06zcnxpclxx	/img/product.jpg	\N	t	0
cmr8l284w0034n06zva60dek0	cmr8l284w0031n06zilqtup9r	/img/product.jpg	\N	t	0
cmr8l28520039n06zgq5kd74q	cmr8l28520036n06zaq0vresa	/img/product.jpg	\N	t	0
cmr8l2858003en06zcb0cg638	cmr8l2858003bn06zbj3fdk51	/img/product.jpg	\N	t	0
cmr8l285e003jn06zlg3no3ei	cmr8l285e003gn06ztgssux0h	/img/product.jpg	\N	t	0
cmr8l285k003on06z18kjer8n	cmr8l285k003ln06zmsbcwdlr	/img/product.jpg	\N	t	0
cmr8l285q003tn06ztk4o0wm7	cmr8l285q003qn06zwl3dbvoq	/img/product.jpg	\N	t	0
cmr8l285w003yn06z9eoh5bwa	cmr8l285w003vn06zibebqymx	/img/product.jpg	\N	t	0
cmr8l28620043n06zm6okc7fz	cmr8l28620040n06zn4x6zcwe	/img/product.jpg	\N	t	0
cmr8l28680048n06zusj6z306	cmr8l28680045n06z6ug83h5s	/img/product.jpg	\N	t	0
cmr8l286f004dn06z3faulewq	cmr8l286f004an06zdfn84yyb	/img/product.jpg	\N	t	0
cmr8l286l004in06z2wlwnbqr	cmr8l286l004fn06zupntqz00	/img/product.jpg	\N	t	0
\.


--
-- Data for Name: ProductSpecs; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "isFullySynth", "isSemiSynth", "isMinerale") FROM stdin;
cmr8l282d0014n06z8adx17t8	cmr8l282d0010n06zezbv4vg5	0W-20	API SP	ACEA C6	t	f	f
cmr8l282w001dn06z8oykq31u	cmr8l282w0019n06z3tlgb10n	5W-40	API SN PLUS	ACEA A3/B4	t	f	f
cmr8l2835001mn06zenr0bbbp	cmr8l2835001in06zao62hu1k	10W-40	API SN	ACEA A3/B4	f	t	f
cmr8l283d001vn06zwqsmlry6	cmr8l283d001rn06zf8q0yv7w	5W-30	API SN	ACEA C3	t	f	f
cmr8l283l0024n06z6jjue42g	cmr8l283l0020n06zdlwfivvo	10W-40	\N	\N	t	f	f
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant") FROM stdin;
cmr8vspu30001nc0iykwlsfqq	cmr8vspu20000nc0i7y0nxc8t	default	149.99	10	TEST-1783321870527-default
cmr8w5m160002o50id3htn5ar	cmr8w5m160001o50iqlaziwuf	default	149.99	10	TEST-1783322472114-default
cmr924ped0004mv0ixtux0lji	cmr924pec0003mv0i9cbs7kgc	default	149.99	10	TEST-1783332507525-default
cmr9qddjz0006mv0i6yxlxw12	cmr9qddjx0005mv0i0i2jbxkc	default	149.99	10	TEST-1783373222859-default
cmr8ude9l0001p20iwgyhegv0	cmr8ude9l0000p20itpq8d971	default	149.99	10	TEST-1783319476079-default
cmr8l283l0021n06zl2oemi63	cmr8l283l0020n06zdlwfivvo	1L	25	14	MOT-300V-10W40-1L
cmr8l283s0027n06z6x3yq22a	cmr8l283s0026n06zahj27cf7	300ml	28.5	199	LIQ-CERATEC-300ML
cmr8l286l004gn06z7ivcupah	cmr8l286l004fn06zupntqz00	1L	16.5	42	STD-15W40-V15-1L
cmr8zgxut0001mv0incq0aywz	cmr8zgxut0000mv0ifrvoeyb3	default	149.99	10	TEST-1783328039509-default
cmr919br10005o60i9lokgoa1	cmr919br10004o60i1qqy5nwz	default	149.99	10	TEST-1783331043497-default
cmr91bdvx0007o60iru31z6xc	cmr91bdvu0006o60i3l9y2izl	default	149.99	10	TEST-1783331139576-default
cmr91sabv0009o60ie16d9agz	cmr91sabv0008o60ihv8zgi8z	default	149.99	10	TEST-1783331928128-default
cmr9qt6s0000bo60i6c4koj94	cmr9qt6rx000ao60i86af7vfd	default	149.99	10	TEST-1783373960564-default
cmr9r4at90008mv0i666fqsfs	cmr9r4at80007mv0ivp8vva0u	default	149.99	10	TEST-1783374479025-default
cmr9riboz000amv0ichikd1ea	cmr9riboz0009mv0ih7kbsco8	default	149.99	10	TEST-1783375133351-default
cmr9rwsai000do60ijq45sn76	cmr9rwsaa000co60i844sbnfh	default	149.99	10	TEST-1783375808030-default
cmr9ss92y000cmv0imi7q4kqp	cmr9ss92y000bmv0is7mor6r6	default	149.99	10	TEST-1783377276135-default
cmr9x76tl0001rx0i7d8x5gk4	cmr9x76tl0000rx0ibmswbvfq	default	149.99	10	TEST-1783384691511-default
cmr9xlf3h0005rx0iiyudq3iy	cmr9xlf3h0004rx0ifq9x7hq5	default	149.99	10	TEST-1783385355423-default
cmr9xmvl50007rx0i309jl4s7	cmr9xmvl40006rx0iokwfuk81	default	100	100	410-default
cmr9xzx490005mu0ijina0007	cmr9xzx480004mu0isxa98aq9	default	10	5	SKU-delete-test-656928865-1783386031976-default
cmr8l282d0011n06z49lkl5ux	cmr8l282d0010n06zezbv4vg5	1L	22.5	50	YAC-0W20-1L
cmr8l282d0012n06zf7tnawn5	cmr8l282d0010n06zezbv4vg5	5L	95	30	YAC-0W20-5L
cmr8l282w001an06zf4mk6c4y	cmr8l282w0019n06z3tlgb10n	1L	18	100	SHL-5W40-U-1L
cmr8l282w001bn06ztzsv2n3l	cmr8l282w0019n06z3tlgb10n	5L	75	60	SHL-5W40-U-5L
cmr8l2835001jn06z4fg5rfac	cmr8l2835001in06zao62hu1k	1L	12	120	TOT-10W40-Q7-1L
cmr8l2835001kn06zspqkrm2s	cmr8l2835001in06zao62hu1k	4L	42	80	TOT-10W40-Q7-4L
cmr8l283d001sn06z24g8wu1e	cmr8l283d001rn06zf8q0yv7w	1L	20	40	CAS-5W30-EDGE-1L
cmr8l283d001tn06zcq76snw9	cmr8l283d001rn06zf8q0yv7w	5L	88	25	CAS-5W30-EDGE-5L
cmr8l283l0022n06z4l462xvy	cmr8l283l0020n06zdlwfivvo	4L	95	10	MOT-300V-10W40-4L
cmr8l2840002bn06zu54f1skv	cmr8l2840002an06zviruk7gv	Pièce	15	300	BOSCH-P3045-PIÈCE
cmr8l2847002in06z7rrb2pkf	cmr8l2847002hn06zwd7ek7d7	1L	9.5	50	STD-15W40-V1-1L
cmr8l2847002jn06zdpxnbmbl	cmr8l2847002hn06zwd7ek7d7	5L	36.5	20	STD-15W40-V1-5L
cmr8l284d002nn06zwlfkn64b	cmr8l284d002mn06zzdy7dr98	1L	10	50	STD-15W40-V2-1L
cmr8l284d002on06zpd4rvqew	cmr8l284d002mn06zzdy7dr98	5L	38	20	STD-15W40-V2-5L
cmr8l284j002sn06zpkav4idm	cmr8l284j002rn06z3ba740hn	1L	10.5	50	STD-15W40-V3-1L
cmr8l284j002tn06zsrauajrg	cmr8l284j002rn06z3ba740hn	5L	39.5	20	STD-15W40-V3-5L
cmr8l284p002xn06z3fjb0slx	cmr8l284p002wn06zcnxpclxx	1L	11	50	STD-15W40-V4-1L
cmr8l284p002yn06z7chdzn53	cmr8l284p002wn06zcnxpclxx	5L	41	20	STD-15W40-V4-5L
cmr8l284w0032n06zzsz14t0x	cmr8l284w0031n06zilqtup9r	1L	11.5	50	STD-15W40-V5-1L
cmr8l284w0033n06z9pkrkxhd	cmr8l284w0031n06zilqtup9r	5L	42.5	20	STD-15W40-V5-5L
cmr8l28520037n06zy2mm1eq2	cmr8l28520036n06zaq0vresa	1L	12	50	STD-15W40-V6-1L
cmr8l28520038n06zi6gd8u6k	cmr8l28520036n06zaq0vresa	5L	44	20	STD-15W40-V6-5L
cmr8l2858003cn06zegykhbg0	cmr8l2858003bn06zbj3fdk51	1L	12.5	50	STD-15W40-V7-1L
cmr8l2858003dn06z9l6rdhr8	cmr8l2858003bn06zbj3fdk51	5L	45.5	20	STD-15W40-V7-5L
cmr8l285e003hn06zn60jeg0y	cmr8l285e003gn06ztgssux0h	1L	13	50	STD-15W40-V8-1L
cmr8l285e003in06zyjhcvc2o	cmr8l285e003gn06ztgssux0h	5L	47	20	STD-15W40-V8-5L
cmr8l285k003mn06zscchwa5s	cmr8l285k003ln06zmsbcwdlr	1L	13.5	50	STD-15W40-V9-1L
cmr8l285k003nn06zabwg7kce	cmr8l285k003ln06zmsbcwdlr	5L	48.5	20	STD-15W40-V9-5L
cmr8l285q003rn06zcynt6se5	cmr8l285q003qn06zwl3dbvoq	1L	14	50	STD-15W40-V10-1L
cmr8l285q003sn06z0u6opkl9	cmr8l285q003qn06zwl3dbvoq	5L	50	20	STD-15W40-V10-5L
cmr8l285w003wn06zz80tpc1o	cmr8l285w003vn06zibebqymx	1L	14.5	50	STD-15W40-V11-1L
cmr8l285w003xn06zdoaykcyh	cmr8l285w003vn06zibebqymx	5L	51.5	20	STD-15W40-V11-5L
cmr8l28620041n06zqrk7dawp	cmr8l28620040n06zn4x6zcwe	1L	15	50	STD-15W40-V12-1L
cmr8l28620042n06z4sreuzdw	cmr8l28620040n06zn4x6zcwe	5L	53	20	STD-15W40-V12-5L
cmr8l28680046n06ztxfp1958	cmr8l28680045n06z6ug83h5s	1L	15.5	50	STD-15W40-V13-1L
cmr8l28680047n06zuhkv1wba	cmr8l28680045n06z6ug83h5s	5L	54.5	20	STD-15W40-V13-5L
cmr8l286f004bn06z3ed21804	cmr8l286f004an06zdfn84yyb	1L	16	50	STD-15W40-V14-1L
cmr8l286f004cn06z4duvpc1c	cmr8l286f004an06zdfn84yyb	5L	56	20	STD-15W40-V14-5L
cmr8l286l004hn06zqhn9wfiz	cmr8l286l004fn06zupntqz00	5L	57.5	20	STD-15W40-V15-5L
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Review" (id, "productId", "userId", "authorName", rating, comment, "isApproved", "createdAt", "updatedAt") FROM stdin;
cmr8zbv1f0001o60i9o55biaw	cmr8w5m160001o50iqlaziwuf	\N	Anonyme	5	Great product!	t	2026-07-06 08:50:02.594	2026-07-06 08:50:02.594
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."SupportTicket" (id, "userId", "orderId", type, reason, message, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."User" (id, name, email, "emailVerified", image, "passwordHash", role, phone, "createdAt", "updatedAt", "resetPasswordToken", "resetPasswordExpires") FROM stdin;
cmr8l27z50001n06zc5jca8yp	Achref	achref@kiosquetn.tn	\N	\N	$2b$10$SG/5KhMAMhz.DINGRkYHSOP9Hega.NUQNjVC3qqwFqaOOtcEYIXtO	CUSTOMER	\N	2026-07-06 02:10:38.177	2026-07-06 02:10:38.177	\N	\N
cmr8un7av0004pj0is2f5qzv2	mohamed jlassi	azizzizoujlassi@gmail.com	\N	\N	$2b$12$z8LwnmgqkhOhg8S9C16kruLTVJgiPBAwZ1qRXzIDSTZldCILDM7SS	CUSTOMER	admin@kiosquetn.tn	2026-07-06 06:38:53.623	2026-07-06 06:38:53.623	\N	\N
cmr8wtm1n0007nc0i0cjzocls	Click Test	testclick_1783323589026@example.com	\N	\N	$2b$12$.mSr6FlBFG8yytJD8yfjiOgAT6v4GRtvIXOdltRNMRTbdSRhH1IZC	CUSTOMER	29670429	2026-07-06 07:39:51.9	2026-07-06 07:39:51.9	\N	\N
cmr8zzdrc0002mv0i1ncu2r62	Final Test	final-1783328896941@test.tn	\N	\N	$2b$12$gp2ASptezl5VsrhBTmtJzujjaJ/HEej0DUkYpL0lVLERbU/aFs81W	CUSTOMER	50123456	2026-07-06 09:08:19.945	2026-07-06 09:08:19.945	\N	\N
cmr903jq00002o60ieca6rit8	Final Test	final-1783329091326@test.tn	\N	\N	$2b$12$FsmB1oO9ZOuFQy7guHc82.ihnsj6IQ1AF2/kLel6Ev2/GTRy5zDI2	CUSTOMER	50123456	2026-07-06 09:11:34.297	2026-07-06 09:11:34.297	\N	\N
cmr8l27yv0000n06znpnm91yt	Admin	admin@kiosquetn.tn	\N	\N	$2b$12$27mzxeyxgf5NQV0mXU9nF.ojIpBCkx7f.F.Hf9kZx473veiuAehQq	ADMIN	\N	2026-07-06 02:10:38.166	2026-07-06 09:12:05.147	58d9508ba0cd9dd225f3fd7d8d111cf7e82218e6a1f01b2fb8e07a649a5fbb6c	2026-07-06 10:12:05.145
cmr90zh2h0003o60ixdby9wbg	Verify Test	verify-1783330580513@test.tn	\N	\N	$2b$12$8PR9taZ1m3OxxeGPWAEe1.qzoW4tmRMYWT8QecfGRZRIgZvGkguHu	CUSTOMER	50123456	2026-07-06 09:36:23.849	2026-07-06 09:36:23.849	\N	\N
cmr9zttl50000pd0isqd8r68t	Cust Test	custiso-1783389105994@test.tn	\N	\N	$2b$12$0KHRDQ4dEm43GeWZUB60xOQ.6eRsRZhKNp9X448mGVvtzqWGPlOmi	CUSTOMER	50123456	2026-07-07 01:51:46.697	2026-07-07 01:51:46.697	\N	\N
\.


--
-- Data for Name: VehicleCompatibility; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."VehicleCompatibility" (id, "productId", "vehicleModelId", "engineCode", "yearFrom", "yearTo") FROM stdin;
cmr8l282d0016n06znxdiiopw	cmr8l282d0010n06zezbv4vg5	cmr8l281o000on06zkt8wr649	1.5 dCi	\N	\N
cmr8l282d0017n06zm4uam9km	cmr8l282d0010n06zezbv4vg5	cmr8l2829000yn06zids36z85	1.2 PureTech	\N	\N
cmr8l282x001fn06z4cebejxd	cmr8l282w0019n06z3tlgb10n	cmr8l281z000tn06z0ie083ly	2.0 TDI	\N	\N
cmr8l282x001gn06zdcyei13p	cmr8l282w0019n06z3tlgb10n	cmr8l281t000qn06zxntaz5n0	1.6 dCi	\N	\N
cmr8l2835001on06zvrrt2csf	cmr8l2835001in06zao62hu1k	cmr8l281o000on06zkt8wr649	1.2 16V	\N	\N
cmr8l2835001pn06zyq0afasn	cmr8l2835001in06zao62hu1k	cmr8l2822000vn06zi0p5uwpn	1.4 MPI	\N	\N
cmr8l283d001xn06zeng35tib	cmr8l283d001rn06zf8q0yv7w	cmr8l281z000tn06z0ie083ly	1.6 TDI	\N	\N
cmr8l283d001yn06znf77qsis	cmr8l283d001rn06zf8q0yv7w	cmr8l2822000vn06zi0p5uwpn	1.2 TSI	\N	\N
cmr8l2840002en06zrzd0potx	cmr8l2840002an06zviruk7gv	cmr8l281z000tn06z0ie083ly	1.6 TDI	\N	\N
cmr8l2840002fn06z7rnoo6f0	cmr8l2840002an06zviruk7gv	cmr8l2822000vn06zi0p5uwpn	1.6 TDI	\N	\N
cmr922nr9000emvt43z9d3d43	cmr8l2835001in06zao62hu1k	cmr922nr4000cmvt4pbjakjq4	1.0 SCe	\N	\N
cmr922nrm000hmvt49s2drbnh	cmr8l282w0019n06z3tlgb10n	cmr922nr4000cmvt4pbjakjq4	1.5 dCi	\N	\N
cmr922ns1000mmvt4n8a4nwuw	cmr8l2835001in06zao62hu1k	cmr922nrx000kmvt432rxhejq	1.6 16V	\N	\N
cmr922nsj000rmvt4eqcxiqnc	cmr8l283d001rn06zf8q0yv7w	cmr922nse000pmvt4s971mo4c	1.2 MPI	\N	\N
cmr922nsz000wmvt44ghadcli	cmr8l282w0019n06z3tlgb10n	cmr922nsu000umvt45ttodyno	2.0 CRDi	\N	\N
cmr922ntg0011mvt4n6x6oecd	cmr8l2840002an06zviruk7gv	cmr922ntb000zmvt45xt463ll	1.3 Multijet	\N	\N
\.


--
-- Data for Name: VehicleMake; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."VehicleMake" (id, name, slug) FROM stdin;
cmr8l281k000mn06zsdw4vnco	Renault	renault
cmr8l281w000rn06zmv1q2ytk	Volkswagen	volkswagen
cmr8l2825000wn06zfddbxbxd	Peugeot	peugeot
cmr922nqw000amvt4ojxfv9eq	Dacia	dacia
cmr922ns7000nmvt4pj5hbul8	Hyundai	hyundai
cmr922nt4000xmvt4o2wyk9yn	Fiat	fiat
\.


--
-- Data for Name: VehicleModel; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."VehicleModel" (id, "makeId", name, slug) FROM stdin;
cmr8l281o000on06zkt8wr649	cmr8l281k000mn06zsdw4vnco	Clio 4	clio-4
cmr8l281t000qn06zxntaz5n0	cmr8l281k000mn06zsdw4vnco	Megane 4	megane-4
cmr8l281z000tn06z0ie083ly	cmr8l281w000rn06zmv1q2ytk	Golf 7	golf-7
cmr8l2822000vn06zi0p5uwpn	cmr8l281w000rn06zmv1q2ytk	Polo 6	polo-6
cmr8l2829000yn06zids36z85	cmr8l2825000wn06zfddbxbxd	208	208
cmr922nr4000cmvt4pbjakjq4	cmr922nqw000amvt4ojxfv9eq	Sandero	sandero
cmr922nrx000kmvt432rxhejq	cmr922nqw000amvt4ojxfv9eq	Duster	duster
cmr922nse000pmvt4s971mo4c	cmr922ns7000nmvt4pj5hbul8	i10	i10
cmr922nsu000umvt45ttodyno	cmr922ns7000nmvt4pj5hbul8	Tucson	tucson
cmr922ntb000zmvt45xt463ll	cmr922nt4000xmvt4o2wyk9yn	Doblo	doblo
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public."WishlistItem" (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: kiosquetn
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c0ff9abf-5568-4ca8-beca-ad41a0132639	0a1a8e805198c7eb8f69e9f2b5b96a93991dd898447383e336d018a8bd4cd826	2026-07-01 03:08:31.892603+00	20260701003540_initial_schema	\N	\N	2026-07-01 03:08:31.492417+00	1
b491931c-de21-43fa-a968-a7dc6e7b88dc	885e0c505b0b947f96e820f0e96249e97af2d7e78a228ebd6a4b05c5e289d782	2026-07-06 08:18:39.316335+00	20260706081820_add_reset_password_token		\N	2026-07-06 08:18:39.316335+00	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductSpecs ProductSpecs_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductSpecs"
    ADD CONSTRAINT "ProductSpecs_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_resetPasswordToken_key; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_resetPasswordToken_key" UNIQUE ("resetPasswordToken");


--
-- Name: VehicleCompatibility VehicleCompatibility_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleCompatibility"
    ADD CONSTRAINT "VehicleCompatibility_pkey" PRIMARY KEY (id);


--
-- Name: VehicleMake VehicleMake_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleMake"
    ADD CONSTRAINT "VehicleMake_pkey" PRIMARY KEY (id);


--
-- Name: VehicleModel VehicleModel_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleModel"
    ADD CONSTRAINT "VehicleModel_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Brand_slug_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Brand_slug_key" ON public."Brand" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Order_idempotencyKey_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON public."Order" USING btree ("idempotencyKey");


--
-- Name: ProductSpecs_productId_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "ProductSpecs_productId_key" ON public."ProductSpecs" USING btree ("productId");


--
-- Name: ProductVariant_skuVariant_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "ProductVariant_skuVariant_key" ON public."ProductVariant" USING btree ("skuVariant");


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VehicleCompatibility_productId_vehicleModelId_engineCode_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VehicleCompatibility_productId_vehicleModelId_engineCode_key" ON public."VehicleCompatibility" USING btree ("productId", "vehicleModelId", "engineCode");


--
-- Name: VehicleMake_name_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VehicleMake_name_key" ON public."VehicleMake" USING btree (name);


--
-- Name: VehicleMake_slug_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VehicleMake_slug_key" ON public."VehicleMake" USING btree (slug);


--
-- Name: VehicleModel_slug_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VehicleModel_slug_key" ON public."VehicleModel" USING btree (slug);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WishlistItem_userId_productId_key; Type: INDEX; Schema: public; Owner: kiosquetn
--

CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON public."WishlistItem" USING btree ("userId", "productId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductSpecs ProductSpecs_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductSpecs"
    ADD CONSTRAINT "ProductSpecs_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicket SupportTicket_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VehicleCompatibility VehicleCompatibility_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleCompatibility"
    ADD CONSTRAINT "VehicleCompatibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VehicleCompatibility VehicleCompatibility_vehicleModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleCompatibility"
    ADD CONSTRAINT "VehicleCompatibility_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES public."VehicleModel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VehicleModel VehicleModel_makeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."VehicleModel"
    ADD CONSTRAINT "VehicleModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES public."VehicleMake"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kiosquetn
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bgmTH26J0Xc2IZ5h1ZfF2B14TnW7V3t4f4L2V9oGdbhzY6Jo8kOtNhwmTRJPwbv

