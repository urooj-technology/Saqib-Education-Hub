const { 
  Article, 
  Book, 
  Video, 
  Job, 
  Scholarship, 
  User, 
  Company, 
  Contact 
} = require('../models');
const { Op, col, fn, literal } = require('sequelize');
const sequelize = require('../config/database');

const reportController = {
  // Get dashboard overview statistics
  getDashboardStats: async (req, res) => {
    try {
      console.log('=== DASHBOARD STATS REQUEST ===');
      console.log('User:', req.user ? req.user.id : 'No user');
      console.log('Fetching dashboard stats...');
      // Get current date and date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Get total counts with error handling
      const [
        totalUsers,
        totalArticles,
        totalBooks,
        totalVideos,
        totalJobs,
        totalScholarships,
        totalCompanies,
        totalContacts
      ] = await Promise.all([
        User.count().catch(() => 0),
        Article.count().catch(() => 0),
        Book.count().catch(() => 0),
        Video.count().catch(() => 0),
        Job.count().catch(() => 0),
        Scholarship.count().catch(() => 0),
        Company.count().catch(() => 0),
        Contact.count().catch(() => 0)
      ]);

      // Get monthly growth data with error handling
      const [
        usersThisMonth,
        usersLastMonth,
        articlesThisMonth,
        articlesLastMonth,
        booksThisMonth,
        booksLastMonth,
        videosThisMonth,
        videosLastMonth
      ] = await Promise.all([
        User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }).catch(() => 0),
        User.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }).catch(() => 0),
        Article.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }).catch(() => 0),
        Article.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }).catch(() => 0),
        Book.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }).catch(() => 0),
        Book.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }).catch(() => 0),
        Video.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }).catch(() => 0),
        Video.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }).catch(() => 0)
      ]);

      // Calculate growth percentages
      const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
      };

      // Get recent activity (last 30 days) with error handling
      const recentActivity = await Promise.all([
        User.count({ where: { createdAt: { [Op.gte]: last30Days } } }).catch(() => 0),
        Article.count({ where: { createdAt: { [Op.gte]: last30Days } } }).catch(() => 0),
        Book.count({ where: { createdAt: { [Op.gte]: last30Days } } }).catch(() => 0),
        Video.count({ where: { createdAt: { [Op.gte]: last30Days } } }).catch(() => 0)
      ]);

      // Get status distribution with error handling
      const [articlesByStatus, booksByStatus, jobsByStatus] = await Promise.all([
        Article.findAll({
          attributes: [
            'status',
            [fn('COUNT', col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        }).catch(() => []),
        Book.findAll({
          attributes: [
            'status',
            [fn('COUNT', col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        }).catch(() => []),
        Job.findAll({
          attributes: [
            'status',
            [fn('COUNT', col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        }).catch(() => [])
      ]);

      const responseData = {
        status: 'success',
        data: {
          overview: {
            totalUsers,
            totalArticles,
            totalBooks,
            totalVideos,
            totalJobs,
            totalScholarships,
            totalCompanies,
            totalContacts
          },
          growth: {
            users: {
              current: usersThisMonth,
              previous: usersLastMonth,
              percentage: calculateGrowth(usersThisMonth, usersLastMonth)
            },
            articles: {
              current: articlesThisMonth,
              previous: articlesLastMonth,
              percentage: calculateGrowth(articlesThisMonth, articlesLastMonth)
            },
            books: {
              current: booksThisMonth,
              previous: booksLastMonth,
              percentage: calculateGrowth(booksThisMonth, booksLastMonth)
            },
            videos: {
              current: videosThisMonth,
              previous: videosLastMonth,
              percentage: calculateGrowth(videosThisMonth, videosLastMonth)
            }
          },
          recentActivity: {
            users: recentActivity[0],
            articles: recentActivity[1],
            books: recentActivity[2],
            videos: recentActivity[3]
          },
          statusDistribution: {
            articles: articlesByStatus,
            books: booksByStatus,
            jobs: jobsByStatus
          }
        }
      };

      console.log('=== SENDING RESPONSE ===');
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  },

  // Get monthly data for charts (last 12 months)
  getMonthlyData: async (req, res) => {
    try {
      const { type = 'all' } = req.query;
      const now = new Date();
      const months = [];
      
      // Generate last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        months.push({
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          startDate: date,
          endDate: nextMonth
        });
      }

      // Get data for each month
      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const whereClause = {
            createdAt: {
              [Op.gte]: month.startDate,
              [Op.lt]: month.endDate
            }
          };

          let data = {
            month: month.month,
            year: month.year
          };

          if (type === 'all' || type === 'users') {
            data.users = await User.count({ where: whereClause });
          }
          if (type === 'all' || type === 'articles') {
            data.articles = await Article.count({ where: whereClause });
          }
          if (type === 'all' || type === 'books') {
            data.books = await Book.count({ where: whereClause });
          }
          if (type === 'all' || type === 'videos') {
            data.videos = await Video.count({ where: whereClause });
          }
          if (type === 'all' || type === 'jobs') {
            data.jobs = await Job.count({ where: whereClause });
          }

          return data;
        })
      );

      res.json({
        status: 'success',
        data: monthlyData
      });
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch monthly data',
        error: error.message
      });
    }
  },

  // Get category distribution data
  getCategoryDistribution: async (req, res) => {
    try {
      const { type = 'articles' } = req.query;

      let data = [];

      switch (type) {
        case 'articles':
          data = await Article.findAll({
            attributes: [
              'category',
              [fn('COUNT', col('id')), 'count']
            ],
            group: ['category'],
            order: [[literal('count'), 'DESC']],
            raw: true
          });
          break;
        case 'books':
          data = await Book.findAll({
            attributes: [
              'category',
              [fn('COUNT', col('id')), 'count']
            ],
            group: ['category'],
            order: [[literal('count'), 'DESC']],
            raw: true
          });
          break;
        case 'videos':
          data = await Video.findAll({
            attributes: [
              'category',
              [fn('COUNT', col('id')), 'count']
            ],
            group: ['category'],
            order: [[literal('count'), 'DESC']],
            raw: true
          });
          break;
        case 'jobs':
          data = await Job.findAll({
            attributes: [
              'category',
              [fn('COUNT', col('id')), 'count']
            ],
            group: ['category'],
            order: [[literal('count'), 'DESC']],
            raw: true
          });
          break;
      }

      res.json({
        status: 'success',
        data: data.filter(item => item.category) // Filter out null categories
      });
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch category distribution',
        error: error.message
      });
    }
  },

  // Get recent activities
  getRecentActivities: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const limitNum = parseInt(limit);

      // Get recent items from each entity
      const [recentUsers, recentArticles, recentBooks, recentVideos, recentJobs] = await Promise.all([
        User.findAll({
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limitNum / 5)
        }),
        Article.findAll({
          attributes: ['id', 'title', 'status', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limitNum / 5)
        }),
        Book.findAll({
          attributes: ['id', 'title', 'status', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limitNum / 5)
        }),
        Video.findAll({
          attributes: ['id', 'title', 'status', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limitNum / 5)
        }),
        Job.findAll({
          attributes: ['id', 'title', 'status', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limitNum / 5)
        })
      ]);

      // Combine and format activities
      const activities = [];

      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          title: `${user.firstName} ${user.lastName}`,
          subtitle: user.email,
          action: 'registered',
          createdAt: user.createdAt
        });
      });

      recentArticles.forEach(article => {
        activities.push({
          id: `article-${article.id}`,
          type: 'article',
          title: article.title,
          subtitle: `Status: ${article.status}`,
          action: 'created',
          createdAt: article.createdAt
        });
      });

      recentBooks.forEach(book => {
        activities.push({
          id: `book-${book.id}`,
          type: 'book',
          title: book.title,
          subtitle: `Status: ${book.status}`,
          action: 'added',
          createdAt: book.createdAt
        });
      });

      recentVideos.forEach(video => {
        activities.push({
          id: `video-${video.id}`,
          type: 'video',
          title: video.title,
          subtitle: `Status: ${video.status}`,
          action: 'uploaded',
          createdAt: video.createdAt
        });
      });

      recentJobs.forEach(job => {
        activities.push({
          id: `job-${job.id}`,
          type: 'job',
          title: job.title,
          subtitle: `Status: ${job.status}`,
          action: 'posted',
          createdAt: job.createdAt
        });
      });

      // Sort by creation date and limit
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const limitedActivities = activities.slice(0, limitNum);

      res.json({
        status: 'success',
        data: limitedActivities
      });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch recent activities',
        error: error.message
      });
    }
  },

  // Get top performing content
  getTopContent: async (req, res) => {
    try {
      const { type = 'all', limit = 5 } = req.query;
      const limitNum = parseInt(limit);

      let data = {};

      if (type === 'all' || type === 'articles') {
        data.articles = await Article.findAll({
          attributes: ['id', 'title', 'likeCount', 'viewCount', 'commentCount'],
          order: [['likeCount', 'DESC']],
          limit: limitNum,
          where: {
            status: 'published'
          }
        });
      }

      if (type === 'all' || type === 'books') {
        data.books = await Book.findAll({
          attributes: ['id', 'title', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: limitNum,
          where: {
            status: 'published'
          }
        });
      }

      if (type === 'all' || type === 'videos') {
        data.videos = await Video.findAll({
          attributes: ['id', 'title', 'viewCount'],
          order: [['viewCount', 'DESC']],
          limit: limitNum,
          where: {
            status: 'published'
          }
        });
      }

      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      console.error('Error fetching top content:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch top content',
        error: error.message
      });
    }
  }
};

module.exports = reportController;
