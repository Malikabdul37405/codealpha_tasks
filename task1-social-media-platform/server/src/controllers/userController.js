const userService = require('../services/userService');

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user?.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const result = await userService.followUser(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Followed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const result = await userService.unfollowUser(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await userService.getFollowers(req.params.id, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await userService.getFollowing(req.params.id, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
