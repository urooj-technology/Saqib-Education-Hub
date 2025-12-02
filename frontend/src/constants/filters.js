/**
 * Filter Constants
 * Centralized filter options for scholarships, jobs, books, etc.
 * Provides consistent filter options across the application
 */

// Scholarship Filter Options
export const SCHOLARSHIP_FILTERS = {
  categories: [
    'All',
    'academic',
    'merit',
    'need-based',
    'athletic',
    'research',
    'international',
    'minority',
    'women'
  ],
  types: [
    'All',
    'full_tuition',
    'partial_tuition',
    'stipend',
    'grant',
    'fellowship'
  ],
  statuses: [
    'All',
    'active',
    'expired',
    'draft',
    'inactive'
  ],
  levels: [
    'All',
    'Undergraduate',
    'Graduate',
    'Postgraduate',
    'Masters',
    'PhD',
    'Certificate',
    'Diploma'
  ]
};

// Job Filter Options
export const JOB_FILTERS = {
  types: [
    'All',
    'full-time',
    'part-time',
    'contract',
    'internship',
    'temporary',
    'remote'
  ],
  experiences: [
    'All',
    'entry-level',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ],
  statuses: [
    'All',
    'active',
    'draft',
    'expired',
    'inactive'
  ],
  genders: [
    'All',
    'male',
    'female',
    'any'
  ],
  contractTypes: [
    'All',
    'permanent',
    'temporary',
    'contract',
    'freelance'
  ]
};

// Book Filter Options
export const BOOK_FILTERS = {
  formats: [
    'All',
    'pdf',
    'epub',
    'mobi',
    'docx',
    'txt',
    'html'
  ],
  languages: [
    'All',
    'English',
    'Pashto',
    'Dari',
    'Arabic',
    'Urdu',
    'Persian'
  ],
  statuses: [
    'All',
    'published',
    'draft',
    'archived',
    'pending_review'
  ]
};

// Article Filter Options
export const ARTICLE_FILTERS = {
  statuses: [
    'All',
    'published',
    'draft',
    'archived'
  ],
  languages: [
    'All',
    'English',
    'Pashto',
    'Dari'
  ]
};

// Common Status Options (reusable across different entities)
export const COMMON_STATUSES = {
  all: 'All',
  active: 'active',
  inactive: 'inactive',
  draft: 'draft',
  published: 'published',
  archived: 'archived',
  expired: 'expired'
};

// User Filter Options
export const USER_FILTERS = {
  roles: [
    'All',
    'admin',
    'hr',
    'student',
    'teacher',
    'author'
  ],
  statuses: [
    'All',
    'active',
    'inactive',
    'pending',
    'suspended'
  ]
};

// Pagination Options
export const PAGINATION_OPTIONS = {
  rowsPerPage: [5, 10, 15, 20, 25, 50, 100],
  defaultRowsPerPage: 10
};

// Sort Options
export const SORT_OPTIONS = {
  orders: ['ASC', 'DESC'],
  commonFields: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    name: 'name',
    status: 'status'
  }
};

/**
 * Get category label (human-readable format)
 * @param {string} category - Category value
 * @returns {string} - Formatted category label
 */
export const getCategoryLabel = (category) => {
  if (!category) return 'N/A';
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get type label (human-readable format)
 * @param {string} type - Type value
 * @returns {string} - Formatted type label
 */
export const getTypeLabel = (type) => {
  if (!type) return 'N/A';
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get status badge color based on status value
 * @param {string} status - Status value
 * @returns {string} - Tailwind CSS classes for badge
 */
export const getStatusBadgeColor = (status) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-purple-100 text-purple-800',
    pending: 'bg-orange-100 text-orange-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get type badge color based on type value
 * @param {string} type - Type value
 * @returns {string} - Tailwind CSS classes for badge
 */
export const getTypeBadgeColor = (type) => {
  const typeColors = {
    'full_tuition': 'bg-green-100 text-green-800',
    'partial_tuition': 'bg-blue-100 text-blue-800',
    'stipend': 'bg-purple-100 text-purple-800',
    'grant': 'bg-orange-100 text-orange-800',
    'fellowship': 'bg-indigo-100 text-indigo-800',
    'full-time': 'bg-green-100 text-green-800',
    'part-time': 'bg-blue-100 text-blue-800',
    'contract': 'bg-yellow-100 text-yellow-800',
    'internship': 'bg-purple-100 text-purple-800'
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-800';
};

export default {
  SCHOLARSHIP_FILTERS,
  JOB_FILTERS,
  BOOK_FILTERS,
  ARTICLE_FILTERS,
  COMMON_STATUSES,
  USER_FILTERS,
  PAGINATION_OPTIONS,
  SORT_OPTIONS,
  getCategoryLabel,
  getTypeLabel,
  getStatusBadgeColor,
  getTypeBadgeColor
};

