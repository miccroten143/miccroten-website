<<<<<<< HEAD
# MICCROTEN Technologies — E-Commerce Website

A full-featured e-commerce platform for MICCROTEN Technologies Pvt. Ltd., specializing in RFID-based, biomedical IoT device development and AI-powered IoT solutions. The site includes a storefront with product catalog, cart, checkout, Razorpay payment integration, Shiprocket shipping, order tracking, an admin dashboard, and an internship certificate verification system.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Supabase Setup Guide](#4-supabase-setup-guide)
5. [Supabase API Keys Guide](#5-supabase-api-keys-guide)
6. [Database Schema](#6-database-schema)
7. [Razorpay Setup Guide](#7-razorpay-setup-guide)
8. [Shiprocket Setup Guide](#8-shiprocket-setup-guide)
9. [Supabase Edge Function Secrets](#9-supabase-edge-function-secrets)
10. [Environment Variables](#10-environment-variables)
11. [Edge Functions](#11-edge-functions)
12. [Testing Guide](#12-testing-guide)
13. [Troubleshooting Guide](#13-troubleshooting-guide)

---

## 1. Project Overview

**What is MICCROTEN e-commerce?**
A production-ready online store for selling MICCROTEN's proprietary RFID and biomedical IoT products, plus third-party electronics components (Arduino, Raspberry Pi, ESP boards, sensors, etc.). The platform also includes an admin panel for managing products, orders, customers, and certificates, plus a public certificate verification portal.

**Technology Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + custom design system
- **Animations:** Framer Motion
- **State Management:** Zustand (cart, wishlist, auth)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Payments:** Razorpay (server-verified via Edge Functions)
- **Shipping:** Shiprocket (server-side via Edge Functions)
- **Icons:** Lucide React

**Main Features:**
- Product catalog with categories, search, filters, and sorting
- Product detail pages with image galleries, specs, reviews, downloads
- Shopping cart with coupons, GST, and shipping calculation
- Multi-step checkout (address → summary → payment)
- Razorpay payment with server-side signature verification
- Shiprocket shipment creation after successful payment
- Order history with tracking and invoice download
- User authentication (email/password with email verification)
- User profile with saved addresses, payment history, and security settings
- Admin dashboard with revenue analytics, order management, product CRUD, customer list
- Internship certificate management and public verification portal

---

## 2. Requirements

| Requirement | Recommended Version |
|---|---|
| Node.js | v18+ (v20 LTS recommended) |
| npm | v9+ |
| Git | latest |
| Supabase account | free tier or higher |
| Razorpay account | test mode for development, production for live |
| Shiprocket account | for shipping integration |

---

## 3. Installation

```bash
git clone <your-repo-url>
cd miccroten-website
npm install
```

Create a `.env` file in the project root (see [Environment Variables](#10-environment-variables)).

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

---

## 4. Supabase Setup Guide

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose an organization, enter a project name, and select a region.
4. Set a database password and choose the free tier.
5. Wait for the project to provision (2–3 minutes).

### Step 2: Find Your Project URL and API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon).
2. Navigate to **API**.
3. You will find:
   - **Project URL** — this is your `SUPABASE_URL`
   - **anon public key** — this is your `SUPABASE_ANON_KEY` (safe for frontend)
   - **service_role key** — this is your `SUPABASE_SERVICE_ROLE_KEY` (NEVER expose this)

### Step 3: Add Frontend Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
```

### Step 4: Run SQL Migrations

The migration files are in `supabase/migrations/`. Apply them in order:

1. **E-commerce schema** — creates categories, products, reviews, wishlist, addresses, orders, order_items, coupons tables with RLS policies.
2. **Intern certificates** — creates the `intern_certificates` table and storage bucket.
3. **Payments, shipments, profiles, notifications** — creates the `payments`, `shipments`, `profiles`, and `notifications` tables, adds missing columns to `addresses` and `orders`, and creates a trigger for auto-creating profiles on signup.

To apply migrations, run the SQL in the Supabase SQL Editor (Dashboard → SQL Editor), or use the Supabase MCP `apply_migration` tool.

### Step 5: Configure RLS

Row Level Security is enabled on all tables. Policies are defined in the migration files:

- **Public read** (anon + authenticated): `categories`, `products`, `coupons`, `reviews`
- **Owner-scoped** (authenticated, `auth.uid() = user_id`): `addresses`, `orders`, `order_items`, `payments`, `shipments`, `wishlist`, `profiles`, `notifications`
- **Admin read all**: `orders` has an additional `admin_read_all_orders` policy that allows any authenticated user to read all orders (the admin panel uses this)
- **Product management** (authenticated): `products`, `categories`, `coupons` allow authenticated users to insert/update/delete (admin manages these)

### Step 6: Deploy Edge Functions

See [Edge Functions](#11-edge-functions) for deployment instructions.

### Step 7: Configure Supabase Secrets

See [Supabase Edge Function Secrets](#9-supabase-edge-function-secrets).

---

## 5. Supabase API Keys Guide

| Key | Where to Find | Safe for Frontend? | Purpose |
|---|---|---|---|
| **Project URL** | Settings → API | Yes | Base URL for all API calls |
| **anon public key** | Settings → API | Yes | Used by the frontend client (limited by RLS) |
| **service_role key** | Settings → API | **NO — NEVER** | Bypasses RLS, used only in Edge Functions |

**CRITICAL: The SERVICE ROLE KEY must NEVER be used in frontend code.** It bypasses all Row Level Security policies and can read/write any data. It is only used inside Supabase Edge Functions where it is stored as a server-side environment variable.

---

## 6. Database Schema

### addresses

```sql
CREATE TABLE addresses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  alternate_number text,
  line1 text NOT NULL,
  line2 text,
  landmark text,
  city text NOT NULL,
  district text,
  state text NOT NULL,
  pincode text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  type text DEFAULT 'both',
  address_type text DEFAULT 'home',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### orders

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  payment_id text,
  subtotal numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  gst numeric(12,2) DEFAULT 0,
  shipping numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  coupon_code text,
  address jsonb,
  delivered_at timestamptz,
  shipment_status text DEFAULT 'pending',
  tracking_number text,
  courier text,
  estimated_delivery date,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  currency text DEFAULT 'INR',
  payment_created_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### order_items

```sql
CREATE TABLE order_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  quantity integer NOT NULL,
  image text,
  created_at timestamptz DEFAULT now()
);
```

### payments

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### shipments

```sql
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shiprocket_order_id text,
  shipment_id text,
  awb_code text,
  courier_name text,
  courier_company_id integer,
  tracking_number text,
  tracking_url text,
  shipment_status text DEFAULT 'pending',
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz,
  pickup_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Indexes

The migration creates indexes on: `products(category_id)`, `products(status)`, `reviews(product_id)`, `wishlist(user_id)`, `addresses(user_id)`, `orders(user_id)`, `order_items(order_id)`, `payments(order_id)`, `payments(user_id)`, `payments(razorpay_payment_id)`, `shipments(order_id)`, `shipments(user_id)`, `notifications(user_id)`.

### Order Status Values

| Field | Values |
|---|---|
| `orders.status` | pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, refunded |
| `orders.payment_status` | pending, paid, failed, refunded, cod |
| `orders.shipment_status` | pending, created, picked_up, in_transit, out_for_delivery, delivered, cancelled, rto |
| `shipments.shipment_status` | pending, created, picked_up, in_transit, out_for_delivery, delivered, cancelled, rto |

---

## 7. Razorpay Setup Guide

### Test Mode (Development)

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Create a Razorpay account or sign in.
3. In test mode, go to **Settings → API Keys → Generate Key**.
4. Save the **Key ID** and **Key Secret** securely.
5. The Key ID starts with `rzp_test_` in test mode.

### Production Mode (Live)

1. Complete Razorpay KYC and activate your account.
2. Switch to **Live mode** in the dashboard.
3. Go to **Settings → API Keys → Generate Key**.
4. The Key ID starts with `rzp_live_` in production.

### Configure Frontend

Add the **public** Key ID to your `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

This is safe to expose — the Key ID alone cannot authorize payments. It is used only to open the Razorpay Checkout modal.

### Configure Edge Function Secrets

The **Key Secret** must ONLY be stored as a Supabase Edge Function secret (never in `.env` or frontend code):

```bash
supabase secrets set RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
supabase secrets set RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
```

Or via the Supabase Dashboard: **Project Settings → Edge Functions → Secrets**.

### Difference Between `VITE_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

| Variable | Where | Purpose |
|---|---|---|
| `VITE_RAZORPAY_KEY_ID` | Frontend `.env` | Opens Razorpay Checkout modal (public, safe) |
| `RAZORPAY_KEY_ID` | Supabase Edge Function secret | Creates Razorpay orders server-side |
| `RAZORPAY_KEY_SECRET` | Supabase Edge Function secret | Verifies payment signatures server-side (NEVER expose) |

### Payment Flow

```
Customer clicks Pay
    → Frontend creates a pending order in Supabase
    → Frontend calls create-razorpay-order Edge Function
    → Edge Function creates Razorpay Order using Key ID + Secret
    → Razorpay Order ID returned to frontend
    → Frontend opens Razorpay Checkout modal
    → Customer completes payment
    → Razorpay returns payment_id + signature
    → Frontend sends payment details to verify-razorpay-payment Edge Function
    → Edge Function verifies HMAC-SHA256 signature using Key Secret
    → If valid: order.payment_status = 'paid', payment record created
    → Edge Function attempts Shiprocket order creation (non-blocking)
    → Frontend redirects to order success page
```

---

## 8. Shiprocket Setup Guide

1. Go to [app.shiprocket.in](https://app.shiprocket.in) and create an account.
2. Complete your profile and add a **pickup location** (your warehouse address).
3. The pickup location name must match what the Edge Function sends (default: "Primary"). You can change this in the Shiprocket dashboard under **Settings → Pickup Locations**.
4. Your Shiprocket API credentials are your **registered email** and **password**.

### Configure Shiprocket Credentials as Supabase Secrets

```bash
supabase secrets set SHIPROCKET_EMAIL=YOUR_SHIPROCKET_EMAIL
supabase secrets set SHIPROCKET_PASSWORD=YOUR_SHIPROCKET_PASSWORD
```

Or via the Supabase Dashboard: **Project Settings → Edge Functions → Secrets**.

**Shiprocket credentials must NOT be exposed in frontend code or `.env` files.** They are only used inside Edge Functions.

### Shipping Flow

```
Payment verified successfully
    → Edge Function fetches order + items + address from Supabase
    → Edge Function authenticates with Shiprocket API
    → Edge Function creates Shiprocket order (POST /orders/create/adhoc)
    → Edge Function requests AWB assignment (POST /courier/assign/awb)
    → Shipment record updated with shiprocket_order_id, shipment_id, awb_code, courier_name
    → Order updated with courier and tracking_number
```

If Shiprocket fails after successful payment, the payment remains valid and the order stays paid. The shipment stays in `pending` status and can be retried from the admin panel.

---

## 9. Supabase Edge Function Secrets

All secrets are configured via the Supabase CLI or Dashboard:

```bash
supabase secrets set RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
supabase secrets set RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
supabase secrets set SHIPROCKET_EMAIL=YOUR_SHIPROCKET_EMAIL
supabase secrets set SHIPROCKET_PASSWORD=YOUR_SHIPROCKET_PASSWORD
```

Or via Dashboard: **Project Settings → Edge Functions → Secrets**.

The following secrets are automatically provided by Supabase and do not need manual configuration:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Required secrets to set manually:**

| Secret | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` | Server-side Razorpay order creation |
| `RAZORPAY_KEY_SECRET` | Server-side payment signature verification |
| `SHIPROCKET_EMAIL` | Shiprocket API authentication |
| `SHIPROCKET_PASSWORD` | Shiprocket API authentication |

---

## 10. Environment Variables

### Frontend (`.env` file in project root)

These are safe to expose to the browser:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

### Backend / Edge Function Secrets

These must NEVER be in `.env` or any frontend-accessible file:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Auto-provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase |
| `RAZORPAY_KEY_ID` | Server-side Razorpay operations |
| `RAZORPAY_KEY_SECRET` | Payment signature verification |
| `SHIPROCKET_EMAIL` | Shiprocket API auth |
| `SHIPROCKET_PASSWORD` | Shiprocket API auth |

### .gitignore

The `.gitignore` file includes:
```
.env
.env.local
.env.*.local
```

This ensures secrets are never committed to version control.

---

## 11. Edge Functions

The project includes three Edge Functions:

### create-razorpay-order

Creates a Razorpay order using the server-side Key ID and Key Secret. Called by the frontend before opening the Razorpay Checkout modal.

**Endpoint:** `POST /functions/v1/create-razorpay-order`
**Request body:**
```json
{ "amount": 1500, "currency": "INR" }
```
**Response:**
```json
{ "success": true, "order_id": "order_abc123", "amount": 150000, "currency": "INR" }
```

### verify-razorpay-payment

Verifies the Razorpay payment signature server-side, records the payment in the `payments` table, updates the order to `paid`, creates a shipment record, and attempts Shiprocket order creation. Includes idempotency checks to prevent duplicate payment records.

**Endpoint:** `POST /functions/v1/verify-razorpay-payment`
**Request body:**
```json
{
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "hex_signature",
  "order_uuid": "uuid-of-local-order",
  "user_id": "uuid-of-user",
  "amount": 1500,
  "method": "upi"
}
```

### shiprocket-estimate

Authenticates with Shiprocket and returns a token for shipping rate estimation.

**Endpoint:** `POST /functions/v1/shiprocket-estimate`

### Deploying Edge Functions

Using the Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy shiprocket-estimate
```

Or deploy via the Supabase Dashboard.

---

## 12. Testing Guide

### Test 1 — Authentication

1. Go to `/signup`
2. Enter full name, email, phone, password
3. Check email for verification link
4. Click verification link
5. Go to `/login` and sign in
6. Verify redirect to `/shop`
7. Sign out and verify redirect

### Test 2 — Address

1. Sign in and go to `/profile`
2. Navigate to **Addresses** tab
3. Click **Add new**
4. Fill all fields (full name, phone, address lines, city, state, pincode)
5. Save and verify address appears in list
6. Set as default
7. Refresh page and verify address persists
8. Edit address and verify changes save
9. Delete address and verify removal

### Test 3 — Cart

1. Go to `/shop`
2. Add a product to cart
3. Go to `/cart` and verify item appears with correct price
4. Change quantity and verify subtotal updates
5. Remove product and verify cart empties
6. Verify GST (18%) and shipping calculation

### Test 4 — Razorpay Payment

1. Add products to cart
2. Go to `/checkout`
3. Select or add an address
4. Proceed to payment step
5. Click **Pay via Razorpay**
6. Use Razorpay test card: `4111 1111 1111 1111`, any future expiry, any CVV
7. Complete payment
8. Verify redirect to order success page
9. Check `payments` table in Supabase — record should have `status: 'paid'`
10. Check `orders` table — `payment_status: 'paid'`, `status: 'confirmed'`
11. Go to `/orders` and verify order appears

### Test 5 — Shiprocket

1. After successful payment, check `shipments` table
2. If Shiprocket credentials are configured, verify:
   - `shiprocket_order_id` is populated
   - `shipment_id` is populated
   - `awb_code` is populated (may take a few seconds)
   - `courier_name` is populated
   - `shipment_status` is `'created'`
3. If Shiprocket credentials are NOT configured, verify:
   - Shipment record exists with `shipment_status: 'pending'`
   - Order is still `paid` and `confirmed`

### Test 6 — Failure Cases

| Scenario | Expected Behavior |
|---|---|
| Cancelled payment | Order stays `pending`, payment_status stays `pending`, toast: "Payment was cancelled" |
| Failed payment | Order `payment_status: 'failed'`, no shipment created |
| Invalid signature | Edge Function returns 400, order `payment_status: 'failed'` |
| Duplicate verification | Edge Function returns success with `duplicate: true`, no new records created |
| Shiprocket API failure | Payment stays `paid`, shipment stays `pending`, no error shown to customer |

---

## 13. Troubleshooting Guide

### Supabase 400 (Bad Request)

**Cause:** The request payload contains fields that don't exist in the database table, or required fields are missing.

**Fix:**
- Check the table schema in Supabase Dashboard → Table Editor
- Compare the columns your code sends with the actual table columns
- If the frontend sends `alternate_number`, `landmark`, `district`, `address_type`, or `updated_at` for addresses, those columns must exist in the `addresses` table (they are added by the migration)

### Supabase 401 (Unauthorized)

**Cause:** The anon key is missing, invalid, or expired.

**Fix:**
- Verify `VITE_SUPABASE_ANON_KEY` in `.env` is correct
- Verify the Supabase client is initialized with the correct URL and key
- Check that the key hasn't been rotated in the Supabase dashboard

### Supabase 403 (Forbidden)

**Cause:** Row Level Security policy blocked the request.

**Fix:**
- Check that the user is authenticated (RLS policies require `auth.uid()`)
- Verify the RLS policy allows the operation (SELECT/INSERT/UPDATE/DELETE)
- Check that the `user_id` column in the row matches `auth.uid()`

### Supabase 404 (Not Found)

**Cause:** The table or Edge Function does not exist.

**Fix:**
- For `/rest/v1/payments` 404: run the migration that creates the `payments` table
- For `/rest/v1/shipments` 404: run the migration that creates the `shipments` table
- For Edge Function 404: deploy the function using `supabase functions deploy <name>`

### RLS Errors

**Symptom:** `PostgrestException: new row violates row-level security policy`

**Fix:**
- Ensure the table has the correct INSERT policy with `WITH CHECK (auth.uid() = user_id)`
- Ensure the `user_id` column has a default of `auth.uid()` or is explicitly set
- Do NOT disable RLS — fix the policy instead

### Invalid API Key

**Fix:** Regenerate keys in Supabase Dashboard → Settings → API. Update `.env` and redeploy Edge Functions.

### Razorpay Order Creation Failure

**Symptom:** Edge Function returns `Razorpay credentials are not configured`

**Fix:**
- Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Supabase secrets
- Verify the Key ID and Secret match (test keys start with `rzp_test_`)

### Razorpay Signature Verification Failure

**Symptom:** Edge Function returns `Payment signature verification failed`

**Fix:**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Ensure the signature is computed as `HMAC-SHA256(razorpay_order_id|razorpay_payment_id)` using the Key Secret
- Check that the `razorpay_signature` from the frontend matches what Razorpay sent

### Shiprocket Authentication Failure

**Symptom:** `Shiprocket auth failed`

**Fix:**
- Verify `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are set as Supabase secrets
- Verify the credentials are correct by logging into app.shiprocket.in
- Check that the account is active

### Shiprocket Order Creation Failure

**Symptom:** `Shiprocket order creation failed`

**Fix:**
- Verify the pickup location name matches (default: "Primary")
- Check that all required fields are present (address, pincode, phone, etc.)
- Verify the pincode is serviceable by Shiprocket
- The payment remains valid — only the shipment is affected

### Missing AWB

**Cause:** AWB assignment can fail if no courier is available for the route.

**Fix:**
- The shipment record will still have `shiprocket_order_id` and `shipment_id`
- Manually assign a courier from the Shiprocket dashboard
- The order remains paid and confirmed

### Duplicate Order

**Fix:** The Edge Function checks for existing payments by `razorpay_payment_id` before inserting. If a payment with `status: 'paid'` already exists, it returns `duplicate: true` without creating new records.

### Duplicate Shipment

**Fix:** The Edge Function checks for existing shipments by `order_id` before inserting. Only one shipment record is created per order.

### Environment Variable Not Found

**Symptom:** `Missing Supabase environment variables`

**Fix:**
- Ensure `.env` file exists in the project root
- Verify variable names start with `VITE_` (required for Vite to expose them to the browser)
- Restart the dev server after changing `.env`

### Edge Function Deployment Failure

**Fix:**
- Ensure you're linked to the correct project: `supabase link --project-ref YOUR_PROJECT_REF`
- Verify the function code has no syntax errors
- Check Deno version compatibility

### CORS Errors

**Symptom:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix:**
- All Edge Functions include the required CORS headers
- If you see CORS errors, verify the Edge Function is deployed and includes the `corsHeaders` object
- The headers must be present on all responses (success, error, and OPTIONS preflight)
=======
# miccroten-website
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
