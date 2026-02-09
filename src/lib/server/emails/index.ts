import { env } from '$env/dynamic/private';

async function sendEmail(options: { to: string; link: string }) {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      api_key: env.SMTP2GO_API_KEY,
      sender: 'DeviceGalaxy <noreply@devicegalaxy.me>',
      to: [options.to],
      template_id: env.SMTP2GO_TEMPLATE_ID,
      template_data: {
        reset_link: options.link
      }
    })
  });

  if (!response.ok) {
    console.error(`Failed to send email to ${options.to}: ${response.statusText}`);
  }

  return await response.json();
}

function sendPasswordResetEmail(userEmail: string, resetURL: string): void {
  sendEmail({
    to: userEmail,
    link: resetURL
  }).catch((error) => {
    console.error('Email send error:', error);
  });
}

export { sendPasswordResetEmail };
