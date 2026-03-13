import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'failed', response: 'Method not allowed' });
    }

    const { fullName, companyName, email, telephone, subject, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !message || !subject) {
        return res.status(400).json({ 
            status: 'failed', 
            response: 'Full name, email, subject, and message are required fields' 
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'failed', response: 'Invalid email format.' });
    }

    // Map subject values to readable labels
    const subjectLabels = {
      diesel: 'Diesel Inquiry',
      ppe: 'PPE Inquiry',
      equipment: 'Equipment Inquiry',
      general: 'General Inquiry'
    };

    try {
          // const smtpPort = Number(process.env.MAIL_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 465, // Use 465 as default
        secure: true, // true for port 465
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        // Add these for better compatibility
        tls: {
            rejectUnauthorized: false // Only if you have certificate issues
        }
    });
    
    // Test the connection
    await transporter.verify();
    console.log('SMTP connection verified');
    
  
   

        const mailOptions = {
          from: `"Lamikawakila Investments Limited" <${process.env.MAIL_USER}>`,
          to: process.env.RECIPIENT_EMAIL,
          replyTo: email,
          // Add additional headers for better email client compatibility
          headers: {
            'X-Company-Name': 'Lamikawakila Investments Limited',
            'X-Department': 'Customer Service',
            'X-Inquiry-Type': subjectLabels[subject] || subject,
            'Return-Path': process.env.MAIL_USER,
             'Reply-To': email, // Explicitly set Reply-To header
            'From': `"Lamikawakila Investments Limited" <${process.env.MAIL_USER}>`
          },
          subject: `New Contact Form Submission: ${subjectLabels[subject] || subject} from ${fullName} | Lamikawakila Investments`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Form Submission</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #f4f4f4;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #1e3a34; padding: 30px 30px; border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: -0.3px;">New ${subjectLabels[subject] || 'Inquiry'}</h1>
                          <p style="margin: 8px 0 0 0; color: #bfa14a; font-size: 15px;">You've received a new message from your website</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;">
                          
                          <!-- Submission Date -->
                          <p style="margin: 0 0 25px 0; color: #888888; font-size: 14px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px;">
                            Received: ${new Date().toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          
                          <!-- Inquiry Type Highlight -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                            <tr>
                              <td style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #bfa14a;">
                                <strong style="color: #1e3a34; font-size: 16px;">Inquiry Type:</strong>
                                <span style="color: #bfa14a; font-size: 16px; margin-left: 10px; font-weight: 600;">${subjectLabels[subject] || subject}</span>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Contact Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                            <tr>
                              <td style="padding: 0 0 10px 0;">
                                <h2 style="margin: 0; color: #1e3a34; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</h2>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Full Name:</td>
                                    <td style="color: #333333; font-size: 14px; font-weight: 500;">${fullName}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${companyName ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Company:</td>
                                    <td style="color: #333333; font-size: 14px;">${companyName}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Email:</td>
                                    <td style="color: #333333; font-size: 14px;">
                                      <a href="mailto:${email}" style="color: #bfa14a; text-decoration: none;">${email}</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${telephone ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <table width="100%">
                                  <tr>
                                    <td style="color: #666666; width: 100px; font-size: 14px;">Telephone:</td>
                                    <td style="color: #333333; font-size: 14px;">${telephone}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                          
                          <!-- Message -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 15px 0 10px 0;">
                                <h2 style="margin: 0; color: #1e3a34; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</h2>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f9f9f9; padding: 20px; border-radius: 4px;">
                                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Reply Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 30px 0 15px 0;">
                                <a href="mailto:${email}?subject=Re: ${subjectLabels[subject] || 'Inquiry'} from ${fullName}&body=Dear ${fullName.split(' ')[0]}%2C%0A%0AThank you for contacting Lamikawakila Investments.%0A%0A" 
                                   style="display: inline-block; background-color: #bfa14a; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 15px;">
                                  Reply to ${fullName.split(' ')[0]}
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
                          <table width="100%">
                            <tr>
                              <td style="color: #666666; font-size: 13px; line-height: 1.5;">
                                <strong style="color: #1e3a34; display: block; margin-bottom: 5px;">Lamikawakila Investments Limited</strong>
                                Stand No. 95, President Avenue<br>
                                Town Centre, Ndola<br>
                                Copperbelt Province, Zambia
                              </td>
                              <td align="right" style="color: #666666; font-size: 13px;">
                                <a href="mailto:sophie@lamikawakila.com" style="color: #bfa14a; text-decoration: none; display: block; margin-bottom: 3px;">sophie@lamikawakila.com</a>
                                <span style="color: #999999;">+260 972 149 043</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                    
                    <!-- Legal Note -->
                    <table width="600" style="max-width: 600px; width: 100%; margin-top: 15px;">
                      <tr>
                        <td style="padding: 10px; text-align: center; color: #aaaaaa; font-size: 12px;">
                          PACRA Certificate: 120261040111 • ISIC: 0910<br>
                          This email was sent from the contact form on your website
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
          text: `
NEW CONTACT FORM SUBMISSION
============================
Received: ${new Date().toLocaleString()}

INQUIRY TYPE
------------
${subjectLabels[subject] || subject}

CONTACT INFORMATION
-------------------
Full Name: ${fullName}
${companyName ? `Company: ${companyName}` : ''}
Email: ${email}
${telephone ? `Telephone: ${telephone}` : ''}

MESSAGE
-------
${message}

---
This message was sent from the contact form on your website

Lamikawakila Investments Limited
Stand No. 95, President Avenue, Town Centre, Ndola
Copperbelt Province, Zambia
Email: sophie@lamikawakila.com | Tel: +260 972 149 043
PACRA Certificate: 120261040111 | ISIC: 0910

To reply to ${fullName}, simply reply to this email or click here: mailto:${email}?subject=Re: ${subjectLabels[subject] || 'Inquiry'} from ${fullName}
          `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ status: 'success', response: 'Message sent successfully' });

    } catch (error) { 
        console.error('Email error:', error);
        return res.status(500).json({ status: 'failed', response: `Mailer Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});