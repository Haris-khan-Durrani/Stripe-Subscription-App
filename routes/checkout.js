const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// router.post('/create-session', async (req, res) => {
//   const { priceId, customerEmail } = req.body;
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [{ price: priceId, quantity: 1 }],
//       customer_email: customerEmail,
//       subscription_data: { trial_period_days: 360 },
//       success_url: 'https://your-site.com/success',
//       cancel_url: 'https://your-site.com/cancel',
//     });
//     res.json({ url: session.url });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// router.post('/create-session', async (req, res) => {
//   const { priceId, customerEmail, clientId } = req.body;

//   try {
//     // First, search your own database for the customer by clientId
//     // and get their Stripe customer ID (if you've stored it)
//     const stripeCustomerId = await getStripeCustomerIdFromYourDB(clientId); // <- Your logic here

//     if (stripeCustomerId) {
//       const subscriptions = await stripe.subscriptions.list({
//         customer: stripeCustomerId,
//         status: 'all'
//       });

//       const existing = subscriptions.data.find(sub =>
//         ['active', 'trialing'].includes(sub.status) &&
//         sub.items.data.some(item => item.price.id === priceId)
//       );

//       if (existing) {
//         return res.status(409).json({ error: 'Subscription already exists for this client.' });
//       }
//     }

//     // Either new customer or no active subscription — create new session
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [{ price: priceId, quantity: 1 }],
//       customer_email: customerEmail,
//       subscription_data: {
//         metadata: { clientId }, // Store clientId in Stripe metadata
//         trial_period_days: 360
//       },
//       success_url: 'https://your-site.com/success',
//       cancel_url: 'https://your-site.com/cancel',
//     });

//     res.json({ url: session.url });

//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// });

const { getStripeCustomerIdFromDB } = require('../utils/subscription');

router.post('/create-session', async (req, res) => {
  const { priceId, customerEmail, clientId } = req.body;

  try {
    const stripeCustomerId = await getStripeCustomerIdFromDB(clientId);

    if (stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
      });

      const existing = subscriptions.data.find(sub =>
        ['active', 'trialing'].includes(sub.status) &&
        sub.items.data.some(item => item.price.id === priceId)
      );

      if (existing) {
        return res.status(409).json({ error: 'Already subscribed' });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      metadata: { clientId },
      subscription_data: {
        metadata: { clientId },
        trial_period_days: 360,
      },
      success_url: 'https://stripetest.crmsoftware.ae/success.html',
      cancel_url: 'https://stripetest.crmsoftware.ae/cancel.html',
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});





module.exports = router;
