# Author System Documentation

## Overview

The new author system provides a flexible way to handle multiple authors for books and articles, with support for different contribution types and author profiles.

## Database Structure

### Tables

1. **`authors`** - Author profiles with detailed information
2. **`book_authors`** - Junction table for book-author relationships
3. **`article_authors`** - Junction table for article-author relationships

### Key Features

- **Many-to-Many Relationships**: One book/article can have multiple authors, one author can have multiple books/articles
- **Contribution Types**: Primary, secondary, contributor, editor, translator, reviewer
- **Author Profiles**: Rich author information including bio, expertise, qualifications
- **Flexible Authoring**: Support for both registered users and external authors

## Models

### Author Model
```javascript
{
  id: UUID (Primary Key),
  userId: UUID (References users.id, nullable for external authors),
  penName: String (Author's pen name),
  bio: Text (Author biography),
  expertise: JSON (Array of expertise areas),
  qualifications: JSON (Array of qualifications),
  socialLinks: JSON (Social media links),
  profileImage: String (Profile image URL),
  isVerified: Boolean (Verification status),
  status: Enum ('active', 'inactive', 'suspended')
}
```

### BookAuthor Junction Model
```javascript
{
  id: UUID (Primary Key),
  bookId: UUID (References books.id),
  authorId: UUID (References authors.id),
  contributionType: Enum ('primary', 'secondary', 'contributor', 'editor', 'translator'),
  contributionOrder: Integer (Order of authors),
  isActive: Boolean (Active status)
}
```

### ArticleAuthor Junction Model
```javascript
{
  id: UUID (Primary Key),
  articleId: UUID (References articles.id),
  authorId: UUID (References authors.id),
  contributionType: Enum ('primary', 'secondary', 'contributor', 'editor', 'reviewer'),
  contributionOrder: Integer (Order of authors),
  isActive: Boolean (Active status)
}
```

## Usage Examples

### Creating a Book with Multiple Authors
```javascript
const { Book, Author, BookAuthor } = require('../models');

// Create book
const book = await Book.create({
  title: 'Advanced Mathematics',
  description: 'Comprehensive guide to advanced mathematics',
  // ... other fields
});

// Create or find authors
const author1 = await Author.findOrCreate({
  where: { userId: user1.id },
  defaults: { penName: user1.fullName }
});

const author2 = await Author.findOrCreate({
  where: { penName: 'Dr. Smith' },
  defaults: { penName: 'Dr. Smith', bio: 'Mathematics Professor' }
});

// Create relationships
await BookAuthor.create({
  bookId: book.id,
  authorId: author1[0].id,
  contributionType: 'primary',
  contributionOrder: 1
});

await BookAuthor.create({
  bookId: book.id,
  authorId: author2[0].id,
  contributionType: 'secondary',
  contributionOrder: 2
});
```

### Finding Books by Author
```javascript
// Find all books by a specific author
const books = await Book.findAll({
  include: [{
    model: BookAuthor,
    where: { authorId: authorId, isActive: true },
    required: true
  }],
  where: { status: 'published' }
});
```

### Getting Author Information for a Book
```javascript
const book = await Book.findByPk(bookId, {
  include: [{
    model: BookAuthor,
    include: [{
      model: Author,
      include: [{
        model: User,
        attributes: ['username', 'fullName', 'email']
      }]
    }]
  }]
});
```

## Migration Process

The system includes three migration files:

1. **001_create_authors_table.js** - Creates new tables
2. **002_migrate_existing_data.js** - Migrates existing data
3. **003_remove_old_author_fields.js** - Removes old fields

### Running Migrations
```bash
node runMigrations.js
```

## Benefits

1. **Scalability**: Easy to add/remove authors from books/articles
2. **Flexibility**: Support for different contribution types
3. **Rich Author Profiles**: Detailed author information
4. **Data Integrity**: Proper foreign key relationships
5. **Search Capability**: Enhanced search by author names
6. **Future-Proof**: Easy to extend with additional author features

## API Endpoints

The system supports these new endpoints:

- `GET /api/authors` - List all authors
- `GET /api/authors/:id` - Get author details
- `POST /api/authors` - Create author profile
- `PUT /api/authors/:id` - Update author profile
- `GET /api/books/:id/authors` - Get authors for a book
- `GET /api/articles/:id/authors` - Get authors for an article

## Notes

- External authors (without user accounts) are supported
- Author profiles are automatically created for users with content
- The system maintains backward compatibility during migration
- All existing data is preserved and properly migrated
