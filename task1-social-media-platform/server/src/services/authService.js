const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { signToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

const SALT_ROUNDS = 12;

const register = async ({ username, email, password, name }) => {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    if (existing.email === email) {
      throw new ConflictError('Email is already registered');
    }
    throw new ConflictError('Username is already taken');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      name: name || null,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  });

  const token = signToken({ userId: user.id });

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    token,
  };
};

module.exports = {
  register,
  login,
};
