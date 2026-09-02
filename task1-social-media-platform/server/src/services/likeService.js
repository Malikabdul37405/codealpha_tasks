const prisma = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');

const likePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  try {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('You have already liked this post');
    }
    throw error;
  }

  const likesCount = await prisma.like.count({ where: { postId } });
  return { likesCount, isLiked: true };
};

const unlikePost = async (postId, userId) => {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!like) {
    throw new NotFoundError('You have not liked this post');
  }

  await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  const likesCount = await prisma.like.count({ where: { postId } });
  return { likesCount, isLiked: false };
};

module.exports = {
  likePost,
  unlikePost,
};
