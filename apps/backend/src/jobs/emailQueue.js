import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import nodemailer from 'nodemailer';

// Email queue
const emailQueue = new Queue('email-queue', {
  connection: getRedisClient().options
});

// Email worker
const emailWorker = new Worker('email-queue', async (job) => {
  const { type, to, subject, data, template } = job.data;
  
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Generate email content based on template
    let htmlContent = '';
    
    switch (template) {
      case 'welcome':
        htmlContent = generateWelcomeEmail(data);
        break;
      case 'order-confirmation':
        htmlContent = generateOrderConfirmationEmail(data);
        break;
      case 'password-reset':
        htmlContent = generatePasswordResetEmail(data);
        break;
      case 'vendor-approved':
        htmlContent = generateVendorApprovedEmail(data);
        break;
      case 'vendor-rejected':
        htmlContent = generateVendorRejectedEmail(data);
        break;
      default:
        htmlContent = generateDefaultEmail(data);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}, {
  connection: getRedisClient().options,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 60000 // 1 minute
  }
});

// Email templates
const generateWelcomeEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Ecommerce Platform</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Ecommerce Platform</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>Thank you for joining our ecommerce platform! We're excited to have you on board.</p>
          <p>Get started by exploring our amazing products and features.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
          </p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateOrderConfirmationEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.customerName},</h2>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
          
          <h4>Items:</h4>
          ${data.items.map(item => `
            <div class="order-item">
              <p>${item.name} - Quantity: ${item.quantity} - Price: $${item.price}</p>
            </div>
          `).join('')}
          
          <div class="total">
            <p>Total: $${data.total}</p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateVendorApprovedEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vendor Account Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vendor Account Approved!</h1>
        </div>
        <div class="content">
          <h2>Congratulations ${data.name}!</h2>
          <p>Your vendor account has been approved. You can now start selling on our platform.</p>
          <p>Access your vendor dashboard to manage your products and view orders.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Go to Vendor Dashboard</a>
          </p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateVendorRejectedEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vendor Account Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vendor Account Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>We regret to inform you that your vendor account application has been rejected.</p>
          <p>Reason: ${data.reason || 'Your application did not meet our requirements.'}</p>
          <p>You can reapply after addressing the issues mentioned above.</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateDefaultEmail = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.subject || 'Notification'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.subject || 'Notification'}</h1>
        </div>
        <div class="content">
          <p>${data.message || 'This is a notification from our ecommerce platform.'}</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Queue event handlers
emailQueue.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err);
});

// Export queue and helper functions
export { emailQueue };

export const sendEmail = async (type, to, subject, data, template = 'default') => {
  try {
    await emailQueue.add('send-email', {
      type,
      to,
      subject,
      data,
      template
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    });
    
    console.log(`Email job queued for ${to}`);
  } catch (error) {
    console.error('Failed to queue email job:', error);
    throw error;
  }
};
