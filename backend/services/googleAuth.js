const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || '').trim();

function getGoogleOAuthClient() {
  if (!GOOGLE_CLIENT_ID) return null;
  return new OAuth2Client(GOOGLE_CLIENT_ID);
}

function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

async function verifyGoogleIdToken(idToken) {
  const client = getGoogleOAuthClient();
  if (!client) {
    const err = new Error('GOOGLE_NOT_CONFIGURED');
    err.code = 'GOOGLE_NOT_CONFIGURED';
    throw err;
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  });
  return ticket.getPayload();
}

async function findOrCreateGoogleUser(prisma, payload) {
  const googleId = payload.sub;
  const email = String(payload.email || '')
    .trim()
    .toLowerCase();
  const fullName = payload.name || null;
  const avatarUrl = payload.picture || null;

  if (!googleId) {
    const err = new Error('INVALID_GOOGLE_PROFILE');
    err.code = 'INVALID_GOOGLE_PROFILE';
    throw err;
  }
  if (!email) {
    const err = new Error('GOOGLE_EMAIL_REQUIRED');
    err.code = 'GOOGLE_EMAIL_REQUIRED';
    throw err;
  }
  if (payload.email_verified === false) {
    const err = new Error('GOOGLE_EMAIL_NOT_VERIFIED');
    err.code = 'GOOGLE_EMAIL_NOT_VERIFIED';
    throw err;
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }]
    }
  });

  if (user) {
    const updates = {};
    if (!user.googleId) updates.googleId = googleId;
    if (avatarUrl && !user.avatarUrl) updates.avatarUrl = avatarUrl;
    if (fullName && !user.fullName) updates.fullName = fullName;
    if (Object.keys(updates).length) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates
      });
    }
    return user;
  }

  return prisma.user.create({
    data: {
      email,
      googleId,
      fullName,
      avatarUrl,
      passwordHash: null
    }
  });
}

module.exports = {
  isGoogleAuthConfigured,
  verifyGoogleIdToken,
  findOrCreateGoogleUser
};
