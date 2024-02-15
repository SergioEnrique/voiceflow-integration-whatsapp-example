export const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION || 'v17.0';
export const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || null;

export const PICOVOICE_API_KEY = process.env.PICOVOICE_API_KEY || null;

export const VF_API_KEY = process.env.VF_API_KEY || null;
export const VF_VERSION_ID = process.env.VF_VERSION_ID || 'development';
export const VF_PROJECT_ID = process.env.VF_PROJECT_ID || null;
export const VF_DM_URL = process.env.VF_DM_URL || 'https://general-runtime.voiceflow.com';
export const VF_TRANSCRIPT_ICON =
  'https://s3.amazonaws.com/com.voiceflow.studio/share/200x200/200x200.png';

export const DM_CONFIG = {
  tts: false,
  stripSSML: true,
};
