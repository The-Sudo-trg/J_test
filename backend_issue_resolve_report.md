# Backend Issue Resolution Report

**Date:** 2026-08-18
**Reporter:** Frontend Team
**Priority:** P0 — Both issues block the customer checkout flow
**Affected environment:** Production (`login.justto.in`)

---

## Issue 1: GET `/api/v1/config/getPaymentMethods` → 500 Internal Server Error

### Observed behavior

| Field | Value |
|---|---|
| URL | `https://login.justto.in/api/v1/config/getPaymentMethods` |
| Method | `GET` |
| Status | `500 Internal Server Error` |
| Impact | Customer cannot see available payment options at checkout |

### Root cause analysis

A 500 on a config/read endpoint almost always means the server crashes before it can return a response. Based on the endpoint pattern (`/config/getPaymentMethods`), here are the most likely root causes **in order of probability**:

#### Most likely: Missing or malformed database/config record

> [!CAUTION]
> **Check first.** If the payment methods configuration is stored in a database table (e.g., `config`, `payment_methods`, `settings`) or a config file (e.g., `payment_config.json`, `.env`), the record may be:
> - **Missing entirely** — the table/collection has no rows, or the config key doesn't exist
> - **NULL where not expected** — a column like `methods` or `config_value` is NULL and the code does `JSON.parse(null)` or accesses `.methods` on undefined
> - **Malformed JSON** — stored as a string but contains invalid JSON that crashes the parser

**How to verify:**
```sql
-- If using PostgreSQL/MySQL:
SELECT * FROM config WHERE key = 'payment_methods';
SELECT * FROM payment_methods WHERE active = true;

-- Check if the table exists at all:
SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%payment%' OR table_name LIKE '%config%';
```

```bash
# If using a config file:
cat /path/to/config/payment_methods.json
# Check if it's valid JSON:
python3 -c "import json; json.load(open('/path/to/config/payment_methods.json'))"
```

#### Second likely: Unhandled null/undefined in the service layer

The controller or service function likely does something like:

```javascript
// BROKEN — crashes if config is null/undefined
const getPaymentMethods = async (req, res) => {
  const config = await ConfigModel.findOne({ key: 'payment_methods' });
  const methods = config.value.methods;  // ← TypeError if config is null
  res.json({ success: true, data: methods });
};
```

**Fix pattern:**
```javascript
const getPaymentMethods = async (req, res) => {
  try {
    const config = await ConfigModel.findOne({ key: 'payment_methods' });
    if (!config || !config.value || !config.value.methods) {
      return res.json({ success: true, data: [] });  // Safe empty response
    }
    res.json({ success: true, data: config.value.methods });
  } catch (err) {
    console.error('getPaymentMethods error:', err);
    res.status(500).json({ success: false, message: 'Failed to load payment methods' });
  }
};
```

#### Third likely: Database connection / environment variable issue

- The database connection string may be misconfigured or the DB is unreachable
- An environment variable like `DB_URI`, `DATABASE_URL`, or `MONGO_URI` may be missing on the production server
- The config collection/table may not have been seeded after a deployment

**How to verify:**
```bash
# Check if env vars are set:
echo $DATABASE_URL
echo $MONGO_URI

# Check DB connectivity:
psql $DATABASE_URL -c "SELECT 1"
# or
mongosh $MONGO_URI --eval "db.runCommand({ ping: 1 })"
```

### Expected response format

Based on the frontend implementation, the endpoint should return:

```json
{
  "success": true,
  "data": [
    { "id": "upi", "icon": "▣", "label": "UPI", "note": "Google Pay, PhonePe & more" },
    { "id": "card", "icon": "▤", "label": "Card", "note": "Credit or debit card" },
    { "id": "cash", "icon": "₹", "label": "Cash on delivery", "note": "Pay at your door" }
  ]
}
```

If no payment methods are configured, it should return `{ "success": true, "data": [] }` (200) — **never** a 500.

### Steps to fix

1. **Check server logs** for the actual exception stack trace:
   ```bash
   # Recent logs — look for the actual TypeError/ReferenceError:
   tail -100 /var/log/app/error.log | grep -A 5 "getPaymentMethods\|payment"
   # or if using PM2:
   pm2 logs --lines 100 | grep -A 5 "payment\|config"
   # or if using Docker:
   docker logs <container> 2>&1 | grep -A 5 "payment\|config"
   ```

2. **Trace the route** to find the handler:
   ```bash
   grep -rn "getPaymentMethods\|payment.method\|/config/get" routes/ controllers/ services/
   ```

3. **Check the database** for the payment methods record (see SQL/commands above)

4. **If the record is missing**, seed it:
   ```javascript
   // Seed script example:
   await ConfigModel.create({
     key: 'payment_methods',
     value: {
       methods: [
         { id: 'upi', icon: '▣', label: 'UPI', note: 'Google Pay, PhonePe & more', active: true },
         { id: 'card', icon: '▤', label: 'Card', note: 'Credit or debit card', active: true },
         { id: 'cash', icon: '₹', label: 'Cash on delivery', note: 'Pay at your door', active: true }
       ]
     }
   });
   ```

5. **Add null safety** to the controller/service (see fix pattern above)

### Verification

After fixing, verify:
```bash
curl -s https://login.justto.in/api/v1/config/getPaymentMethods | python3 -m json.tool
# Should return 200 with the payment methods array
# Should return 200 with empty array if no methods configured — NOT a 500
```

---

## Issue 2: POST `/api/v1/customer/order/place` → 403 "Store is closed at order time"

### Observed behavior

| Field | Value |
|---|---|
| URL | `https://login.justto.in/api/v1/customer/order/place` |
| Method | `POST` |
| Status | `403 Forbidden` |
| Error message | "Store is closed at order time" |
| Actual store status | **Store is open** — the frontend seed data shows stores with `status: 'Open'` |
| Impact | Customer cannot place any order, even to open stores |

### Root cause analysis

The 403 with "Store is closed at order time" means the backend has a store-hours validation check that is **incorrectly evaluating open stores as closed**. This is NOT an authentication/authorization issue — it's a business logic validation bug returning the wrong HTTP status.

> [!CAUTION]
> **This is almost certainly a timezone or day-of-week calculation bug.** The server is comparing the current time against store opening/closing hours, but using the wrong timezone or wrong day logic.

#### Most likely: Timezone mismatch

The server is probably running in UTC (or another timezone), but the store hours are stored in IST (Asia/Kolkata, UTC+5:30). When the server checks "is the store open now?", it uses the server's local time (UTC) instead of the store's timezone.

**Example of the bug:**
- Store opens at 08:00 and closes at 22:00 (IST)
- Current IST time: 17:30 (store IS open)
- Server UTC time: 12:00 — might seem OK, but...
- If the server uses `new Date().getHours()` → gets UTC hours
- If it compares UTC hours against IST opening hours → wrong comparison

**Even worse scenario — day boundary:**
- IST time: 01:00 Tuesday (store closed, opens at 08:00)
- UTC time: 19:30 Monday (previous day!)
- If the server checks Monday's schedule using Tuesday's hours → wrong day

**How to verify:**
```bash
# Check what timezone the server uses:
date
timedatectl
echo $TZ
node -e "console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)"
```

**Search for the bug in code:**
```bash
# Find the store-hours validation:
grep -rn "store.*closed\|is.*open\|isOpen\|isClosed\|store.*time\|opening.*hour\|closing.*hour\|business.*hour" routes/ controllers/ services/ middleware/ models/ utils/

# Find timezone usage:
grep -rn "getHours\|getDay\|new Date\|moment\|dayjs\|luxon\|timezone\|Asia/Kolkata\|IST" services/ utils/ controllers/
```

#### The likely broken code pattern

```javascript
// BROKEN — uses server local time, not store timezone
function isStoreOpen(store) {
  const now = new Date();
  const currentHour = now.getHours();  // ← UTC or server timezone, NOT store timezone
  const currentDay = now.getDay();     // ← wrong day if timezone crosses midnight

  const todayHours = store.businessHours[currentDay];  // ← wrong day
  if (!todayHours || !todayHours.open) return false;

  return currentHour >= todayHours.openTime && currentHour < todayHours.closeTime;
}
```

**Correct implementation:**
```javascript
function isStoreOpen(store) {
  // Use the store's timezone (or application default 'Asia/Kolkata')
  const tz = store.timezone || 'Asia/Kolkata';
  const now = new Date();

  // Get current time in store's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  });
  const parts = formatter.formatToParts(now);
  const currentHour = parseInt(parts.find(p => p.type === 'hour').value);
  const currentMinute = parseInt(parts.find(p => p.type === 'minute').value);
  const currentDay = parts.find(p => p.type === 'weekday').value;

  // Map weekday to day index for schedule lookup
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayIndex = dayMap[currentDay];

  const todayHours = store.businessHours?.[dayIndex];
  if (!todayHours || !todayHours.isOpen) return false;

  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const openTimeMinutes = todayHours.openHour * 60 + (todayHours.openMinute || 0);
  const closeTimeMinutes = todayHours.closeHour * 60 + (todayHours.closeMinute || 0);

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
}
```

#### Second likely: Store `status` field not checked / overridden by schedule

The store may have a `status` field ('Open', 'Paused', 'Closed') AND a `businessHours` schedule. The backend might:
1. Ignore the `status` field entirely and only check `businessHours`
2. Check `businessHours` first and reject before checking `status`
3. The `businessHours` array may be empty/null for some stores, and the code treats missing hours as "closed"

**How to verify:**
```bash
# Check the store record in the database:
# MongoDB:
db.stores.find({ id: 'fresh-basket' }).pretty()

# PostgreSQL:
SELECT id, name, status, business_hours, timezone FROM stores WHERE id = 'fresh-basket';
```

Check if `business_hours` is NULL, empty array, or doesn't have an entry for today's day index.

#### Third likely: Wrong HTTP status code

403 is supposed to mean "Forbidden" (authorization failure). Using 403 for "store is closed" is semantically incorrect. The validation might be in an auth middleware that conflates authorization checks with business rules.

**Search for this:**
```bash
# Find where 403 is returned:
grep -rn "403\|forbidden\|Forbidden" routes/ controllers/ services/ middleware/

# Find the specific error message:
grep -rn "Store is closed\|store.*closed.*order\|closed at order" routes/ controllers/ services/ middleware/
```

If the "store is closed" check is inside an auth middleware, it may be running before the actual route handler and might have different context (e.g., no access to proper timezone config).

#### Fourth likely: Stale store data / caching

The store's operating hours or status may be cached (Redis, in-memory) and the cache contains stale "closed" data even though the store has been updated to "open" in the database.

**How to verify:**
```bash
# If using Redis:
redis-cli GET "store:fresh-basket"
redis-cli TTL "store:fresh-basket"

# Force clear cache:
redis-cli DEL "store:fresh-basket"
# or
redis-cli FLUSHDB  # ← nuclear option, clears all cache
```

### Steps to fix

1. **Get the actual error stack trace** from server logs:
   ```bash
   tail -200 /var/log/app/error.log | grep -B 2 -A 10 "Store is closed"
   ```

2. **Find the exact code** that produces this error:
   ```bash
   grep -rn "Store is closed" .
   ```

3. **Check what timezone the server runs in** (see commands above)

4. **Check the store record** in the database — look at `businessHours`, `status`, and `timezone` fields

5. **Fix the timezone issue**: Always convert to the store's timezone (`Asia/Kolkata` for Indian stores) before comparing against business hours

6. **Fix the HTTP status**: Change from 403 to 422 for business rule failures. 403 should be reserved for authorization failures:
   ```javascript
   // WRONG:
   return res.status(403).json({ message: 'Store is closed at order time' });

   // CORRECT:
   return res.status(422).json({ success: false, message: 'Store is closed at order time' });
   ```

7. **Handle missing business hours gracefully**: If a store has `status: 'Open'` but no `businessHours` defined, treat it as open (the status field is the manual override)

8. **Add null checks**: The `businessHours` array might not have an entry for every day of the week

### Specific things to check in the codebase

```bash
# 1. Find the order placement route handler:
grep -rn "order/place\|placeOrder\|place.*order" routes/ controllers/

# 2. Find the store validation middleware/service:
grep -rn "isStoreOpen\|storeOpen\|store.*open\|checkStore\|validateStore" services/ middleware/ utils/

# 3. Find timezone configuration:
grep -rn "timezone\|Asia/Kolkata\|IST\|UTC" config/ .env services/

# 4. Find where the 403 error message is generated:
grep -rn "Store is closed" .

# 5. Find Date/time operations:
grep -rn "new Date\|Date.now\|getHours\|getDay\|moment(\|dayjs(\|toLocaleString" services/ utils/ controllers/
```

### Verification

After fixing, verify with these test cases:

```bash
# Test 1: Order to an open store should succeed (during business hours IST)
curl -X POST https://login.justto.in/api/v1/customer/order/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"storeId":"fresh-basket","items":[{"productId":"bananas","quantity":1}]}'
# Expected: 200/201

# Test 2: Order to a paused/closed store should fail with 422 (not 403)
curl -X POST https://login.justto.in/api/v1/customer/order/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"storeId":"daily-mart","items":[{"productId":"soap","quantity":1}]}'
# Expected: 422 with "Store is currently paused/closed"

# Test 3: Check server timezone
curl -s https://login.justto.in/api/v1/health | python3 -m json.tool
# Look for timezone info in the response
```

---

## Summary of backend fixes needed

| # | Endpoint | Issue | Likely root cause | Fix |
|---|---|---|---|---|
| 1 | `GET /api/v1/config/getPaymentMethods` | 500 Internal Server Error | Missing/null payment methods config record + no null safety in handler | Seed the config record; add try/catch + null checks; return empty array if no config |
| 2 | `POST /api/v1/customer/order/place` | 403 "Store is closed" for open stores | Timezone mismatch: server uses UTC, store hours are in IST | Use `Asia/Kolkata` timezone for all store-hours comparisons; fix `getHours()`/`getDay()` calls |
| 2b | Same | Wrong HTTP status code | 403 used for business rule, not auth failure | Change to 422 for business rule violations |

## Diagnostic checklist for backend developer

- [ ] Pull server error logs for both endpoints
- [ ] Identify server timezone (`date`, `timedatectl`, `echo $TZ`)
- [ ] Check database for payment_methods config record
- [ ] Check database for store business_hours and timezone fields
- [ ] Search codebase for `"Store is closed"` string — find exact file/line
- [ ] Search codebase for `new Date().getHours()` and `new Date().getDay()` — these are the likely bug locations
- [ ] Verify database connectivity and environment variables on production
- [ ] Check if Redis/cache contains stale store data
- [ ] After fixes: run the curl verification commands above
- [ ] After fixes: add unit tests for timezone boundary cases (23:30 IST = 18:00 UTC, midnight crossing, etc.)

---

## Frontend changes already made

The frontend has been updated to:
1. **Validate store status** before adding items to cart and before placing orders — prevents the user from even reaching the broken backend endpoint with a closed-store order
2. **Handle payment methods gracefully** — uses a local config with fallback for empty/missing data, so the UI works even when the backend 500s
3. **Fix tracking page** — shows "Order not found" instead of disclosing another customer's order for unknown IDs

These frontend changes are defensive — the backend fixes are still required for a production-ready system.
