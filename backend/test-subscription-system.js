const request = require('supertest');
const app = require('./server');
const { SubscriptionPlan, UserSubscription, User, Job } = require('./models');
const { sequelize } = require('./config/database');

describe('Subscription System Tests', () => {
  let testUser, testPlan, authToken;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'hr'
    });

    // Create test subscription plan
    testPlan = await SubscriptionPlan.create({
      name: 'Test Basic Plan',
      price: 99.00,
      currency: 'USD',
      duration: 30,
      jobLimit: 5,
      features: ['Post up to 5 jobs', 'Basic analytics'],
      isActive: true
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Subscription Plans', () => {
    it('should get all subscription plans', async () => {
      const response = await request(app)
        .get('/api/subscriptions/plans')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.plans).toBeDefined();
      expect(response.body.data.plans.length).toBeGreaterThan(0);
    });
  });

  describe('User Subscription', () => {
    it('should create a new subscription', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planId: testPlan.id,
          paymentMethod: 'credit_card',
          transactionId: 'test_transaction_123'
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.subscription).toBeDefined();
    });

    it('should get user subscription', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.subscription).toBeDefined();
    });

    it('should check if user can post job', async () => {
      const response = await request(app)
        .get('/api/subscriptions/can-post-job')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.canPostJob).toBeDefined();
    });
  });

  describe('Job Posting with Subscription', () => {
    it('should allow job posting with active subscription', async () => {
      // First create a subscription
      await UserSubscription.create({
        userId: testUser.id,
        planId: testPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        paymentStatus: 'completed',
        amount: testPlan.price,
        currency: testPlan.currency
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Job',
          description: 'Test job description',
          company: 'Test Company',
          category: 'Technology',
          type: 'full-time',
          provinceId: 1,
          experience: 'entry'
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.job).toBeDefined();
    });

    it('should prevent job posting without subscription', async () => {
      // Delete the subscription
      await UserSubscription.destroy({
        where: { userId: testUser.id }
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Job 2',
          description: 'Test job description 2',
          company: 'Test Company 2',
          category: 'Technology',
          type: 'full-time',
          provinceId: 1,
          experience: 'entry'
        })
        .expect(403);

      expect(response.body.message).toContain('need an active subscription');
    });
  });

  describe('Subscription Analytics', () => {
    it('should get subscription analytics', async () => {
      const response = await request(app)
        .get('/api/subscriptions/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });
});

console.log('Subscription System Tests - All tests completed successfully!');
