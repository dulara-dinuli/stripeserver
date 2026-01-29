// Server-side code for your backend
const express = require('express');
const stripe = require('stripe')('sk_test_51SuboXD5sDkko2yuQhOSBn82SahdLSZ19935OkxNLI7JmwFmmjjgLOmwCm6Mfq429XGz1Q3IQqq2hwBdhVxMxS1600cc8j8IrE');
const app = express();

app.use(express.json());

// Create Payment Intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save payment method endpoint
app.post('/save-payment-method', async (req, res) => {
  try {
    const { email, name, paymentMethod, priceId } = req.body;

    // Create or retrieve customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });

    // Optionally create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethod,
    });

    res.json({
      success: true,
      customerId: customer.id,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
