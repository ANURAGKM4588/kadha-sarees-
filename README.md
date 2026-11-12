# KADHA — Handcrafted Handloom Saree Storefront & Backend

A full-stack, responsive, luxury e-commerce web platform for KADHA handloom sarees. Built with custom typography (`DM Sans` & `Manrope`), Apple-style interactive motions, responsive layouts, a secure Node.js Express backend, Supabase PostgreSQL database integration, and Razorpay Payment Gateway integration.

---

## 🚀 Quick Start

### 1. Start the Server
```bash
npm install
npm start
```
- **Storefront URL:** [http://localhost:8000](http://localhost:8000)
- **Admin Dashboard:** [http://localhost:8000/admin.html](http://localhost:8000/admin.html)
- **Backend API Health:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 💳 Razorpay Payment Gateway Integration

The payment gateway is implemented adhering to PCI-DSS and security best practices:
- **Zero Frontend Secrets:** Only the public `key_id` is passed dynamically to the client. The confidential `RAZORPAY_KEY_SECRET` resides strictly in `.env` and is never exposed in client code or Git.
- **Server-Side Order Creation:** Orders are created directly with Razorpay's API via `POST /api/razorpay/create-order` in paise.
- **Cryptographic Signature Verification:** Successful transactions are authenticated on the backend using HMAC-SHA256 timing-safe comparison (`POST /api/razorpay/verify-payment`) before confirming orders.
- **Supported Payment Modes:** UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay), NetBanking, and Digital Wallets.

---

## 🔒 Confidential Credentials & Environment

Credentials are kept safe in `.env` (which is tracked in `.gitignore`):
```env
PORT=8000
SUPABASE_URL=https://oglbbffvqyqrlctkycfs.supabase.co
SUPABASE_KEY=sb_publishable_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```
A sanitized template is provided in `.env.example`.

---

## 🛍️ Pages & Architecture

- **Home (`/index.html`):** Pure white hero, responsive 5-column card collage, Apple-style 3D tilt sheen on hover, center alignment.
- **Collections (`/collections.html`):** Saree catalogue with category filters (Mulmul, Narayani, Sungudi), price sorting, quick view modal, and live cart drawer.
- **Our Story (`/story.html`):** Brand narrative, weaver community chapters, and core craft values.
- **The Craft (`/craft.html`):** 4-stage handloom weaving process and weave comparison guide.
- **Journal (`/journal.html`):** Saree styling stories, drape guides, and community gallery.
- **My Account (`/account.html`):** Customer portal with live order tracking and saved wishlist.
- **Contact & Care (`/contact.html`):** Drape consultation booking form and heirloom fabric care guide.
- **Admin Overview (`/admin.html`):** Sales analytics, revenue charts, and live order management.
