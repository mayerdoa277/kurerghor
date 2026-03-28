import express from 'express';
import {
  requestVendorAccess,
  getVendorRequestStatus
} from '../controllers/vendorRequestController.js';
import {
  requireAuth,
  requireUser
} from '../middlewares/roleMiddleware.js';
import {
  validate,
  vendorRequestSchema
} from '../utils/validation.js';

const router = express.Router();

// User routes
router.post('/request-vendor', 
  requireAuth, 
  requireUser, 
  validate(vendorRequestSchema), 
  requestVendorAccess
);

router.get('/vendor-request-status', 
  requireAuth, 
  getVendorRequestStatus
);

export default router;
