import sendEmail from '../utils/email.js';

export const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Email to site owner
    await sendEmail(process.env.EMAIL_TO, {
      subject: `New contact from ${name}`,
      body: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    // Auto-reply to sender
    await sendEmail(email, {
      subject: 'Thank you for contacting us!',
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for your message. We will soon contact you.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
};
