// Foody7 branded email templates — no Payload CMS mention

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0; padding: 0; background: #f9fafb;
`;

const ORANGE = "#f5821f";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Foody7</title>
</head>
<body style="${BASE_STYLE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); max-width:560px; width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:${ORANGE}; padding: 28px 40px; text-align:center;">
              <span style="font-size:32px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">FOODY<span style="color:#fff3e0;">7</span></span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding: 20px 40px; text-align:center; border-top: 1px solid #eee;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">© 2025 Foody7. Korean Food Delivery</p>
              <p style="margin:6px 0 0; color:#9ca3af; font-size:12px;">Seoul, South Korea · <a href="https://foody7.com" style="color:${ORANGE}; text-decoration:none;">foody7.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail(userName?: string): { subject: string; html: string; text: string } {
  const greeting = userName ? `Hi ${userName}` : "Welcome";
  const html = layout(`
    <h1 style="margin:0 0 16px; font-size:24px; color:#111827;">${greeting}! 🎉</h1>
    <p style="margin:0 0 20px; color:#374151; font-size:16px; line-height:1.6;">
      Your Foody7 account is ready. Discover the best Korean restaurants and get them delivered to your door.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td>
          <a href="https://foody7.com" style="display:inline-block; background:${ORANGE}; color:#ffffff; font-weight:700; font-size:15px; padding:14px 32px; border-radius:8px; text-decoration:none;">
            Start Ordering
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.6;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `);

  return {
    subject: "Welcome to Foody7 🍜",
    html,
    text: `${greeting}! Your Foody7 account is ready. Visit foody7.com to start ordering.`,
  };
}

export function joinApplicationEmail(data: {
  name: string;
  phone: string;
  description: string;
}): { subject: string; html: string; text: string } {
  // Parse structured description fields like [restaurant: X]\n[email: Y]
  const parse = (key: string) =>
    data.description.match(new RegExp(`\\[${key}: ([^\\]]+)\\]`))?.[1] ?? "—";

  const restaurant = parse("restaurant");
  const email      = parse("email");
  const city       = parse("city");
  const cuisine    = parse("cuisine");
  const orders     = parse("monthly_orders");
  const tier       = parse("tier");
  const message    = parse("message");

  const row = (label: string, value: string) =>
    value === "—" ? "" : `
      <tr>
        <td style="padding:8px 0; color:#6b7280; font-size:14px; width:140px; vertical-align:top;">${label}</td>
        <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:500;">${value}</td>
      </tr>`;

  const html = layout(`
    <h1 style="margin:0 0 6px; font-size:22px; color:#111827;">New restaurant application 🍽️</h1>
    <p style="margin:0 0 24px; color:#6b7280; font-size:14px;">Submitted via foody7.com/join</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;">
      ${row("Restaurant", restaurant)}
      ${row("Owner", data.name)}
      ${row("Phone", data.phone)}
      ${row("Email", email)}
      ${row("City", city)}
      ${row("Cuisine", cuisine)}
      ${row("Monthly orders", orders)}
      ${row("Interested tier", tier)}
      ${row("Message", message)}
    </table>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td>
          <a href="https://foody7.com/admin/collections/FeedbackAndCooperations" style="display:inline-block; background:${ORANGE}; color:#ffffff; font-weight:700; font-size:14px; padding:12px 24px; border-radius:8px; text-decoration:none;">
            View in Admin →
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `New join application — ${restaurant}`,
    html,
    text: `New join application from ${restaurant}\nOwner: ${data.name} | Phone: ${data.phone} | Email: ${email}\nCity: ${city} | Tier: ${tier}\n\nhttps://foody7.com/admin/collections/FeedbackAndCooperations`,
  };
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string; text: string } {
  const html = layout(`
    <h1 style="margin:0 0 16px; font-size:24px; color:#111827;">Reset your password</h1>
    <p style="margin:0 0 20px; color:#374151; font-size:16px; line-height:1.6;">
      We received a request to reset your Foody7 account password. Click the button below to set a new password.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td>
          <a href="${resetUrl}" style="display:inline-block; background:${ORANGE}; color:#ffffff; font-weight:700; font-size:15px; padding:14px 32px; border-radius:8px; text-decoration:none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px; color:#6b7280; font-size:14px; line-height:1.6;">
      Or copy this link into your browser:
    </p>
    <p style="margin:0 0 20px; word-break:break-all;">
      <a href="${resetUrl}" style="color:${ORANGE}; font-size:13px;">${resetUrl}</a>
    </p>
    <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.6;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
    </p>
  `);

  return {
    subject: "Reset your Foody7 password",
    html,
    text: `Reset your Foody7 password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  };
}
