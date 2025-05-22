import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import logger from './utils/logger.js';

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS successfully cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

export const strategy = () =>
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  new BearerStrategy(async (token, done) => {
    try {
      // Allow mock token in dev
      if (process.env.NODE_ENV === 'development' && token === 'mock-id-token'){
        logger.info('Accepted mock token in development');
        return done(null, {
          email: 'dev@mock.local',
          username: 'dev',
          name: 'Development User',
        });
      }

      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');

      done(null, user);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });

export const authenticate = () => passport.authenticate('bearer', { session: false });
