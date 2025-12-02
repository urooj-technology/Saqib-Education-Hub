const { sequelize } = require('../config/database');

const fixCategoryTables = async () => {
  try {
    console.log('🔧 Fixing category table schemas...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if tables exist and get their structure
    console.log('📋 Checking current table structure...');
    
    try {
      const [bookTableInfo] = await sequelize.query("DESCRIBE book_categories");
      console.log('Book categories table columns:', bookTableInfo.map(col => col.Field));
    } catch (error) {
      console.log('Book categories table does not exist');
    }

    try {
      const [articleTableInfo] = await sequelize.query("DESCRIBE article_categories");
      console.log('Article categories table columns:', articleTableInfo.map(col => col.Field));
    } catch (error) {
      console.log('Article categories table does not exist');
    }

    // Drop existing tables completely and recreate with correct structure
    console.log('🗑️ Dropping existing category tables...');
    
    try {
      await sequelize.query("DROP TABLE IF EXISTS book_categories");
      console.log('✅ Dropped book_categories table');
    } catch (error) {
      console.log('Book categories table did not exist');
    }

    try {
      await sequelize.query("DROP TABLE IF EXISTS article_categories");
      console.log('✅ Dropped article_categories table');
    } catch (error) {
      console.log('Article categories table did not exist');
    }

    // Create tables with correct simplified structure
    console.log('🏗️ Creating new category tables...');
    
    await sequelize.query(`
      CREATE TABLE book_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created book_categories table');

    await sequelize.query(`
      CREATE TABLE article_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created article_categories table');

    // Test the models
    console.log('🧪 Testing models...');
    const { BookCategory, ArticleCategory } = require('../models');
    
    // Test BookCategory
    const testBook = await BookCategory.create({ name: 'Test Book Category' });
    console.log('✅ BookCategory model working:', testBook.name);
    await testBook.destroy();

    // Test ArticleCategory
    const testArticle = await ArticleCategory.create({ name: 'Test Article Category' });
    console.log('✅ ArticleCategory model working:', testArticle.name);
    await testArticle.destroy();

    // Seed with default categories
    console.log('🌱 Seeding default categories...');
    
    // Book categories
    const bookCategories = [
      'Science', 'Mathematics', 'History', 'Literature', 'Technology', 
      'Education', 'Health & Medicine', 'Business', 'Arts & Design', 'Languages'
    ];

    for (const name of bookCategories) {
      await BookCategory.create({ name });
      console.log(`✅ Seeded book category: ${name}`);
    }

    // Article categories
    const articleCategories = [
      'Research', 'Technology', 'Education', 'Science', 'Mathematics',
      'Health & Wellness', 'Business', 'Arts & Culture', 'History',
      'Language & Literature', 'News & Current Events', 'Tutorials & How-to'
    ];

    for (const name of articleCategories) {
      await ArticleCategory.create({ name });
      console.log(`✅ Seeded article category: ${name}`);
    }

    console.log('🎉 Category tables fixed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${bookCategories.length} book categories seeded`);
    console.log(`   - ${articleCategories.length} article categories seeded`);
    console.log('   - All models tested and working');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing category tables:', error);
    console.error('Error details:', error.message);
    if (error.sql) {
      console.error('SQL Error:', error.sql);
    }
    process.exit(1);
  }
};

// Run the migration
fixCategoryTables();
