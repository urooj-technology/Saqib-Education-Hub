const { ArticleCategory } = require('../models');
const logger = require('../config/logger');

const articleCategoriesData = [
  { name: 'Research' },
  { name: 'Technology' },
  { name: 'Education' },
  { name: 'Science' },
  { name: 'Mathematics' },
  { name: 'Health & Wellness' },
  { name: 'Business' },
  { name: 'Arts & Culture' },
  { name: 'History' },
  { name: 'Language & Literature' },
  { name: 'News & Current Events' },
  { name: 'Tutorials & How-to' }
];

const seedArticleCategories = async () => {
  try {
    logger.info('Starting article categories seeding...');

    for (const categoryData of articleCategoriesData) {
      // Check if category already exists
      const existingCategory = await ArticleCategory.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        await ArticleCategory.create(categoryData);
        logger.info(`Created article category: ${categoryData.name}`);
      } else {
        logger.info(`Article category already exists: ${categoryData.name}`);
      }
    }

    logger.info('Article categories seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding article categories:', error);
    throw error;
  }
};

module.exports = { seedArticleCategories };