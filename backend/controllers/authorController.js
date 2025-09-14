const { Author, User } = require('../models');
const createError = require('http-errors');
const { Op } = require('sequelize');

// Get all authors with pagination, filtering, and search
const getAllAuthors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { penName: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Validate sortBy
    const allowedSortFields = ['created_at', 'updated_at', 'penName'];
    if (!allowedSortFields.includes(sortBy)) {
      return next(createError(400, 'Invalid sort field'));
    }

    // Validate sortOrder
    const allowedSortOrders = ['ASC', 'DESC'];
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      return next(createError(400, 'Invalid sort order'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination
    const { count, rows: authors } = await Author.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    const response = {
      status: 'success',
      data: {
        authors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? parseInt(page) + 1 : null,
          prevPage: hasPrevPage ? parseInt(page) - 1 : null
        }
      },
      message: 'Authors retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting all authors:', error);
    next(createError(500, 'Error retrieving authors'));
  }
};

// Get author by ID
const getAuthorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const author = await Author.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }
      ]
    });

    if (!author) {
      return next(createError(404, 'Author not found'));
    }

    res.json({
      success: true,
      data: author,
      message: 'Author retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting author by ID:', error);
    next(createError(500, 'Error retrieving author'));
  }
};

// Create new author
const createAuthor = async (req, res, next) => {
  try {
    console.log('createAuthor called with body:', req.body);
    console.log('createAuthor user:', req.user);
    console.log('createAuthor file:', req.file);
    
    const { penName, bio } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    // Validate required fields
    if (!penName || !penName.trim()) {
      return next(createError(400, 'Pen name is required'));
    }

    if (!bio || !bio.trim()) {
      return next(createError(400, 'Bio is required'));
    }

    // Check if author with same pen name already exists
    const existingAuthor = await Author.findOne({
      where: { penName: penName.trim() }
    });

    if (existingAuthor) {
      return next(createError(409, 'Author with this pen name already exists'));
    }

    console.log('About to create author with data:', {
      userId: req.user.id,
      penName: penName.trim(),
      bio: bio.trim(),
      profileImage
    });
    
    // Create author
    const author = await Author.create({
      userId: req.user.id, // From auth middleware
      penName: penName.trim(),
      bio: bio.trim(),
      profileImage
    });
    
    console.log('Author created successfully:', author);

    // Fetch the created author with user details
    const createdAuthor = await Author.findByPk(author.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }
      ]
    });

    console.log(`Author created: ${author.penName} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: createdAuthor,
      message: 'Author created successfully'
    });
  } catch (error) {
    console.error('Error creating author:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    next(createError(500, 'Error creating author'));
  }
};

// Update author
const updateAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const profileImage = req.file ? req.file.filename : null;

    console.log('updateAuthor called with:');
    console.log('- ID:', id);
    console.log('- Body:', updateData);
    console.log('- File:', req.file);
    console.log('- ProfileImage filename:', profileImage);

    // Find author
    const author = await Author.findByPk(id);
    if (!author) {
      return next(createError(404, 'Author not found'));
    }

    // Check if user is authorized to update this author
    if (req.user.role !== 'admin' && author.userId !== req.user.id) {
      return next(createError(403, 'Not authorized to update this author'));
    }

    // Clean up update data - remove empty objects and invalid values
    const cleanedUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      // Skip empty objects, arrays, and undefined values
      if (value !== null && value !== undefined && value !== '' && 
          !(typeof value === 'object' && Object.keys(value).length === 0) &&
          !Array.isArray(value)) {
        cleanedUpdateData[key] = value;
      }
    }

    const { penName, bio } = cleanedUpdateData;

    // Validate required fields
    if (!penName || !penName.trim()) {
      return next(createError(400, 'Pen name is required'));
    }

    if (!bio || !bio.trim()) {
      return next(createError(400, 'Bio is required'));
    }

    // Check if pen name is being changed and if it conflicts with existing
    if (penName.trim() !== author.penName) {
      const existingAuthor = await Author.findOne({
        where: { 
          penName: penName.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingAuthor) {
        return next(createError(409, 'Author with this pen name already exists'));
      }
    }

    // Update author
    await author.update({
      penName: penName.trim(),
      bio: bio.trim(),
      ...(profileImage && { profileImage })
    });

    // Fetch updated author with user details
    const updatedAuthor = await Author.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }
      ]
    });

    console.log(`Author updated: ${author.penName} by user ${req.user.id}`);

    res.json({
      success: true,
      data: updatedAuthor,
      message: 'Author updated successfully'
    });
  } catch (error) {
    console.error('Error updating author:', error);
    next(createError(500, 'Error updating author'));
  }
};

// Delete author
const deleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find author
    const author = await Author.findByPk(id);
    if (!author) {
      return next(createError(404, 'Author not found'));
    }

    // Check if user is authorized to delete this author
    if (req.user.role !== 'admin' && author.userId !== req.user.id) {
      return next(createError(403, 'Not authorized to delete this author'));
    }

    // Delete author
    await author.destroy();

    console.log(`Author deleted: ${author.penName} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Author deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting author:', error);
    next(createError(500, 'Error deleting author'));
  }
};

// Search authors
const searchAuthors = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || !q.trim()) {
      return next(createError(400, 'Search query is required'));
    }

    const authors = await Author.findAll({
      where: {
        [Op.or]: [
          { penName: { [Op.like]: `%${q.trim()}%` } },
          { bio: { [Op.like]: `%${q.trim()}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }
      ],
      limit: parseInt(limit),
      order: [['penName', 'ASC']]
    });

    res.json({
      success: true,
      data: authors,
      message: 'Authors search completed successfully'
    });
  } catch (error) {
    console.error('Error searching authors:', error);
    next(createError(500, 'Error searching authors'));
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  searchAuthors
};
