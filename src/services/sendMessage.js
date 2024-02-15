/* eslint-disable no-console */
/* eslint-disable no-promise-executor-return */
/* eslint-disable radix */
/* eslint-disable no-await-in-loop */

import axios from 'axios';

import { WHATSAPP_TOKEN, WHATSAPP_VERSION } from '../constants';

/* eslint-disable no-plusplus */
const sendMessage = async (messages, phoneNumberId, originalFrom) => {
  let from = originalFrom;
  if (from === '5215553499792') {
    console.log('----------');
    console.log('Enviar a numero de Enrique');
    from = '525553499792';
  } else if (from === '5217298746246') {
    console.log('----------');
    console.log('Enviar a numero de Lalis');
    from = '527298746246';
  }

  const timeoutPerKB = 10; // Adjust as needed, 10 milliseconds per kilobyte
  for (let j = 0; j < messages.length; j++) {
    let data;
    let ignore = null;
    // Image
    if (messages[j].type === 'image') {
      console.log('IMAGEN');
      data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'image',
        image: {
          link: messages[j].value,
        },
      };
      // Audio
    } else if (messages[j].type === 'audio') {
      console.log('AUDIO');
      data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'audio',
        audio: {
          link: messages[j].value,
        },
      };
      // Buttons
    } else if (messages[j].type === 'buttons') {
      console.log('BUTTONS');
      data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: messages[j - 1]?.value || 'Make your choice',
          },
          action: {
            buttons: messages[j].buttons,
          },
        },
      };
      // Text
    } else if (messages[j].type === 'text') {
      console.log('TEXT');
      data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'text',
        text: {
          preview_url: true,
          body: messages[j].value,
        },
      };
    } else {
      console.log('IGNORE');
      ignore = true;
    }
    if (!ignore) {
      try {
        console.log('Enviando mensaje a facebook api...');
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/${WHATSAPP_VERSION}/${phoneNumberId}/messages`,
          data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          },
        });

        if (messages[j].type === 'image') {
          try {
            const response = await axios.head(messages[j].value);

            if (response.headers['content-length']) {
              const imageSizeKB = parseInt(response.headers['content-length']) / 1024;
              const timeout = imageSizeKB * timeoutPerKB;
              await new Promise((resolve) => setTimeout(resolve, timeout));
            }
          } catch (error) {
            console.error('Failed to fetch image size:', error);
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};

export default sendMessage;
