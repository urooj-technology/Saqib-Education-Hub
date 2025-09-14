const User = require('./User');
const Author = require('./Author');
const Book = require('./Book');
const BookAuthor = require('./BookAuthor');
const Article = require('./Article');
const ArticleAuthor = require('./ArticleAuthor');
const Video = require('./Video');
const Province = require('./Province');
const Company = require('./Company');
const Job = require('./Job');
const Scholarship = require('./Scholarship');
const SubscriptionPlan = require('./SubscriptionPlan');
const UserSubscription = require('./UserSubscription');

// Define associations
// User-Author relationship (one-to-one)
User.hasOne(Author, { as: 'authorProfile', foreignKey: 'userId' });
Author.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Many-to-many relationships through junction tables
Author.belongsToMany(Book, { through: BookAuthor, as: 'books', foreignKey: 'authorId' });
Book.belongsToMany(Author, { through: BookAuthor, as: 'authors', foreignKey: 'bookId' });

Author.belongsToMany(Article, { through: ArticleAuthor, as: 'articles', foreignKey: 'authorId' });
Article.belongsToMany(Author, { through: ArticleAuthor, as: 'authors', foreignKey: 'articleId' });

// Junction table relationships
BookAuthor.belongsTo(Book, { foreignKey: 'bookId' });
BookAuthor.belongsTo(Author, { foreignKey: 'authorId' });

ArticleAuthor.belongsTo(Article, { foreignKey: 'articleId' });
ArticleAuthor.belongsTo(Author, { foreignKey: 'authorId' });

// Video relationships
User.hasMany(Video, { as: 'videos', foreignKey: 'authorId' });
Video.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Company relationships - simplified, no province relationship

// Job relationships with Province and Company
User.hasMany(Job, { as: 'jobs', foreignKey: 'author_id' });
Job.belongsTo(User, { as: 'postedBy', foreignKey: 'author_id' });
Province.hasMany(Job, { as: 'jobs', foreignKey: 'province_id' });
Job.belongsTo(Province, { as: 'province', foreignKey: 'province_id' });
Company.hasMany(Job, { as: 'jobs', foreignKey: 'company_id' });
Job.belongsTo(Company, { as: 'company', foreignKey: 'company_id' });

// Subscription relationships
User.hasMany(UserSubscription, { as: 'subscriptions', foreignKey: 'userId' });
UserSubscription.belongsTo(User, { as: 'user', foreignKey: 'userId' });

SubscriptionPlan.hasMany(UserSubscription, { as: 'userSubscriptions', foreignKey: 'planId' });
UserSubscription.belongsTo(SubscriptionPlan, { as: 'plan', foreignKey: 'planId' });

// Scholarship relationships
User.hasMany(Scholarship, { as: 'scholarships', foreignKey: 'authorId' });
Scholarship.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Export models
module.exports = {
  User,
  Author,
  Book,
  BookAuthor,
  Article,
  ArticleAuthor,
  Video,
  Province,
  Company,
  Job,
  Scholarship,
  SubscriptionPlan,
  UserSubscription
};
