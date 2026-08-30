# 📬 Specpart Production Email & Notification Setup Guide

> **Note for the Next Developer / AI Agent:**
> **All backend email code is ALREADY fully implemented and integrated!**
> You do **NOT** need to write or modify any code.
> To activate live email delivery in production (Oracle Cloud / VPS), you only need to configure the API credentials and DNS records below.

---

## 🌟 What Emails Are Automated?

The system is configured to send automatic transactional emails with zero latency:

1. **📦 New Orders (Dual Email)**:
   - **Customer Email**: Order confirmation receipt with itemized breakdown, prices in TND, delivery address, and reference `#ID`.
   - **Admin Alert** (`specpart@hotmail.com`): Instant notification of a new order with customer name, phone, Wilaya, and total amount.
2. **🎉 New Account Registration (Dual Email)**:
   - **Customer Email**: Personalized welcome email with store links.
   - **Admin Alert**: Notification of new registered customer.
3. **🔑 Password Reset / Forgot Password**:
   - **Customer Email**: Secure password reset link valid for 1 hour.
4. **🔐 Security Login Alert**:
   - **Customer Email**: Login notification with date and time.
   - **Admin Alert**: Security alert when an `ADMIN` or `SUPER_ADMIN` logs in.

---

## 🛠️ Step 1: Create Free Resend Account (Takes 2 minutes)

1. Go to **[https://resend.com](https://resend.com)** and create a free account (3,000 emails/month free).
2. Go to **API Keys** → click **Create API Key** (Name: `specpart-prod`, Permission: `Full Access`).
3. Copy the key (starts with `re_...`).

---

## 🌐 Step 2: Add Domain & DNS Records (For 100% Inbox Delivery)

1. In your Resend Dashboard, go to **Domains** → **Add Domain** (e.g., `specpart.tn`).
2. Resend will display 3 DNS records. Add them in your DNS manager (Cloudflare, Namecheap, OCI DNS, etc.):

| Type | Name / Host | Value | Purpose |
|---|---|---|---|
| **TXT** | `@` or `specpart.tn` | `v=spf1 include:resend.com ~all` | **SPF**: Authorizes server |
| **CNAME / TXT** | `resend._domainkey` | *Value provided by Resend* | **DKIM**: Cryptographic signature |
| **TXT** | `_dmarc` | `v=DMARC1; p=none;` | **DMARC**: Anti-spoofing policy |

3. Click **Verify Records** in Resend. Once verified, you have a 100% reputation score (emails go straight to Inbox, never Spam).

---

## ⚙️ Step 3: Configure Environment Variables

In your `backend/.env` file (or docker-compose environment), set:

```env
# ── Resend Email Configuration ─────────────────────────────────────────────
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM="Specpart <noreply@specpart.tn>"
ADMIN_NOTIFICATION_EMAIL="specpart@hotmail.com"
FRONTEND_URL="https://specpart.tn"
```

> **Development Mode:** If `RESEND_API_KEY` is not set or left as `local`, the backend will print all emails and password reset links to the console log without failing or throwing errors.

---

## 🧪 Step 4: Verification

To test that everything is working:
1. Restart backend container: `docker compose restart backend`
2. Register a new test account or trigger a password reset on the frontend.
3. Check the Resend dashboard **Emails** tab to see your delivery logs and analytics in real time!
