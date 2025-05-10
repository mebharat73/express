import { Resend } from "resend";

async function sendEmail(recipient, { subject, body }) {
  const resend = new Resend(process.env.EMAIL_SERVER_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [recipient],
    subject,
    html: body,
  });

  if (error) throw error;

  return data;
}

export default sendEmail;
