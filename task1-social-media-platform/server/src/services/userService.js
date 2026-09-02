const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../utils/errors');

const getUserById = async (userId, currentUserId = null) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      bio: true,
      profileImage: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  let isFollowing = false;
  if (currentUserId && currentUserId !== userId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });
    isFollowing = !!follow;
  }

  return {
    id: user.id,
    username: user.username,
    email: currentUserId === userId ? user.email : undefined,
    name: user.name,
    bio: user.bio,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    postsCount: user._count.posts,
    isFollowing,
  };
};

const updateProfile = async (userId, currentUserId, data) => {
  if (userId !== currentUserId) {
    throw new ForbiddenError('You can only update your own profile');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      bio: data.bio,
      profileImage: data.profileImage,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      bio: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const followUser = async (targetUserId, currentUserId) => {
  if (targetUserId === currentUserId) {
    throw new BadRequestError('You cannot follow yourself');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  try {
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('You are already following this user');
    }
    throw error;
  }

  return { message: 'Followed successfully' };
};

const unfollowUser = async (targetUserId, currentUserId) => {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (!follow) {
    throw new NotFoundError('You are not following this user');
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  return { message: 'Unfollowed successfully' };
};

const getFollowers = async (userId, page = 1, limit = 20) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            bio: true,
          },
        },
      },
    }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  return {
    users: followers.map((f) => f.follower),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFollowing = async (userId, page = 1, limit = 20) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            bio: true,
          },
        },
      },
    }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return {
    users: following.map((f) => f.following),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getUserById,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
