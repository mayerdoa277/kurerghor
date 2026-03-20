import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Helps with some SMTP servers
    },
  });
};

// Retry mechanism for failed emails
const sendWithRetry = async (transporter, mailOptions, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully on attempt ${attempt}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      lastError = error;
      console.warn(`Email attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All email attempts failed:', lastError);
  return { success: false, error: lastError };
};

// Main email sending function
export const sendEmail = async (to, subject, html, text = null) => {
  try {
    console.log('📧 Starting email send process...');
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    
    const transporter = createTransporter();
    console.log('📧 Transporter created');
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Ecommerce Platform'}" <${process.env.EMAIL_FROM}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
    };
    
    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await sendWithRetry(transporter, mailOptions);
    
    // Close transporter connection
    transporter.close();
    
    console.log('📧 Email send result:', result);
    return result;
  } catch (error) {
    console.error('💥 Email service error:', error);
    return { success: false, error };
  }
};

// Email templates
export const emailTemplates = {
  verification: (name, verificationLink) => {
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const fullLink = `${clientUrl}/verify-email?token=${verificationLink}`;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <a href="${fullLink}" class="button">Verify Email</a>
          <p>This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Ecommerce Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  },
  
  passwordReset: (name, resetLink) => {
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const fullLink = `${clientUrl}/reset-password?token=${resetLink}`;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${fullLink}" class="button">Reset Password</a>
          <div class="warning">
            <strong>Security Notice:</strong> This link expires in 15 minutes. If you didn't request this reset, please ignore this email.
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4f46e5;">${fullLink}</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Ecommerce Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  },
  
  orderConfirmation: (orderData) => {
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .order-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${orderData.customerName},</p>
          <p>Thank you for your order! We've received your order and will notify you once it ships.</p>
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
          </div>
          <a href="${clientUrl}/orders/${orderData.orderId}" class="button">View Order Details</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 Ecommerce Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  },
  
  shippingUpdate: (shippingData) => {
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shipping Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .tracking-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shipping Update</h1>
        </div>
        <div class="content">
          <p>Hi ${shippingData.customerName},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          <div class="tracking-info">
            <h3>Tracking Information</h3>
            <p><strong>Order ID:</strong> ${shippingData.orderId}</p>
            <p><strong>Tracking Number:</strong> ${shippingData.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${shippingData.carrier}</p>
            <p><strong>Estimated Delivery:</strong> ${shippingData.estimatedDelivery}</p>
          </div>
          <a href="${clientUrl}/track/${shippingData.trackingNumber}" class="button">Track Your Package</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 Ecommerce Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }
};
