# Stripe Subscription App

A Node.js + Express web application that allows users to subscribe to Stripe products using Stripe Checkout, and tracks their subscription status via webhook and MySQL integration.

## 🌐 Live Demo

[https://stripetest.crmsoftware.ae](https://stripetest.crmsoftware.ae)

---

## 📦 Features

- Fetches products and pricing from Stripe
- Checkout integration with subscription trial
- Tracks client-specific subscriptions using `clientId`
- Webhook to automatically record subscription in MySQL
- Subscription status check via API (`/by-client/:clientId`)
- Clean UI with email + plan selection

---

## 🧱 Tech Stack

- Node.js + Express
- Stripe API (Checkout + Webhooks)
- MySQL (using `mysql2/promise`)
- dotenv for environment config

---

## 🚀 Folder Structure

stripe-subscription-app/
│
├── public/ # Frontend HTML
│ ├── index.html # Main page
│ ├── success.html # Subscription success page
│ └── cancel.html # Cancelled/failed payment
│
├── routes/ # Express routes
│ ├── checkout.js # Handles session creation
│ ├── products.js # Fetch Stripe products
│ └── subscriptionStatus.js # Subscription status by client
│
├── .env # Environment variables
├── server.js # Main Express server
├── subscription.js # DB integration logic
├── db.js # MySQL connection
└── package.json # NPM config

yaml
Copy
Edit

---

## ⚙️ Installation

```bash
git clone https://github.com/Haris-khan-Durrani/Stripe-Subscription-App.git
cd stripe-subscription-app
```
```npm install```
## 🔐 Environment Setup
Create a .env file:

###env
```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=3012
```

## 🛠️ MySQL Setup
Create a database stripe_app and table:

```
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(255) NOT NULL UNIQUE,
  `stripe_customer_id` varchar(255) NOT NULL,
  `stripe_subscription_id` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Update your db.js:
```
### js
```
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'stripe_app',
  password: 'stripe_app',
  database: 'stripe_app',
});

module.exports = pool;

```
## ▶️ Running the App
```
npm start
Visit: http://localhost:3012
```

## 💳 Stripe Webhook Setup
Login to Stripe Dashboard

Go to Developers > Webhooks

Add your live server webhook endpoint:

```https://your-live-domain.com/webhook```
Select events like:

checkout.session.completed

customer.subscription.created

invoice.payment_succeeded

Copy the webhook secret (whsec_...) and paste into .env

## 📡 Webhook Handling
Webhook route is defined in server.js:


app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  // Signature verification & event handling
});
Events handled:

checkout.session.completed → clientId is extracted

customer.subscription.created → subscription saved in DB

## 🔍 Subscription Status API
Check if a client is subscribed:

GET /by-client/:clientId
Response (if subscribed):
```
{
  "subscribed": true,
  "status": "active",
  "current_period_end": 1782036805,
  "subscription_id": "sub_1..."
}
```
## 📄 Pages
```
/ — Subscription form

/success — After successful payment

/cancel — Payment cancelled
```
## 🧪 Testing with Stripe CLI (Optional)
```
stripe listen --forward-to localhost:3012/webhook```
✅ TODO (Enhancements)
Add subscription upgrade/downgrade support

Admin panel to view clients

Email confirmation after subscription

API authentication for /by-client/:id
