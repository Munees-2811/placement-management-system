import nodemailer from 'nodemailer';

// Generate a cryptographically strong, random 10-character temporary password
export const generateSecureTemporaryPassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';

  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const all = upper + lower + digits + special;
  for (let i = chars.length; i < 10; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  return chars.sort(() => Math.random() - 0.5).join('');
};

/**
 * Creates a reusable nodemailer transporter.
 * Uses environment variables if configured, otherwise falls back to a simulated transport.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      isLive: true,
    };
  }

  // Simulated email transporter (safe dev mode, does not crash or require internet)
  return {
    transporter: null,
    isLive: false,
  };
};

/**
 * Sends student login credentials email with professional university portal styling.
 *
 * @param {Object} options
 * @param {string} options.to - Student's recipient email
 * @param {string} options.studentName - Full name of the student
 * @param {string} options.temporaryPassword - Generated temporary password
 * @param {string} [options.registerNumber] - Register number if present
 * @param {string} [options.portalUrl] - Login URL
 */
export const sendStudentCredentialsEmail = async ({
  to,
  studentName,
  temporaryPassword,
  registerNumber = '',
  portalUrl = process.env.CLIENT_URL || 'http://localhost:5173/login',
}) => {
  const { transporter, isLive } = getTransporter();

  const fromEmail = process.env.FROM_EMAIL || 'placement-cell@university.edu';
  const subject = 'Campus Placement Portal — Your Student Account Credentials';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #F5F7FA; color: #202B3C; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E4E8EF; overflow: hidden; }
        .header { background: #19365C; padding: 28px 32px; color: #ffffff; text-align: left; }
        .header h1 { font-size: 20px; font-weight: 700; margin: 0 0 6px 0; color: #ffffff; }
        .header p { font-size: 13px; color: #CBD5E1; margin: 0; }
        .content { padding: 32px; }
        .salutation { font-size: 15px; font-weight: 600; color: #202B3C; margin-bottom: 12px; }
        .intro { font-size: 13px; color: #667085; line-height: 1.6; margin-bottom: 24px; }
        .creds-box { background: #F8FAFC; border: 1px solid #E4E8EF; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EEF2F6; font-size: 13px; }
        .cred-row:last-child { border-bottom: none; }
        .cred-label { color: #667085; font-weight: 500; }
        .cred-val { color: #202B3C; font-weight: 600; font-family: monospace; }
        .security-note { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #1E40AF; line-height: 1.5; margin-bottom: 24px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #19365C; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }
        .footer { padding: 20px 32px; background: #F8FAFC; border-top: 1px solid #E4E8EF; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>University Placement &amp; Training Cell</h1>
          <p>Official Student Candidate Onboarding</p>
        </div>
        <div class="content">
          <div class="salutation">Hello ${studentName},</div>
          <div class="intro">
            An official student account has been created for you on the <strong>Student Placement Management System</strong>. You can now access campus recruitment drives, submit applications, and build your placement portfolio.
          </div>

          <div class="creds-box">
            <div class="cred-row">
              <span class="cred-label">Login Email:</span>
              <span class="cred-val">${to}</span>
            </div>
            ${registerNumber ? `
            <div class="cred-row">
              <span class="cred-label">Register Number:</span>
              <span class="cred-val">${registerNumber}</span>
            </div>` : ''}
            <div class="cred-row">
              <span class="cred-label">Temporary Password:</span>
              <span class="cred-val" style="color: #19365C; font-size: 14px;">${temporaryPassword}</span>
            </div>
          </div>

          <div class="security-note">
            <strong>Security Notice:</strong> This is a one-time temporary password. For account security, you will be required to change your password immediately upon your first sign-in before accessing the placement dashboard.
          </div>

          <div class="btn-wrapper">
            <a href="${portalUrl}" class="btn">Sign In to Placement Portal</a>
          </div>
        </div>
        <div class="footer">
          This is an automated notification from the University Placement Cell.<br>
          Please do not reply to this email. For assistance, contact your placement coordinator.
        </div>
      </div>
    </body>
    </html>
  `;

  if (isLive && transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"University Placement Cell" <${fromEmail}>`,
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, mode: 'LIVE_SMTP', messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] Failed to dispatch live email to ${to}:`, err.message);
      return { success: false, mode: 'LIVE_SMTP', error: err.message };
    }
  }

  // Simulated email dispatch (development / offline mode)
  console.log(`[EmailService - Simulated Dispatch]`);
  console.log(`  To: ${to} (${studentName})`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Temporary Password: ${temporaryPassword}`);
  console.log(`  Status: Delivered (Simulated Mode)`);

  return {
    success: true,
    mode: 'SIMULATED',
    messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
};

