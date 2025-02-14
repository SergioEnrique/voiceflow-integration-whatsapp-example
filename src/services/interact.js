/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import to from 'await-to-js';
import axios from 'axios';

import { DM_CONFIG, VF_API_KEY, VF_DM_URL, VF_VERSION_ID } from '../constants';
import { rndID, truncateString } from '../utils';

import saveTranscript from './saveTranscript';
import sendMessage from './sendMessage';

let noreplyTimeout = null;

let session = 0;

const resetSession = () => {
  session = `${VF_VERSION_ID}.${rndID()}`;
  return session;
};

const endSession = () => {
  session = null;
};

async function sendNoReply({ userId, phoneNumberId, userName }) {
  clearTimeout(noreplyTimeout);
  console.log('No reply');

  const [errSendNoReply] = await to(
    interact({
      userId,
      request: {
        type: 'no-reply',
      },
      phoneNumberId,
      userName,
    })
  );
  if (errSendNoReply) {
    throw new Error('SendNoReply Error');
  }
}

async function interact({ userId, request, phoneNumberId, userName }) {
  clearTimeout(noreplyTimeout);

  if (!session) {
    resetSession();
  }

  const [err] = await to(
    axios({
      method: 'PATCH',
      url: `${VF_DM_URL}/state/user/${encodeURI(userId)}/variables`,
      headers: {
        Authorization: VF_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        user_id: userId,
        user_name: userName,
      },
    })
  );
  if (err) {
    console.log(err);
    throw new Error('Voiceflow patch variables Error');
  }

  const [errInteract, response] = await to(
    axios({
      method: 'POST',
      url: `${VF_DM_URL}/state/user/${encodeURI(userId)}/interact`,
      headers: {
        Authorization: VF_API_KEY,
        'Content-Type': 'application/json',
        versionID: VF_VERSION_ID,
        sessionID: session,
      },
      data: {
        action: request,
        config: DM_CONFIG,
      },
    })
  );
  if (errInteract) {
    throw new Error('Voiceflow interaction error');
  }

  let isEnding = response.data.filter(({ type }) => type === 'end');

  if (isEnding.length > 0) {
    console.log('isEnding');
    isEnding = true;
    saveTranscript({ session, resetSession, phoneNumber: userId, userName });
  } else {
    isEnding = false;
  }

  const messages = [];

  for (let i = 0; i < response.data.length; i++) {
    if (response.data[i].type === 'text') {
      let tmpspeech = '';

      for (let j = 0; j < response.data[i].payload.slate.content.length; j++) {
        for (let k = 0; k < response.data[i].payload.slate.content[j].children.length; k++) {
          if (response.data[i].payload.slate.content[j].children[k].type) {
            if (response.data[i].payload.slate.content[j].children[k].type === 'link') {
              tmpspeech += response.data[i].payload.slate.content[j].children[k].url;
            }
          } else if (
            response.data[i].payload.slate.content[j].children[k].text !== '' &&
            response.data[i].payload.slate.content[j].children[k].fontWeight
          ) {
            tmpspeech += `*${response.data[i].payload.slate.content[j].children[k].text}*`;
          } else if (
            response.data[i].payload.slate.content[j].children[k].text !== '' &&
            response.data[i].payload.slate.content[j].children[k].italic
          ) {
            tmpspeech += `_${response.data[i].payload.slate.content[j].children[k].text}_`;
          } else if (
            response.data[i].payload.slate.content[j].children[k].text !== '' &&
            response.data[i].payload.slate.content[j].children[k].underline
          ) {
            tmpspeech +=
              // no underline in WhatsApp
              response.data[i].payload.slate.content[j].children[k].text;
          } else if (
            response.data[i].payload.slate.content[j].children[k].text !== '' &&
            response.data[i].payload.slate.content[j].children[k].strikeThrough
          ) {
            tmpspeech += `~${response.data[i].payload.slate.content[j].children[k].text}~`;
          } else if (response.data[i].payload.slate.content[j].children[k].text !== '') {
            tmpspeech += response.data[i].payload.slate.content[j].children[k].text;
          }
        }
        tmpspeech += '\n';
      }
      if (response.data[i + 1]?.type && response.data[i + 1]?.type === 'choice') {
        messages.push({
          type: 'body',
          value: tmpspeech,
        });
      } else {
        messages.push({
          type: 'text',
          value: tmpspeech,
        });
      }
    } else if (response.data[i].type === 'speak') {
      if (response.data[i].payload.type === 'audio') {
        messages.push({
          type: 'audio',
          value: response.data[i].payload.src,
        });
      } else if (response.data[i + 1]?.type && response.data[i + 1]?.type === 'choice') {
        messages.push({
          type: 'body',
          value: response.data[i].payload.message,
        });
      } else {
        messages.push({
          type: 'text',
          value: response.data[i].payload.message,
        });
      }
    } else if (response.data[i].type === 'visual') {
      messages.push({
        type: 'image',
        value: response.data[i].payload.image,
      });
    } else if (response.data[i].type === 'choice') {
      let buttons = [];
      for (let b = 0; b < response.data[i].payload.buttons.length; b++) {
        let link = null;
        if (
          response.data[i].payload.buttons[b].request.payload.actions !== undefined &&
          response.data[i].payload.buttons[b].request.payload.actions.length > 0
        ) {
          link = response.data[i].payload.buttons[b].request.payload.actions[0].payload.url;
        }
        if (link) {
          // Ignore links
        } else if (response.data[i].payload.buttons[b].request.type.includes('path-')) {
          //   const id = response.data[i].payload.buttons[b].request.payload.label;
          buttons.push({
            type: 'reply',
            reply: {
              id: response.data[i].payload.buttons[b].request.type,
              title:
                truncateString(response.data[i].payload.buttons[b].request.payload.label) ?? '',
            },
          });
        } else {
          buttons.push({
            type: 'reply',
            reply: {
              id: response.data[i].payload.buttons[b].request.payload.intent.name,
              title:
                truncateString(response.data[i].payload.buttons[b].request.payload.label) ?? '',
            },
          });
        }
      }
      if (buttons.length > 3) {
        buttons = buttons.slice(0, 3);
      }
      messages.push({
        type: 'buttons',
        buttons,
      });
    } else if (response.data[i].type === 'no-reply' && isEnding === false) {
      console.log('Es no-reply');
      noreplyTimeout = setTimeout(
        () => {
          sendNoReply({ userId, request, phoneNumberId, userName });
        },
        Number(response.data[i].payload.timeout) * 1000
      );
    }
  }

  const [errSendMessage] = await to(sendMessage({ messages, phoneNumberId, originalFrom: userId }));
  if (errSendMessage) throw new Error('Send message error');

  if (isEnding === true) {
    endSession();
  }
}

export default interact;
