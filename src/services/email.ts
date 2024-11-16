import emailjs from '@emailjs/browser';
import { encode } from '../utils/token';

const EMAILJS_SERVICE_ID = 'service_9rnpzax';
const EMAILJS_TEMPLATE_ID = 'template_z2wjtna';
const EMAILJS_PUBLIC_KEY = 'eF2duAHHBzfpPbHF4';

interface EmailParams {
  to_email: string;
  user_name: string;
  user_email: string;
  approve_url: string;
  reject_url: string;
}

export const sendApprovalEmail = async (params: EmailParams) => {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: 'unlessuser99@gmail.com',
        user_name: params.user_name,
        user_email: params.user_email,
        approve_url: params.approve_url,
        reject_url: params.reject_url,
        date: new Date().toLocaleDateString(),
      },
      EMAILJS_PUBLIC_KEY
    );
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};