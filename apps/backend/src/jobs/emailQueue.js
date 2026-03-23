import { Queue, Worker } from 'bullmq';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { getRedisClient } from '../config/redis.js';

let emailQueue = null;
let emailWorker = null;

// Initialize email queue after Redis is connected
export const initializeEmailQueue = async () => {
  try {
    // Get the Redis URL that works for main connection
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('⚠️ REDIS_URL not found, email queue will not work');
      return;
    }
    
    console.log('🔧 Initializing email queue with Redis URL:', redisUrl);
    console.log('🔧 Redis URL format:', redisUrl.startsWith('redis://') ? 'VALID' : 'INVALID');
    
    // Parse Redis URL to get connection details for BullMQ
    let connectionConfig;
    
    if (redisUrl.startsWith('redis://')) {
      // Parse redis://username:password@host:port format
      const url = new URL(redisUrl);
      connectionConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        username: url.username || undefined,
        password: url.password || undefined
      };
      console.log('🔧 Parsed Redis config:', {
        host: connectionConfig.host,
        port: connectionConfig.port,
        hasAuth: !!(connectionConfig.username && connectionConfig.password)
      });
    } else {
      connectionConfig = redisUrl;
    }
    
    // Create email queue with Redis connection
    emailQueue = new Queue('email queue', {
      connection: connectionConfig
    });
    
    console.log('✅ Email queue created successfully');
    
    // Create worker to process email jobs
    emailWorker = new Worker('email queue', async (job) => {
      const { type, to, data } = job.data;
      
      try {
        let emailHtml, subject;
        
        switch (type) {
          case 'verification':
            subject = 'Verify Your Email Address';
            emailHtml = emailTemplates.verification(data.name, data.verificationLink);
            break;
            
          case 'password_reset':
            subject = 'Reset Your Password';
            emailHtml = emailTemplates.passwordReset(data.name, data.resetLink);
            break;
            
          case 'order_confirmation':
            subject = 'Order Confirmation';
            emailHtml = emailTemplates.orderConfirmation(data);
            break;
            
          case 'shipping_update':
            subject = 'Shipping Update';
            emailHtml = emailTemplates.shippingUpdate(data);
            break;
            
          default:
            throw new Error(`Unknown email type: ${type}`);
        }
        
        const result = await sendEmail(to, subject, emailHtml);
        
        if (!result.success) {
          throw new Error(`Failed to send email: ${result.error.message}`);
        }
        
        console.log(`✅ Email sent successfully: ${type} to ${to}`);
        return result;
        
      } catch (error) {
        console.error(`❌ Failed to send email: ${type}`, error);
        throw error;
      }
    }, {
      connection: connectionConfig
    });
    
    // Handle failed jobs
    emailWorker.on('failed', (job, err) => {
      console.error(`❌ Email job failed:`, {
        id: job.id,
        type: job.data.type,
        to: job.data.to,
        error: err.message
      });
    });
    
    // Handle completed jobs
    emailWorker.on('completed', (job, result) => {
      console.log(`✅ Email job completed:`, {
        id: job.id,
        type: job.data.type,
        to: job.data.to
      });
    });
    
    console.log('✅ Email worker initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize email queue:', error);
  }
};

// Helper functions to add emails to queue
export const addVerificationEmail = (to, name, verificationLink) => {
  return emailQueue.add('verification', {
    type: 'verification',
    to,
    data: { name, verificationLink }
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

export const addPasswordResetEmail = (to, name, resetLink) => {
  return emailQueue.add('password_reset', {
    type: 'password_reset',
    to,
    data: { name, resetLink }
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

export const addOrderConfirmationEmail = (to, orderData) => {
  return emailQueue.add('order_confirmation', {
    type: 'order_confirmation',
    to,
    data: orderData
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

export const addShippingUpdateEmail = (to, shippingData) => {
  return emailQueue.add('shipping_update', {
    type: 'shipping_update',
    to,
    data: shippingData
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

export default emailQueue;
