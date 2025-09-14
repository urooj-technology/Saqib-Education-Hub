const { SubscriptionPlan } = require('../models');

const subscriptionPlans = [
  {
    name: 'Free Plan',
    price: 0.00,
    currency: 'USD',
    duration: 365, // 365 days (1 year)
    jobLimit: 3,
    features: [
      'Post up to 3 jobs',
      'Basic job listing',
      '7-day job visibility',
      'Community support'
    ],
    isActive: true,
    description: 'Perfect for testing and small projects. Limited features but completely free.'
  },
  {
    name: 'Basic Plan',
    price: 99.00,
    currency: 'USD',
    duration: 30, // 30 days
    jobLimit: 5,
    features: [
      'Post up to 5 jobs',
      'Basic job analytics',
      'Email support',
      'Standard job listing',
      '30-day job visibility'
    ],
    isActive: true,
    description: 'Perfect for small businesses and startups looking to hire a few positions.'
  },
  {
    name: 'Professional Plan',
    price: 199.00,
    currency: 'USD',
    duration: 30, // 30 days
    jobLimit: 20,
    features: [
      'Post up to 20 jobs',
      'Advanced analytics dashboard',
      'Priority email support',
      'Featured job listings',
      'Enhanced job visibility',
      'Candidate management tools',
      '60-day job visibility'
    ],
    isActive: true,
    description: 'Ideal for growing companies with regular hiring needs.'
  },
  {
    name: 'Enterprise Plan',
    price: 399.00,
    currency: 'USD',
    duration: 30, // 30 days
    jobLimit: 0, // 0 means unlimited
    features: [
      'Unlimited job postings',
      'Full analytics suite',
      'Dedicated account manager',
      'Premium featured listings',
      'API access',
      'Custom branding',
      '90-day job visibility',
      'Advanced candidate screening',
      'Bulk operations',
      'White-label options'
    ],
    isActive: true,
    description: 'For large organizations with extensive hiring requirements.'
  }
];

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Seeding subscription plans...');
    
        for (const plan of subscriptionPlans) {
      const existingPlan = await SubscriptionPlan.findOne({ where: { name: plan.name } });

      if (!existingPlan) {
        await SubscriptionPlan.create(plan);
        console.log(`✅ Created ${plan.name}`);
      } else {
        console.log(`⏭️  ${plan.name} already exists, skipping...`);
      }
    }
    
    console.log('🎉 Subscription plans seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    throw error;
  }
}

module.exports = seedSubscriptionPlans;
