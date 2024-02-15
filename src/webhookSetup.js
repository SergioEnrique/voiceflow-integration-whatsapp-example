/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
const webhookSetup = async (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN IN .env FILE
   *This will be the Verify Token value when you set up webhook
   * */

  // Parse params from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if ((mode === 'subscribe' && token === process.env.VERIFY_TOKEN) || 'voiceflow') {
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

export default webhookSetup;
