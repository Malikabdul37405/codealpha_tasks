const likeService = require('../services/likeService');

const likePost = async (req, res, next) => {
  try {
    const result = await likeService.likePost(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Post liked',
    });
  } catch (error) {
    next(error);
  }
};

const unlikePost = async (req, res, next) => {
  try {
    const result = await likeService.unlikePost(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Post unliked',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likePost,
  unlikePost,
};
