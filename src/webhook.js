/* eslint-disable no-console */
import fs from 'fs';

import { Leopard } from '@picovoice/leopard-node';
import axios from 'axios';

import { PICOVOICE_API_KEY, WHATSAPP_TOKEN, WHATSAPP_VERSION } from './constants';
import interact from './services/interact';

const webhook =
  ({ session, resetSession }) =>
  async (req, res) => {
    // Check the Incoming webhook message
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages

    if (req.body.object) {
      const isNotInteractive = req.body?.entry[0]?.changes[0]?.value?.messages?.length || null;
      if (isNotInteractive) {
        const { phoneNumberId } = req.body.entry[0].changes[0].value.metadata;
        const userId = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        const userName = req.body.entry[0].changes[0].value.contacts[0].profile.name;
        if (req.body.entry[0].changes[0].value.messages[0].text) {
          await interact({
            originalSession: session,
            resetSession,
            userId,
            request: {
              type: 'text',
              payload: req.body.entry[0].changes[0].value.messages[0].text.body,
            },
            phoneNumberId,
            userName,
          });
        } else if (req.body?.entry[0]?.changes[0]?.value?.messages[0]?.audio) {
          if (
            req.body?.entry[0]?.changes[0]?.value?.messages[0]?.audio?.voice === true &&
            PICOVOICE_API_KEY
          ) {
            const mediaURL = await axios({
              method: 'GET',
              url: `https://graph.facebook.com/${WHATSAPP_VERSION}/${req.body.entry[0].changes[0].value.messages[0].audio.id}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              },
            });

            const rndFileName = `audio_${Math.random().toString(36).substring(7)}.ogg`;

            axios({
              method: 'get',
              url: mediaURL.data.url,
              headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              },
              responseType: 'stream',
            }).then((response) => {
              const engineInstance = new Leopard(PICOVOICE_API_KEY);
              const wstream = fs.createWriteStream(rndFileName);
              response.data.pipe(wstream);
              wstream.on('finish', async () => {
                console.log('Analysing Audio file');
                const { transcript } = engineInstance.processFile(rndFileName);
                engineInstance.release();
                fs.unlinkSync(rndFileName);
                if (transcript && transcript !== '') {
                  console.log('User audio:', transcript);
                  await interact(
                    userId,
                    {
                      type: 'text',
                      payload: transcript,
                    },
                    phoneNumberId,
                    userName
                  );
                }
              });
            });
          }
        } else if (
          req.body.entry[0].changes[0].value.messages[0].interactive?.button_reply.id.includes(
            'path-'
          )
        ) {
          await interact(
            userId,
            {
              type: req.body.entry[0].changes[0].value.messages[0].interactive?.button_reply.id,
              payload: {
                label:
                  req.body.entry[0].changes[0].value.messages[0].interactive?.button_reply.title,
              },
            },
            phoneNumberId,
            userName
          );
        } else {
          await interact(
            userId,
            {
              type: 'intent',
              payload: {
                query:
                  req.body.entry[0].changes[0].value.messages[0].interactive?.button_reply.title,
                intent: {
                  name: req.body.entry[0].changes[0].value.messages[0].interactive?.button_reply.id,
                },
                entities: [],
              },
            },
            phoneNumberId,
            userName
          );
        }
      }
      res.status(200).json({ message: 'ok' });
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.status(400).json({ message: 'error | unexpected body' });
    }
  };

export default webhook;
