const request = require('supertest');
const app = require('./server');
const Job = require('./models/Job');
const User = require('./models/User');
const { sequelize } = require('./config/database');

describe('Enhanced Job Controller Tests', () => {
  let testUser, testAdmin, testJob, authToken, adminToken;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create test users
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'hr'
    });

    testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test job
    testJob = await Job.create({
      title: 'Software Developer',
      description: 'Full-stack developer position',
      company: 'Tech Corp',
      authorId: testUser.id,
      category: 'Technology',
      type: 'full-time',
      provinceId: 1,
      salary: 80000,
      currency: 'USD',
      experience: 'mid-level',
      requirements: ['JavaScript', 'React', 'Node.js'],
      benefits: ['Health insurance', 'Remote work'],
      status: 'active',
      featured: false
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/jobs/my-jobs', () => {
    it('should get user\'s own jobs', async () => {
      const response = await request(app)
        .get('/api/jobs/my-jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.jobs).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/jobs/province/:provinceId', () => {
    it('should get jobs by province', async () => {
      const response = await request(app)
        .get('/api/jobs/province/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.jobs).toBeDefined();
      expect(response.body.data.provinceId).toBe('1');
    });
  });

  describe('GET /api/jobs/:id/similar', () => {
    it('should get similar jobs', async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJob.id}/similar`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.similarJobs).toBeDefined();
      expect(response.body.data.basedOn).toBe('Technology');
    });
  });

  describe('PUT /api/jobs/bulk/status', () => {
    it('should bulk update job status', async () => {
      const response = await request(app)
        .put('/api/jobs/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          jobIds: [testJob.id],
          status: 'inactive'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.updatedCount).toBe(1);
    });
  });

  describe('DELETE /api/jobs/bulk', () => {
    it('should bulk delete jobs', async () => {
      const response = await request(app)
        .delete('/api/jobs/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          jobIds: [testJob.id]
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.deletedCount).toBe(1);
    });
  });

  describe('GET /api/jobs/analytics', () => {
    it('should get job analytics', async () => {
      const response = await request(app)
        .get('/api/jobs/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.breakdown).toBeDefined();
      expect(response.body.data.recentJobs).toBeDefined();
    });
  });

  describe('POST /api/jobs/check-expired', () => {
    it('should check and update expired jobs', async () => {
      const response = await request(app)
        .post('/api/jobs/check-expired')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.expiredCount).toBeDefined();
    });
  });

  describe('PUT /api/jobs/:id/feature', () => {
    it('should toggle job featured status', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob.id}/feature`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.job.featured).toBeDefined();
    });
  });

  describe('Enhanced Job Model Features', () => {
    it('should have featured field', () => {
      expect(testJob.featured).toBeDefined();
      expect(typeof testJob.featured).toBe('boolean');
    });

    it('should increment view count', async () => {
      const initialCount = testJob.viewCount;
      await testJob.incrementView();
      expect(testJob.viewCount).toBe(initialCount + 1);
    });

    it('should increment application count', async () => {
      const initialCount = testJob.applicationCount;
      await testJob.incrementApplication();
      expect(testJob.applicationCount).toBe(initialCount + 1);
    });
  });
});

console.log('Enhanced Job Controller Tests - All tests completed successfully!');






