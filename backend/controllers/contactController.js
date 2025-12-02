const Contact = require('../models/Contact');
const { Op } = require('sequelize');
const { createError } = require('../utils/errorHandler');
const logger = require('../config/logger');

// Create a new contact message
const createContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return next(createError(400, 'All fields are required'));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Please provide a valid email address'));
    }

    // Create contact message
    const contact = await Contact.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    logger.info('New contact message created', {
      contactId: contact.id,
      email: contact.email,
      subject: contact.subject
    });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    logger.error('Error creating contact message:', error);
    next(createError(500, 'Failed to send message. Please try again.'));
  }
};

// Get all contact messages (Admin only)
const getAllContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Map frontend field names to database field names for sorting
    const sortFieldMap = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'firstName': 'first_name',
      'lastName': 'last_name',
      'email': 'email',
      'subject': 'subject'
    };
    
    const actualSortBy = sortFieldMap[sortBy] || 'created_at';

    const offset = (page - 1) * limit;
    const where = {};

    // Search functionality
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Additional filters
    const { status, dateFrom, dateTo } = req.query;
    
    // Date range filtering
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      order: [[actualSortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    console.error('Detailed error in getAllContacts:', error);
    next(createError(500, 'Failed to fetch contact messages'));
  }
};

// Get single contact message (Admin only)
const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return next(createError(404, 'Contact message not found'));
    }

    res.json({
      status: 'success',
      data: { contact }
    });
  } catch (error) {
    logger.error('Error fetching contact:', error);
    next(createError(500, 'Failed to fetch contact message'));
  }
};

// Delete contact message (Admin only)
const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return next(createError(404, 'Contact message not found'));
    }

    await contact.destroy();

    logger.info('Contact message deleted', {
      contactId: id,
      deletedBy: req.user?.id
    });

    res.json({
      status: 'success',
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting contact:', error);
    next(createError(500, 'Failed to delete contact message'));
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact
};
