const { BookCategory } = require('../models');
const logger = require('../config/logger');

const bookCategoriesData = [
  { name: 'Science' },
  { name: 'Mathematics' },
  { name: 'History' },
  { name: 'Literature' },
  { name: 'Technology' },
  { name: 'Education' },
  { name: 'Health & Medicine' },
  { name: 'Business' },
  { name: 'Arts & Design' },
  { name: 'Languages' }
];

const seedBookCategories = async () => {
  try {
    logger.info('Starting book categories seeding...');

    for (const categoryData of bookCategoriesData) {
      // Check if category already exists
      const existingCategory = await BookCategory.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        await BookCategory.create(categoryData);
        logger.info(`Created book category: ${categoryData.name}`);
      } else {
        logger.info(`Book category already exists: ${categoryData.name}`);
      }
    }

    logger.info('Book categories seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding book categories:', error);
    throw error;
  }
};

module.exports = { seedBookCategories };
