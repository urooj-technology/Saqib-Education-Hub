# Clean Database Structure Documentation

## Overview

This document outlines the cleaned and optimized database structure for the Education Hub application. All tables have been streamlined to contain only essential columns, removing unnecessary fields for better performance and maintainability.

## Database Tables

### 1. **users** - User Management
**Essential Fields Only:**
- `id` (UUID, Primary Key)
- `firstName` (String 50)
- `lastName` (String 50)
- `email` (String 100, Unique)
- `password` (String 255)
- `phone` (String 20, Optional)
- `avatar` (String 255, Optional)
- `role` (Enum: student, teacher, admin, moderator)
- `status` (Enum: active, inactive, suspended, pending)
- `emailVerified` (Boolean)
- `lastLoginAt` (Date, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `phoneVerified`, `loginAttempts`, `lockedUntil`
- `preferences`, `address`, `socialLinks`
- `subscription`, `subscriptionExpiresAt`

### 2. **authors** - Author Profiles
**Essential Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, References users.id)
- `penName` (String 100)
- `bio` (Text)
- `expertise` (JSON Array)
- `qualifications` (JSON Array)
- `socialLinks` (JSON)
- `profileImage` (String 500)
- `isVerified` (Boolean)
- `status` (Enum: active, inactive, suspended)
- `createdAt`, `updatedAt` (Timestamps)

### 3. **provinces** - Geographic Locations
**Essential Fields:**
- `id` (UUID, Primary Key)
- `name` (String 100, Unique)
- `code` (String 10, Unique)
- `country` (String 100, Default: Afghanistan)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### 4. **books** - Educational Books
**Essential Fields:**
- `id` (UUID, Primary Key)
- `title` (String 255)
- `description` (Text)
- `isbn` (String 20, Unique)
- `publisher` (String 100)
- `publicationYear` (Integer)
- `edition` (String 20)
- `pages` (Integer)
- `language` (String 50)
- `category` (String 100)
- `format` (Enum: pdf, epub, mobi, docx, txt, html)
- `fileSize` (Integer)
- `filePath` (String 500)
- `coverImage` (String 500)
- `price` (Decimal 10,2)
- `currency` (String 3)
- `status` (Enum: draft, published, archived, pending_review)
- `downloadCount`, `viewCount` (Integer)
- `rating` (Decimal 3,2)
- `ratingCount` (Integer)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `subcategory`, `tags`, `visibility`
- `featured`, `featuredAt`, `metadata`
- `seoTitle`, `seoDescription`, `seoKeywords`

### 5. **articles** - Educational Articles
**Essential Fields:**
- `id` (UUID, Primary Key)
- `title` (String 255)
- `slug` (String 255, Unique)
- `content` (Text)
- `excerpt` (Text)
- `category` (String 100)
- `featuredImage` (String 500)
- `status` (Enum: draft, published, archived, pending_review)
- `publishedAt` (Date)
- `readTime` (Integer, minutes)
- `viewCount`, `likeCount`, `commentCount` (Integer)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `tags`, `visibility`, `featured`, `featuredAt`
- `seoTitle`, `seoDescription`, `seoKeywords`, `metadata`

### 6. **videos** - Educational Videos
**Essential Fields:**
- `id` (UUID, Primary Key)
- `title` (String 255)
- `description` (Text)
- `authorId` (UUID, References users.id)
- `category` (String 100)
- `videoFile` (String 500)
- `thumbnail` (String 500)
- `duration` (Integer, seconds)
- `quality` (Enum: 240p, 360p, 480p, 720p, 1080p, 4K)
- `fileSize` (Integer)
- `format` (String 20)
- `language` (String 50)
- `status` (Enum: draft, published, archived, pending_review)
- `publishedAt` (Date)
- `viewCount`, `likeCount`, `commentCount` (Integer)
- `rating` (Decimal 3,2)
- `ratingCount` (Integer)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `subcategory`, `tags`, `subtitles`, `visibility`
- `dislikeCount`, `featured`, `featuredAt`
- `seoTitle`, `seoDescription`, `seoKeywords`, `metadata`

### 7. **jobs** - Job Listings
**Essential Fields:**
- `id` (UUID, Primary Key)
- `title` (String 255)
- `description` (Text)
- `company` (String 100)
- `authorId` (UUID, References users.id)
- `category` (String 100)
- `type` (Enum: full-time, part-time, contract, internship, freelance)
- `provinceId` (UUID, References provinces.id)
- `remote` (Boolean)
- `salary` (Decimal 12,2)
- `currency` (String 3)
- `experience` (Enum: entry, junior, mid-level, senior, lead, executive)
- `requirements` (JSON)
- `benefits` (JSON)
- `status` (Enum: active, inactive, expired, filled, draft)
- `deadline` (Date)
- `viewCount`, `applicationCount` (Integer)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `subcategory`, `location`, `salaryType`, `tags`
- `companyLogo`, `visibility`, `featured`, `featuredAt`
- `seoTitle`, `seoDescription`, `seoKeywords`, `metadata`

### 8. **scholarships** - Scholarship Opportunities
**Essential Fields:**
- `id` (UUID, Primary Key)
- `title` (String 255)
- `description` (Text)
- `organization` (String 255)
- `authorId` (UUID, References users.id)
- `category` (Enum: academic, athletic, arts, community_service, leadership, minority, need_based, merit_based, research, study_abroad, graduate, undergraduate, other)
- `type` (Enum: full_tuition, partial_tuition, room_board, books_supplies, travel, stipend, fellowship, grant, loan, other)
- `level` (Enum: high_school, undergraduate, graduate, phd, postdoc, professional, other)
- `country` (String 100)
- `amount` (Decimal 10,2)
- `currency` (String 3)
- `requirements` (JSON Array)
- `benefits` (JSON Array)
- `status` (Enum: active, inactive, expired, draft)
- `deadline` (Date)
- `logo` (String 500)
- `applicationCount`, `viewCount` (Integer)
- `createdAt`, `updatedAt` (Timestamps)

**Removed Fields:**
- `tags`, `visibility`, `featured`, `featuredAt`
- `seoTitle`, `seoDescription`, `seoKeywords`, `metadata`

## Junction Tables

### 9. **book_authors** - Book-Author Relationships
- `id` (UUID, Primary Key)
- `bookId` (UUID, References books.id)
- `authorId` (UUID, References authors.id)
- `contributionType` (Enum: primary, secondary, contributor, editor, translator)
- `contributionOrder` (Integer)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### 10. **article_authors** - Article-Author Relationships
- `id` (UUID, Primary Key)
- `articleId` (UUID, References articles.id)
- `authorId` (UUID, References authors.id)
- `contributionType` (Enum: primary, secondary, contributor, editor, reviewer)
- `contributionOrder` (Integer)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

## Key Relationships

1. **User → Author**: One-to-One (User has one Author profile)
2. **User → Books**: Many-to-Many through BookAuthor
3. **User → Articles**: Many-to-Many through ArticleAuthor
4. **User → Videos**: One-to-Many (User has many Videos)
5. **User → Jobs**: One-to-Many (User has many Jobs)
6. **User → Scholarships**: One-to-Many (User has many Scholarships)
7. **Province → Jobs**: One-to-Many (Province has many Jobs)

## Benefits of Clean Structure

1. **Performance**: Fewer columns = faster queries
2. **Maintainability**: Easier to understand and modify
3. **Storage**: Reduced database size
4. **Security**: Fewer fields to validate and secure
5. **Scalability**: Cleaner structure for future enhancements

## Migration Order

1. Create authors table
2. Migrate existing data
3. Remove old author fields
4. Create provinces table
5. Add province relationships to jobs

## Running the System

```bash
# Run migrations
node backend/runMigrations.js

# Run seeders
node backend/seeders/index.js
```

This clean structure provides a solid foundation for the Education Hub while maintaining all essential functionality.
