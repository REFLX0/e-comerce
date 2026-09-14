// k6 load test DESIGN for specpart.tech — NOT executed against production in this
// session (per explicit instruction: do not run an aggressive test against real
// production users/traffic). Intended to be run manually, deliberately, against a
// staging environment or during a pre-announced low-traffic maintenance window,
// starting at the lowest stage and stopping immediately if error rates spike.
//
// Run with:  k6 run --env BASE_URL=https://staging.specpart.tech oil-finder-load-test.js
// Single-stage smoke check first:  k6 run --env BASE_URL=... --env SMOKE=1 oil-finder-load-test.js
//
// Journeys (weighted):
//  60% — Oil Finder happy path: makes -> models -> generations -> engines -> vehicle lookup
//  20% — Catalogue browsing: category/product list pages
//  10-20% — deliberate miss/fallback requests: bogus make/model, empty search results,
//           nonexistent product slugs. These exercise the *uncached* / not-found code
//           paths on purpose (the ones this session found are never Redis-cached), since
//           that is the actual worst-case DB load, not the happy path.

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost';

const oilFinderP95 = new Trend('oil_finder_dropdown_duration', true);
const vehicleLookupP95 = new Trend('vehicle_lookup_duration', true);
const catalogueP95 = new Trend('catalogue_duration', true);
const errorRate = new Rate('errors');

const REAL_MAKES = ['toyota', 'volkswagen', 'peugeot', 'renault', 'hyundai', 'kia'];
const REAL_MODEL_BY_MAKE = {
  toyota: 'corolla', volkswagen: 'golf', peugeot: '208',
  renault: 'clio', hyundai: 'i10', kia: 'sportage',
};
const BOGUS_MAKES = ['Nonexistentbrandxyz', 'FakeMakeQQQ', 'ZzzNotARealBrand'];

function browserHeaders() {
  return {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 k6-load-test',
    },
  };
}

function oilFinderHappyPath() {
  group('oil_finder_happy_path', () => {
    const make = REAL_MAKES[Math.floor(Math.random() * REAL_MAKES.length)];
    const model = REAL_MODEL_BY_MAKE[make];

    let res = http.get(`${BASE_URL}/api/oil-finder/makes`, browserHeaders());
    oilFinderP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { 'makes: 200': (r) => r.status === 200 });
    sleep(0.3);

    res = http.get(`${BASE_URL}/api/oil-finder/makes/${make}/models`, browserHeaders());
    oilFinderP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(0.3);

    res = http.get(`${BASE_URL}/api/oil-finder/models/${make}/${model}/generations`, browserHeaders());
    oilFinderP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(0.3);

    res = http.get(`${BASE_URL}/api/oil-finder/models/${make}/${model}/engines`, browserHeaders());
    oilFinderP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(0.3);

    // Expensive lookup tier — hits the DB / matching logic every time.
    res = http.get(`${BASE_URL}/api/oil-finder/vehicle?make=${make}&model=${model}`, browserHeaders());
    vehicleLookupP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { 'vehicle: 200': (r) => r.status === 200 });
  });
}

function catalogueBrowsing() {
  group('catalogue_browsing', () => {
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=24`, browserHeaders());
    catalogueP95.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { 'catalogue: 200': (r) => r.status === 200 });
    sleep(0.5);
  });
}

function deliberateMissPath() {
  group('deliberate_miss_fallback', () => {
    const bogusMake = BOGUS_MAKES[Math.floor(Math.random() * BOGUS_MAKES.length)];
    // Not found — the uncached path. This is intentional: verifies the app survives
    // sustained not_found traffic without degrading (each of these is a real,
    // uncached DB round trip by design, per the "never cache not_found" rule).
    const res = http.get(`${BASE_URL}/api/oil-finder/vehicle?make=${bogusMake}&model=Unknown`, browserHeaders());
    vehicleLookupP95.add(res.timings.duration);
    errorRate.add(res.status !== 200); // a clean not_found is still HTTP 200 — only 5xx/network errors count
    check(res, { 'not_found handled cleanly': (r) => r.status === 200 });
  });
}

// STAGE_VUS controls a single, isolated ramp-hold-ramp-down stage (2m up, 3m hold,
// 1m down) for controlled stage-by-stage execution where the operator inspects
// host/DB/Redis health BEFORE deciding to run the next stage, per the "do not
// auto-escalate" requirement. Omit it to run the full 100->250->500->1000 sweep
// in one shot (only appropriate once individual stages are already known-safe).
const STAGE_VUS = __ENV.STAGE_VUS ? parseInt(__ENV.STAGE_VUS, 10) : null;

export const options = __ENV.SMOKE
  ? { vus: 1, iterations: 1 }
  : STAGE_VUS
  ? {
      scenarios: {
        single_stage: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [
            { duration: '2m', target: STAGE_VUS },
            { duration: '3m', target: STAGE_VUS },
            { duration: '1m', target: 0 },
          ],
        },
      },
      thresholds: {
        'oil_finder_dropdown_duration': ['p(95)<200'],
        'vehicle_lookup_duration': ['p(95)<300'],
        'catalogue_duration': ['p(95)<300'],
        'errors': ['rate<0.01'],
      },
    }
  : {
      scenarios: {
        ramping_load: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [
            { duration: '2m', target: 100 },
            { duration: '3m', target: 100 },
            { duration: '2m', target: 250 },
            { duration: '3m', target: 250 },
            { duration: '2m', target: 500 },
            { duration: '3m', target: 500 },
            { duration: '2m', target: 1000 },
            { duration: '3m', target: 1000 },
            { duration: '2m', target: 0 },
          ],
        },
      },
      thresholds: {
        // Targets from the spec. k6 marks the run failed (non-zero exit) if these
        // are violated — treat that as the load ceiling for THIS box, not a bug to
        // chase, since the point of this test is to find where it breaks.
        'oil_finder_dropdown_duration': ['p(95)<200'],
        'vehicle_lookup_duration': ['p(95)<300'],
        'catalogue_duration': ['p(95)<300'],
        'errors': ['rate<0.01'],
      },
    };

export default function () {
  const r = Math.random();
  if (r < 0.6) oilFinderHappyPath();
  else if (r < 0.8) catalogueBrowsing();
  else deliberateMissPath();
}
