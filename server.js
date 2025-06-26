require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { saveSubscriptionToDB } = require('./utils/subscription');
//const statusRoutes = require('./routes/subscriptionStatus');

const app = express();

// // ✅ Webhook must be registered BEFORE any body parser (express.json)
// app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error('❌ Webhook Error:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   console.log(`📨 Stripe Event: ${event.type}`);

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
//     const clientId = session.metadata?.clientId;
//     console.log('✅ Session complete for clientId:', clientId);
//     // TODO: Save session.customer and session.subscription to DB
//   }

// if (event.type === 'customer.subscription.created') {
//   const subscription = event.data.object;
//   const clientId = subscription.metadata?.clientId;
//   const customerId = subscription.customer;
//   const subscriptionId = subscription.id;

//   console.log('✅ Subscription created for clientId:', clientId);

//   // ✅ Save to DB
//   const { saveSubscriptionToDB } = require('./subscription');
//   await saveSubscriptionToDB(clientId, customerId, subscriptionId);
// }
//   res.status(200).send('✅ Webhook received');
// });


app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Stripe Event: ${event.type}`);

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const clientId = subscription.metadata?.clientId;
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;

    console.log('✅ Subscription created for clientId:', clientId);

    try {
      await saveSubscriptionToDB(clientId, customerId, subscriptionId);
    } catch (dbErr) {
      console.error('❌ DB Write Failed:', dbErr);
    }
  }

  res.status(200).send('✅ Webhook received');
});


// ✅ All other middleware goes after webhook registration
app.use(express.json());
app.use(express.static('public'));

// ✅ Routes
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const statusRoutes = require('./routes/subscriptionStatus');
app.use('/by-client', statusRoutes);

app.use('/products', productRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/subscription-status', statusRoutes);

// ✅ Test route
app.get('/test-webhook', (req, res) => {
  console.log('✅ Test webhook route hit');
  res.send('Webhook test OK');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
