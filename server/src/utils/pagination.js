// server/src/utils/pagination.js

/**
 * Parses page/limit query params into Prisma skip/take, with sane defaults & caps.
 */
function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

/**
 * Builds a standard paginated response payload.
 */
function buildPaginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { getPagination, buildPaginatedResponse };
