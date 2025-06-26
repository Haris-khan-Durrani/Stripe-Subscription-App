const pool = require('./db');

// async function saveSubscriptionToDB(clientId, stripeCustomerId, stripeSubscriptionId) {
//   const conn = await pool.getConnection();
//   try {
//     console.log('🔄 Saving to DB:', { clientId, stripeCustomerId, stripeSubscriptionId });

//     await conn.execute(
//       'INSERT INTO subscriptions (client_id, stripe_customer_id, stripe_subscription_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stripe_subscription_id = ?',
//       [clientId, stripeCustomerId, stripeSubscriptionId, stripeSubscriptionId]
//     );

//     console.log(`✅ Subscription saved for clientId: ${clientId}`);
//   } catch (err) {
//     console.error('❌ DB Save Error:', err.message);
//   } finally {
//     conn.release();
//   }
// }
//const pool = require('./db');

async function saveSubscriptionToDB(clientId, stripeCustomerId, stripeSubscriptionId) {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Saving to DB:', { clientId, stripeCustomerId, stripeSubscriptionId });

    const [result] = await conn.execute(
      `INSERT INTO subscriptions (client_id, stripe_customer_id, stripe_subscription_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE stripe_subscription_id = VALUES(stripe_subscription_id)`,
      [clientId, stripeCustomerId, stripeSubscriptionId]
    );

    console.log('✅ DB Insert Result:', result);
  } catch (err) {
    console.error('❌ DB Save Error:', err); // FULL error
  } finally {
    conn.release();
  }
}


async function getStripeCustomerIdFromDB(clientId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT stripe_customer_id FROM subscriptions WHERE client_id = ?',
      [clientId]
    );
    return rows.length ? rows[0].stripe_customer_id : null;
  } catch (err) {
    console.error('❌ DB Fetch Error:', err.message);
    return null;
  } finally {
    conn.release();
  }
}

module.exports = { saveSubscriptionToDB, getStripeCustomerIdFromDB };
