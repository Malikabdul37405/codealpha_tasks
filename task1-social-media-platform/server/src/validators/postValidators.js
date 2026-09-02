const { body } = require('express-validator');

const createPostValidator = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Content must be less than 2000 characters'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body().custom((_, { req }) => {
    if (!req.body.content && !req.body.imageUrl) {
      throw new Error('Post must have either content or an image');
    }
    return true;
  }),
];

const updatePostValidator = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Content must be less than 2000 characters'),
  body('imageUrl')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

module.exports = {
  createPostValidator,
  updatePostValidator,
};
