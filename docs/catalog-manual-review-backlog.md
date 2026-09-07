# Catalog Manual Review Backlog: Unresolved Engine Pairs

This document tracks engine candidate pairs that were **deliberately not auto-merged** during automated catalog normalization.

## 1. Context & Safeguard Rationale

Under the engine matching rules established in `scratch/catalog-normalizer-core.js`:
1. **Exact-Code Match Priority**: Identical engine codes (e.g. `2.0 TDI` $\leftrightarrow$ `2.0 TDI`) merge regardless of missing year data to collapse duplicate seed rows.
2. **Fuzzy Fallback Year-Overlap Requirement**: When engine codes differ (e.g. a factory code `DKZA` vs a marketing label `2.0 TSI`), merging on displacement ($\pm 15$ cc) and power ($\pm 3$ hp) alone is strictly prohibited unless **both sides carry confirmed, overlapping production years**.

Because seed-sourced entries carry `yearFrom: null`, auto-merging them with factory-coded entries on displacement/power alone could falsely collapse cross-era engines (e.g. an EA113 2.0 TSI from 2006 with an EA888 Gen 4 2.0 TSI from 2021). These pairs are therefore preserved side-by-side in the catalog until production dates or official factory code mappings are manually verified.

---

## 2. Unresolved Pairs in Lot 1 (VAG)

| # | Make | Model | Generation | Verified Engine (Scrape/OEM) | Unverified Seed Engine | Displacement / Power | Status & Analysis |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Cupra** | Formentor | Formentor (KM7) [2020–present] | **DKTA** (2023–present)<br>`0W-20 VW 508.00` | **1.5 TSI** (years: `null`)<br>`oilSpec: null` | 1498 cc / 150 hp (110 kW) | **Likely Identical**: DKTA is the EA211 Evo 1.5 TSI 150hp. Seed entry lacks year data. |
| 2 | **Cupra** | Formentor | Formentor (KM7) [2020–present] | **DKZA** (2021–present)<br>`0W-20 VW 508.00` | **2.0 TSI** (years: `null`)<br>`oilSpec: null` | 1984 cc / 190 hp (140 kW) | **Likely Identical**: DKZA is the EA888 Gen 3B 2.0 TSI 190hp. Seed entry lacks year data. |
| 3 | **Cupra** | Formentor | Formentor (KM7) [2020–present] | **DNPA** (2022–present)<br>`0W-20 VW 508.00` | **2.0 TSI 4Drive** (years: `null`)<br>`oilSpec: null` | 1984 cc / 310 hp (228 kW) | **Likely Identical**: DNPA is the EA888 Gen 4 2.0 TSI 310hp for VZ 4Drive. Seed entry lacks year data. |
| 4 | **Cupra** | Formentor | Formentor (KM7) [2020–present] | **DFFA** (2022–present)<br>`5W-30 VW 504.00/507.00` | **2.0 TDI** (years: `null`)<br>`oilSpec: null` | 1968 cc / 150 hp (110 kW) | **Likely Identical**: DFFA is the EA288 Evo 2.0 TDI 150hp. Seed entry lacks year data. |
| 5 | **Cupra** | Leon | Leon (KL) [2020–present] | **DKZA** (2021–present)<br>`0W-20 VW 508.00` | **2.0 TSI** (years: `null`)<br>`oilSpec: null` | 1984 cc / 190 hp (140 kW) | **Likely Identical**: DKZA is the EA888 Gen 3B 2.0 TSI 190hp. Seed entry lacks year data. |
| 6 | **Cupra** | Leon | Leon (KL) [2020–present] | **DFFA** (2021–present)<br>`5W-30 VW 504.00/507.00` | **2.0 TDI** (years: `null`)<br>`oilSpec: null` | 1968 cc / 150 hp (110 kW) | **Likely Identical**: DFFA is the EA288 Evo 2.0 TDI 150hp. Seed entry lacks year data. |
| 7 | **Cupra** | Ateca | Ateca (KH7) [2018–present] | **DKZA** (2021–present)<br>`0W-20 VW 508.00` | **2.0 TSI** (years: `null`)<br>`oilSpec: null` | 1984 cc / 190 hp (140 kW) | **Likely Identical**: DKZA is the EA888 Gen 3B 2.0 TSI 190hp. Seed entry lacks year data. |

---

## 3. Manual Resolution Guidelines

When reviewing these pairs for future catalog releases:
1. Verify through OEM catalog or TecDoc that the marketing label within the generation refers strictly to the factory engine code shown.
2. If confirmed identical, update the seed engine record with the factory code:
   `engineCode: "1.5 TSI (DKTA)"` or `"2.0 TSI (DKZA)"` and set its `yearFrom` to match verified production start.
3. Once years and codes are explicitly linked, the normalizer can safely merge them without relying on unverified fuzzy heuristics.
