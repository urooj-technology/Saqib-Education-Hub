const { Author, User } = require('../models');

async function seedAuthors() {
  try {
    console.log('Seeding authors...');
    
    // Get existing users to create author profiles for
    const users = await User.findAll({
      where: {
        role: { [require('sequelize').Op.in]: ['admin', 'teacher'] }
      }
    });

    const authorData = users.map(user => ({
      userId: user.id,
      penName: user.firstName,
      bio: `Author bio for ${user.firstName}`
    }));

    // Create author profiles
    for (const authorInfo of authorData) {
      await Author.findOrCreate({
        where: { userId: authorInfo.userId },
        defaults: authorInfo
      });
    }

    console.log(`✅ Created ${authorData.length} author profiles`);
  } catch (error) {
    console.error('❌ Error seeding authors:', error);
    throw error;
  }
}

module.exports = seedAuthors;
