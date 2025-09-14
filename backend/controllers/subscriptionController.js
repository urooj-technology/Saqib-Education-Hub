const { SubscriptionPlan, UserSubscription, User, Job } = require('../models');
const { Op } = require('sequelize');

// Get all subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription plans'
    });
  }
};

// Get user's current subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'jobLimit', 'features']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          subscription: null,
          canPostJob: false,
          remainingJobs: 0
        }
      });
    }

    const canPostJob = subscription.canPostJob();
    const remainingJobs = subscription.plan.jobLimit === 0 ? 'Unlimited' : 
                         Math.max(0, subscription.plan.jobLimit - subscription.jobsPosted);

    res.status(200).json({
      status: 'success',
      data: {
        subscription,
        canPostJob,
        remainingJobs
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user subscription'
    });
  }
};

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
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

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has an active subscription'
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Create subscription
    const subscription = await UserSubscription.create({
      userId,
      planId,
      startDate: new Date(),
      endDate,
      status: 'active',
      paymentStatus: 'completed',
      paymentMethod,
      transactionId,
      amount: plan.price,
      currency: plan.currency
    });

    res.status(201).json({
      status: 'success',
      data: {
        subscription,
        message: 'Subscription created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subscription'
    });
  }
};

// Check if user can post a job
exports.canPostJob = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'jobLimit', 'features']
        }
      ]
    });

    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          canPostJob: false,
          reason: 'No active subscription',
          message: 'You need an active subscription to post jobs'
        }
      });
    }

    const canPostJob = subscription.canPostJob();
    const remainingJobs = subscription.plan.jobLimit === 0 ? 'Unlimited' : 
                         Math.max(0, subscription.plan.jobLimit - subscription.jobsPosted);

    res.status(200).json({
      status: 'success',
      data: {
        canPostJob,
        remainingJobs,
        subscription: {
          planName: subscription.plan.name,
          jobsPosted: subscription.jobsPosted,
          jobLimit: subscription.plan.jobLimit
        }
      }
    });
  } catch (error) {
    console.error('Error checking job posting capability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check job posting capability'
    });
  }
};

// Get subscription analytics
exports.getSubscriptionAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'jobLimit', 'features']
        }
      ]
    });

    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasSubscription: false,
          message: 'No active subscription found'
        }
      });
    }

    // Get user's jobs
    const userJobs = await Job.findAll({
      where: { authorId: userId },
      attributes: ['id', 'title', 'status', 'createdAt', 'viewCount', 'applicationCount']
    });

    const analytics = {
      hasSubscription: true,
      planName: subscription.plan.name,
      jobsPosted: subscription.jobsPosted,
      jobLimit: subscription.plan.jobLimit,
      remainingJobs: subscription.plan.jobLimit === 0 ? 'Unlimited' : 
                     Math.max(0, subscription.plan.jobLimit - subscription.jobsPosted),
      subscriptionEndDate: subscription.endDate,
      totalJobs: userJobs.length,
      activeJobs: userJobs.filter(job => job.status === 'active').length,
      totalViews: userJobs.reduce((sum, job) => sum + job.viewCount, 0),
      totalApplications: userJobs.reduce((sum, job) => sum + job.applicationCount, 0)
    };

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription analytics'
    });
  }
};
