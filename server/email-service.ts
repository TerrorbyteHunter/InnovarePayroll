import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  // First, try standard environment variables (for production/non-Replit environments)
  const standardApiKey = process.env.RESEND_API_KEY;
  const standardFromEmail = process.env.RESEND_FROM_EMAIL;
  
  if (standardApiKey && standardFromEmail) {
    return { apiKey: standardApiKey, fromEmail: standardFromEmail };
  }

  // Fall back to Replit Connector for Replit environments
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Resend not configured: Set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not configured: Either use Replit Connector or set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}

export async function sendPayslipEmail(
  recipientEmail: string,
  employeeName: string,
  period: string,
  payslipDetails: {
    employeeNumber: string;
    grossPay: string;
    totalDeductions: string;
    netPay: string;
  }
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .detail-row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .detail-label { font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Innovare Payroll</h1>
            <p>Payslip for ${period}</p>
          </div>
          <div class="content">
            <h2>Dear ${employeeName},</h2>
            <p>Your payslip for ${period} is ready. Please find the details below:</p>
            
            <div class="detail-row">
              <span class="detail-label">Employee Number:</span>
              <span>${payslipDetails.employeeNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Gross Pay:</span>
              <span>ZMW ${parseFloat(payslipDetails.grossPay).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Deductions:</span>
              <span>ZMW ${parseFloat(payslipDetails.totalDeductions).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold; margin-top: 10px;">
              <span class="detail-label">Net Pay:</span>
              <span>ZMW ${parseFloat(payslipDetails.netPay).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Please log in to the payroll system to view your complete payslip with detailed breakdowns.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Innovare Payroll. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `Payslip for ${period} - Innovare Payroll`,
      html: htmlContent,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
