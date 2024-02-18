/* eslint-disable no-console */
import axios from 'axios';

import { VF_PROJECT_ID, VF_TRANSCRIPT_ICON, VF_VERSION_ID } from '../constants';

const saveTranscript = async ({
  session,
  resetSession,
  phoneNumber,
  userName: originalUsername,
}) => {
  let name = originalUsername;

  if (VF_PROJECT_ID) {
    if (!name || name === '' || name === undefined) {
      name = 'Anonymous';
    }

    name += `: ${phoneNumber}`;

    axios({
      method: 'put',
      url: 'https://api.voiceflow.com/v2/transcripts',
      data: {
        browser: 'WhatsApp',
        device: 'desktop',
        os: 'server',
        sessionID: session,
        unread: true,
        versionID: VF_VERSION_ID,
        projectID: VF_PROJECT_ID,
        user: {
          name,
          image: VF_TRANSCRIPT_ICON,
        },
      },
      headers: {
        Authorization: process.env.VF_API_KEY,
      },
    })
      .then(() => {
        console.log('Transcript Saved!');
      })
      .catch(() => console.error('Save transcript error'));
  }
  resetSession();
};

export default saveTranscript;
