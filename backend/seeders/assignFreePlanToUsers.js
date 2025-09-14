const { User, UserSubscription, SubscriptionPlan } = require('../models');

async function assignFreePlanToUsers() {
  try {
    console.log('🌱 Assigning free plan to users without subscriptions...');
    
    // Find the free plan
    const freePlan = await SubscriptionPlan.findOne({ 
      where: { name: 'Free Plan' } 
    });
    
    if (!freePlan) {
      console.log('❌ Free plan not found. Please run subscription plan seeder first.');
      return;
    }
    
    // Find all users without active subscriptions
    const usersWithoutSubscriptions = await User.findAll({
      include: [
        {
          model: UserSubscription,
          as: 'subscriptions',
          where: {
            status: 'active',
            endDate: {
              [require('sequelize').Op.gt]: new Date()
            }
          },
          required: false
        }
      ],
      where: {
        '$subscriptions.id$': null
      }
    });
    
    console.log(`Found ${usersWithoutSubscriptions.length} users without active subscriptions`);
    
    // Assign free plan to each user
    for (const user of usersWithoutSubscriptions) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
      
      await UserSubscription.create({
        userId: user.id,
        planId: freePlan.id,
        startDate,
        endDate,
        status: 'active',
        jobsPosted: 0,
        amount: freePlan.price,
        currency: freePlan.currency,
        paymentStatus: 'completed' // Free plan is automatically completed
      });
      
      console.log(`✅ Assigned free plan to user: ${user.email}`);
    }
    
    console.log('🎉 Free plan assignment completed!');
  } catch (error) {
    console.error('❌ Error assigning free plan to users:', error);
    throw error;
  }
}

module.exports = assignFreePlanToUsers;
