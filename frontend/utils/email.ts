import emailjs from '@emailjs/browser';

// Keys storage key
const STORAGE_KEY = 'aims_emailjs_config';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const getEmailConfig = (): EmailConfig | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveEmailConfig = (config: EmailConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearEmailConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const sendOtpEmail = async (toEmail: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  const config = getEmailConfig();

  // If no config found in LocalStorage, check if hardcoded placeholders are replaced
  if (!config) {
    console.warn('⚠️ EmailJS not configured in LocalStorage.');
    return { success: false, error: 'not_configured' };
  }

  try {
    // Initialize EmailJS with the user's Public Key
    emailjs.init(config.publicKey);

    /**
     * CRITICAL: These parameters must match the variables in your EmailJS Template.
     * 1. {{to_email}}: Controls who receives the email (Dynamic Recipient).
     * 2. {{otp_code}}: The actual code to display in the body.
     */
    const templateParams = {
      to_email: toEmail,     // This enables dynamic sending to user input
      otp_code: otp,         // The verification code
      reply_to: 'support@aims.iitrpr.ac.in',
    };

    // Send Email
    await emailjs.send(config.serviceId, config.templateId, templateParams);

    console.log(`✅ Email successfully sent to ${toEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error?.text || 'Network Error' };
  }
};