const express = require('express');
const router = express.Router();
const {
  getSubscriptionPlans,
  getUserSubscription,
  createSubscription,
  canPostJob,
  getSubscriptionAnalytics
} = require('../controllers/subscriptionController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(protect);

// GET /api/subscriptions/my-subscription - Get user's current subscription
router.get('/my-subscription', getUserSubscription);

// POST /api/subscriptions - Create a new subscription
router.post('/', createSubscription);

// PUT /api/subscriptions/upgrade - Upgrade existing subscription
router.put('/upgrade', async (req, res) => {
  try {
    const { SubscriptionPlan, UserSubscription } = require('../models');
    const { Op } = require('sequelize');
    const { planId, paymentMethod, transactionId } = req.body;
    const userId = req.user.id;

    // Validate plan exists
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or inactive subscription plan'
      });
    }

    // Find current active subscription
    const currentSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!currentSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'No active subscription found to upgrade'
      });
    }

    // If upgrading to the same plan, just extend the duration
    if (currentSubscription.planId === planId) {
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + plan.duration);
      
      await currentSubscription.update({
        endDate: newEndDate,
        amount: plan.price,
        paymentMethod: paymentMethod || 'manual',
        transactionId: transactionId || `txn_${Date.now()}`
      });

      return res.status(200).json({
        status: 'success',
        data: {
          subscription: currentSubscription,
          message: 'Subscription extended successfully'
        }
      });
    }

    // Cancel current subscription
    await currentSubscription.update({ status: 'cancelled' });

    // Create new subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const newSubscription = await UserSubscription.create({
      userId,
      planId,
      startDate: new Date(),
      endDate,
      status: 'active',
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'manual',
      transactionId: transactionId || `txn_${Date.now()}`,
      amount: plan.price,
      currency: plan.currency,
      jobsPosted: 0 // Reset job count for new plan
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscription: newSubscription,
        message: 'Subscription upgraded successfully'
      }
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upgrade subscription'
    });
  }
});

// GET /api/subscriptions/can-post-job - Check if user can post a job
router.get('/can-post-job', canPostJob);

// GET /api/subscriptions/analytics - Get subscription analytics
router.get('/analytics', getSubscriptionAnalytics);

// Admin routes for managing subscription plans
router.use(authorize('admin'));

// GET /api/subscriptions/admin/plans - Get all plans (including inactive)
router.get('/admin/plans', async (req, res) => {
  try {
    const { SubscriptionPlan } = require('../models');
    const plans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { plans }
    });
  } catch (error) {
    console.error('Error fetching all subscription plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription plans'
    });
  }
});

// POST /api/subscriptions/admin/plans - Create new subscription plan
router.post('/admin/plans', async (req, res) => {
  try {
    const { SubscriptionPlan } = require('../models');
    const { name, price, currency, duration, jobLimit, features, description, isActive } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      price,
      currency,
      duration,
      jobLimit,
      features: features || [],
      description,
      isActive: isActive !== false
    });

    res.status(201).json({
      status: 'success',
      data: { plan },
      message: 'Subscription plan created successfully'
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subscription plan'
    });
  }
});

// PUT /api/subscriptions/admin/plans/:id - Update subscription plan
router.put('/admin/plans/:id', async (req, res) => {
  try {
    const { SubscriptionPlan } = require('../models');
    const { id } = req.params;
    const updateData = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    await plan.update(updateData);

    res.status(200).json({
      status: 'success',
      data: { plan },
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update subscription plan'
    });
  }
});

// DELETE /api/subscriptions/admin/plans/:id - Delete subscription plan
router.delete('/admin/plans/:id', async (req, res) => {
  try {
    const { SubscriptionPlan } = require('../models');
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    await plan.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete subscription plan'
    });
  }
});

module.exports = router;
