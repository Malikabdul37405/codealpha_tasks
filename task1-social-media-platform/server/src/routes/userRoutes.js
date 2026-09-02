const express = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { updateProfileValidator } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', optionalAuth, userController.getUser);
router.put('/:id', authenticate, updateProfileValidator, validate, userController.updateProfile);
router.post('/:id/follow', authenticate, userController.followUser);
router.delete('/:id/follow', authenticate, userController.unfollowUser);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);
router.get('/:id/posts', optionalAuth, postController.getUserPosts);

module.exports = router;
