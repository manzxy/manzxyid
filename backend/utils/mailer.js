import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});
export async function sendSecurityEmail(to, subject, html) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) { console.warn('Email not configured'); return; }
  await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, html });
}
