const express = require('express');
const commentController = require('../controllers/commentController');
const { updateCommentValidator } = require('../validators/commentValidators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.put('/:id', authenticate, updateCommentValidator, validate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
