const prisma = require('../config/database');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const createPost = async (authorId, { content, imageUrl }) => {
  const post = await prisma.post.create({
    data: {
      content: content || null,
      imageUrl: imageUrl || null,
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
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  return formatPost(post, authorId);
};

const getPostById = async (postId, currentUserId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  return formatPost(post, currentUserId);
};

const updatePost = async (postId, currentUserId, data) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');
  if (post.authorId !== currentUserId) {
    throw new ForbiddenError('You can only edit your own posts');
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      content: data.content !== undefined ? data.content : post.content,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : post.imageUrl,
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
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  return formatPost(updated, currentUserId);
};

const deletePost = async (postId, currentUserId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');
  if (post.authorId !== currentUserId) {
    throw new ForbiddenError('You can only delete your own posts');
  }

  await prisma.post.delete({ where: { id: postId } });
  return { message: 'Post deleted successfully' };
};

const getFeed = async (currentUserId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });

  const authorIds = [currentUserId, ...following.map((f) => f.followingId)];

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    prisma.post.count({
      where: { authorId: { in: authorIds } },
    }),
  ]);

  const postIds = posts.map((p) => p.id);
  const userLikes = await prisma.like.findMany({
    where: {
      userId: currentUserId,
      postId: { in: postIds },
    },
    select: { postId: true },
  });
  const likedSet = new Set(userLikes.map((l) => l.postId));

  return {
    posts: posts.map((p) => ({
      ...formatPost(p, currentUserId),
      isLiked: likedSet.has(p.id),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserPosts = async (userId, currentUserId = null, page = 1, limit = 10) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    prisma.post.count({ where: { authorId: userId } }),
  ]);

  let likedSet = new Set();
  if (currentUserId) {
    const postIds = posts.map((p) => p.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    likedSet = new Set(userLikes.map((l) => l.postId));
  }

  return {
    posts: posts.map((p) => ({
      ...formatPost(p, currentUserId),
      isLiked: likedSet.has(p.id),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

function formatPost(post, currentUserId) {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLiked: false,
  };
}

module.exports = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
};
