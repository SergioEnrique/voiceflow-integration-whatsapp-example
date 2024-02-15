/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
// import to from 'await-to-js';

import bodyParser from 'body-parser';
import express from 'express';

import webhook from './webhook';
import webhookSetup from './webhookSetup';

require('dotenv').config();

const app = express().use(bodyParser.json());

app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    info: 'WhatsApp API v1.1.2 | V⦿iceflow | 2023',
    status: 'healthy',
    error: null,
  });
});

// Accepts POST requests at /webhook endpoint
app.post('/webhook', webhook);

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get('/webhook', webhookSetup);
