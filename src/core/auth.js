import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import logger from '../shared/utils/logger.js';

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

export async function hydrateCognitoJwks() {
  try {
    await jwtVerifier.hydrate();
    logger.info('Cognito JWKS successfully cached');
  } catch (error) {
    logger.error({ error }, 'Unable to cache Cognito JWKS');
  }
}

export const strategy = new BearerStrategy(async (token, done) => {
  try {
    // Allow mock token in dev
    if (process.env.NODE_ENV === 'development' && token === 'mock-id-token') {
      logger.info('Accepted mock token in development');
      return done(null, {
        userId: 'dev',
        email: 'dev@mock.local',
        name: 'Development User',
      });
    }

    // Verify this JWT
    const user = await jwtVerifier.verify(token);
    logger.debug({ user }, 'Verified user token');

    done(null, {
      userId: user['cognito:username'],
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    logger.error({ err, token }, 'Could not verify token');
    done(null, false);
  }
});

export default passport.authenticate('bearer', { session: false });
