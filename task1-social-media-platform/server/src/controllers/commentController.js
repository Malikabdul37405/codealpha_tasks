const commentService = require('../services/commentService');

const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.params.id, req.user.id, req.body.content);
    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await commentService.getCommentsByPost(req.params.id, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(req.params.id, req.user.id, req.body.content);
    res.status(200).json({
      success: true,
      data: comment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
