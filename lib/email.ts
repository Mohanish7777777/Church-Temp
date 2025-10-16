import nodemailer from "nodemailer"

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP configuration is incomplete. Email functionality will be disabled.")
      return null
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const emailTransporter = getTransporter()
    
    if (!emailTransporter) {
      console.warn("Email transporter not configured. Skipping email send.")
      return false
    }

    const info = await emailTransporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Holy Cross Church"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      html,
    })

    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Welcome email template for new families
export async function sendWelcomeEmail(familyData: {
  email: string
  headName: string
  cardNo: string
  unitName: string
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✝ Welcome to Holy Cross Church</h1>
        </div>
        <div class="content">
          <h2>Dear ${familyData.headName},</h2>
          <p>We are delighted to welcome your family to our church community!</p>
          
          <div class="info-box">
            <h3>Your Family Details:</h3>
            <p><strong>Family Card No:</strong> ${familyData.cardNo}</p>
            <p><strong>Head of Family:</strong> ${familyData.headName}</p>
            <p><strong>Unit:</strong> ${familyData.unitName}</p>
          </div>
          
          <p>Your family has been successfully registered in our church management system. You will receive notifications for important updates and payment confirmations.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact the church office.</p>
          
          <p>May God bless you and your family!</p>
          
          <p><strong>In Christ,</strong><br>Holy Cross Church Administration</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Holy Cross Church Management System</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: familyData.email,
    subject: "Welcome to Holy Cross Church - Family Registration Confirmed",
    html,
  })
}

// Payment confirmation email template
export async function sendPaymentConfirmationEmail(paymentData: {
  email: string
  headName: string
  cardNo: string
  month: string
  amountPaid: number
  paymentDate: string
  remarks?: string
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .payment-box { background-color: white; padding: 20px; margin: 20px 0; border: 2px solid #059669; border-radius: 8px; }
        .amount { font-size: 24px; color: #059669; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Received</h1>
        </div>
        <div class="content">
          <h2>Dear ${paymentData.headName},</h2>
          <p>Thank you for your contribution to Holy Cross Church. We have received your payment.</p>
          
          <div class="payment-box">
            <h3>Payment Details:</h3>
            <p><strong>Family Card No:</strong> ${paymentData.cardNo}</p>
            <p><strong>Month:</strong> ${paymentData.month}</p>
            <p><strong>Amount Paid:</strong> <span class="amount">₹${paymentData.amountPaid}</span></p>
            <p><strong>Payment Date:</strong> ${new Date(paymentData.paymentDate).toLocaleDateString()}</p>
            ${paymentData.remarks ? `<p><strong>Remarks:</strong> ${paymentData.remarks}</p>` : ""}
          </div>
          
          <p>Your contribution helps us continue our mission and serve the community. May God bless you abundantly for your generosity.</p>
          
          <p><strong>In Christ,</strong><br>Holy Cross Church Administration</p>
        </div>
        <div class="footer">
          <p>This is an automated receipt from Holy Cross Church Management System</p>
          <p>Please keep this email for your records</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: paymentData.email,
    subject: `Payment Confirmation - ${paymentData.month} - Holy Cross Church`,
    html,
  })
}

// OTP email template for admin login
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; text-align: center; }
        .otp-box { background-color: white; padding: 30px; margin: 20px 0; border: 3px dashed #dc2626; border-radius: 8px; }
        .otp { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; }
        .warning { color: #dc2626; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Admin Login Verification</h1>
        </div>
        <div class="content">
          <h2>Your One-Time Password (OTP)</h2>
          <p>Use this OTP to complete your admin login:</p>
          
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          
          <p class="warning">⚠️ This OTP is valid for 10 minutes only</p>
          <p>If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
        </div>
        <div class="footer">
          <p>This is an automated security message from Holy Cross Church Management System</p>
          <p>Never share your OTP with anyone</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Admin Login OTP - Holy Cross Church",
    html,
  })
}
