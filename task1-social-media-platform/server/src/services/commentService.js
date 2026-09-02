const prisma = require('../config/database');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const createComment = async (postId, authorId, content) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  return comment;
};

const getCommentsByPost = async (postId, page = 1, limit = 20) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
    }),
    prisma.comment.count({ where: { postId } }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateComment = async (commentId, currentUserId, content) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('Comment not found');
  if (comment.authorId !== currentUserId) {
    throw new ForbiddenError('You can only edit your own comments');
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });
};

const deleteComment = async (commentId, currentUserId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('Comment not found');
  if (comment.authorId !== currentUserId) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: 'Comment deleted successfully' };
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
};
