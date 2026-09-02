const express = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const { createPostValidator, updatePostValidator } = require('../validators/postValidators');
const { createCommentValidator } = require('../validators/commentValidators');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/feed', authenticate, postController.getFeed);
router.post('/', authenticate, createPostValidator, validate, postController.createPost);
router.get('/:id', optionalAuth, postController.getPost);
router.put('/:id', authenticate, updatePostValidator, validate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', authenticate, createCommentValidator, validate, commentController.createComment);

router.post('/:id/like', authenticate, likeController.likePost);
router.delete('/:id/like', authenticate, likeController.unlikePost);

module.exports = router;
