/**
 * frontend/lib/crm/email-templates.ts
 *
 * Built-in email template library for the RentEase Enterprise CRM.
 * These are starter templates an admin can load into the template editor,
 * or push to the backend via the admin-intelligence email-template API.
 *
 * Variable tokens use the {{token}} syntax and are substituted at send time
 * by `applyTemplateVariables`. Supported tokens are listed per template so
 * the UI can render a variable picker.
 */

export type EmailTemplateCategory =
  | 'transactional'
  | 'marketing'
  | 'offer'
  | 'reminder'
  | 'newsletter'
  | 'automation'

export interface EmailTemplateDef {
  key: string
  name: string
  category: EmailTemplateCategory
  subject: string
  /** Plain-language description shown in the template picker. */
  description: string
  /** Tokens the template expects, used by the variable picker / preview. */
  variables: string[]
  htmlBody: string
}

/** Brand wrapper shared by every template. */
function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title></head>
<body style="margin:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08);">
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:24px 32px;">
          <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:.3px;">RentEase</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">${title}</h1>
          ${body}
          <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Thanks for being part of the RentEase family.<br/>— The RentEase Team</p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">You received this email from RentEase. If you no longer wish to receive these emails you can <a href="#" style="color:#4f46e5;">unsubscribe</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function button(label: string, href = '#'): string {
  return `<a href="${href}" style="display:inline-block;margin:18px 0;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">${label}</a>`
}

export const EMAIL_TEMPLATE_LIBRARY: EmailTemplateDef[] = [
  {
    key: 'welcome',
    name: 'Welcome',
    category: 'automation',
    subject: 'Welcome to RentEase, {{firstName}}! 🎉',
    description: 'Sent right after a customer signs up.',
    variables: ['firstName', 'city'],
    htmlBody: shell(
      'Welcome aboard, {{firstName}}!',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, welcome to <strong>RentEase</strong> — India's fastest-growing rental marketplace. From cameras to cars, find everything you need without the commitment of buying.</p>
       <p style="font-size:15px;line-height:1.6;color:#334155;">Your account is ready and you can start exploring thousands of products in {{city}} and across the country.</p>
       ${button('Start Exploring', '#')}
       <p style="font-size:14px;color:#64748b;">Use code <strong>WELCOME100</strong> for ₹100 off your first rental.</p>`,
    ),
  },
  {
    key: 'thank-you',
    name: 'Thank You',
    category: 'automation',
    subject: 'Thank you for renting with RentEase, {{firstName}}',
    description: 'Appreciation note after a completed rental.',
    variables: ['firstName', 'productName'],
    htmlBody: shell(
      'Thanks for choosing us, {{firstName}}!',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, we hope you loved your recent rental of <strong>{{productName}}</strong>. Thank you for trusting RentEase for your needs.</p>
       <p style="font-size:15px;line-height:1.6;color:#334155;">Your feedback helps us serve you better — and we can't wait to help with your next rental.</p>
       ${button('Rent Again', '#')}`,
    ),
  },
  {
    key: 'win-back',
    name: 'Win Back',
    category: 'marketing',
    subject: 'We miss you, {{firstName}} — here is 20% off 💛',
    description: 'Re-engage customers who have been inactive.',
    variables: ['firstName', 'offerCode'],
    htmlBody: shell(
      "We miss you, {{firstName}}!",
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, it's been a while since your last rental. We'd love to welcome you back with a special offer.</p>
       <p style="font-size:15px;line-height:1.6;color:#334155;">Enjoy <strong>20% off</strong> your next rental with code <strong>{{offerCode}}</strong>. Valid for 7 days only.</p>
       ${button('Claim My Offer', '#')}`,
    ),
  },
  {
    key: 'review-request',
    name: 'Review Request',
    category: 'automation',
    subject: 'How was your rental, {{firstName}}?',
    description: 'Ask for a product review after a rental.',
    variables: ['firstName', 'productName', 'rentalId'],
    htmlBody: shell(
      'Share your experience, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, how did <strong>{{productName}}</strong> work out for you? Your review of order <strong>#{{rentalId}}</strong> helps other renters make confident choices.</p>
       ${button('Leave a Review', '#')}`,
    ),
  },
  {
    key: 'membership-upgrade',
    name: 'Membership Upgrade',
    category: 'offer',
    subject: '{{firstName}}, unlock VIP perks with RentEase Premium',
    description: 'Upsell the membership plan to loyal customers.',
    variables: ['firstName', 'ltv'],
    htmlBody: shell(
      'Go Premium, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, with a lifetime value of <strong>₹{{ltv}}</strong> you're one of our most valued customers. Upgrade to <strong>RentEase Premium</strong> for free delivery, priority support and member-only discounts.</p>
       ${button('Upgrade Now', '#')}`,
    ),
  },
  {
    key: 'seasonal-offer',
    name: 'Seasonal Offer',
    category: 'offer',
    subject: '🌟 Seasonal savings inside, {{firstName}}!',
    description: 'Seasonal discount campaign.',
    variables: ['firstName', 'offerCode', 'expiryDate'],
    htmlBody: shell(
      'Seasonal savings, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, the season is here and so are our biggest deals! Use code <strong>{{offerCode}}</strong> to save on top products.</p>
       <p style="font-size:14px;color:#64748b;">Offer valid until {{expiryDate}}.</p>
       ${button('Shop the Sale', '#')}`,
    ),
  },
  {
    key: 'festival-offer',
    name: 'Festival Offer',
    category: 'offer',
    subject: '🪔 Festival bonanza: upto 30% off, {{firstName}}!',
    description: 'Festival-specific promotional email.',
    variables: ['firstName', 'offerCode'],
    htmlBody: shell(
      'Festival greetings, {{firstName}}!',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Wishing you a joyful festival, {{firstName}}! Celebrate with <strong>upto 30% off</strong> on rentals using code <strong>{{offerCode}}</strong>.</p>
       ${button('Celebrate with Offers', '#')}`,
    ),
  },
  {
    key: 'payment-reminder',
    name: 'Payment Reminder',
    category: 'reminder',
    subject: 'Friendly reminder: payment due, {{firstName}}',
    description: 'Remind about an upcoming/overdue payment.',
    variables: ['firstName', 'amount', 'dueDate'],
    htmlBody: shell(
      'Payment reminder, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, this is a gentle reminder that a payment of <strong>₹{{amount}}</strong> is due on <strong>{{dueDate}}</strong>.</p>
       <p style="font-size:14px;color:#64748b;">Please clear it to avoid any service interruption.</p>
       ${button('Pay Now', '#')}`,
    ),
  },
  {
    key: 'rental-renewal',
    name: 'Rental Renewal',
    category: 'reminder',
    subject: 'Your rental is up for renewal, {{firstName}}',
    description: 'Notify about an upcoming rental renewal.',
    variables: ['firstName', 'productName', 'expiryDate'],
    htmlBody: shell(
      'Time to renew, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, your rental of <strong>{{productName}}</strong> ends on <strong>{{expiryDate}}</strong>. Renew now to keep it without a gap.</p>
       ${button('Renew Rental', '#')}`,
    ),
  },
  {
    key: 'rental-return-reminder',
    name: 'Rental Return Reminder',
    category: 'reminder',
    subject: 'Kindly return your rental, {{firstName}}',
    description: 'Remind about an upcoming return deadline.',
    variables: ['firstName', 'productName', 'dueDate'],
    htmlBody: shell(
      'Return reminder, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, please return <strong>{{productName}}</strong> by <strong>{{dueDate}}</strong> to avoid late fees.</p>
       ${button('Schedule Pickup', '#')}`,
    ),
  },
  {
    key: 'referral-invitation',
    name: 'Referral Invitation',
    category: 'marketing',
    subject: 'Invite friends, earn rewards — {{firstName}}',
    description: 'Encourage referrals.',
    variables: ['firstName', 'offerCode'],
    htmlBody: shell(
      'Refer a friend, {{firstName}}',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, love RentEase? Share it! Invite friends with your code <strong>{{offerCode}}</strong> and you both get rewards.</p>
       ${button('Invite Friends', '#')}`,
    ),
  },
  {
    key: 'birthday-greeting',
    name: 'Birthday Greeting',
    category: 'automation',
    subject: '🎂 Happy Birthday, {{firstName}}! A gift inside',
    description: 'Birthday wish with a coupon.',
    variables: ['firstName', 'offerCode'],
    htmlBody: shell(
      'Happy Birthday, {{firstName}}! 🎂',
      `<p style="font-size:15px;line-height:1.6;color:#334155;">Hi {{firstName}}, wishing you a fantastic birthday! As a small gift, enjoy <strong>15% off</strong> your next rental with code <strong>{{offerCode}}</strong>.</p>
       ${button('Claim Birthday Gift', '#')}`,
    ),
  },
]

/** Substitute {{token}} occurrences with provided values (HTML-escaped). */
export function applyTemplateVariables(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const val = vars[key]
    if (val === undefined || val === null) return ''
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  })
}

/** Render a template to a full HTML string given variable values. */
export function renderEmailPreview(
  template: Pick<EmailTemplateDef, 'htmlBody' | 'subject'>,
  vars: Record<string, string | number>,
): { html: string; subject: string } {
  return {
    html: applyTemplateVariables(template.htmlBody, vars),
    subject: applyTemplateVariables(template.subject, vars),
  }
}

export function getTemplateByKey(key: string): EmailTemplateDef | undefined {
  return EMAIL_TEMPLATE_LIBRARY.find((t) => t.key === key)
}
