'use strict';

const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const rootDir = path.resolve(__dirname, '..', '..');
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toBool(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function resolveSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 16 && !secret.startsWith('replace_with')) {
    return secret;
  }

  if (isProduction) {
    throw new Error(
      'SESSION_SECRET must be set to a long random string in production.'
    );
  }

  console.warn(
    '[config] SESSION_SECRET is missing or weak. Using a temporary random secret ' +
      '(sessions will reset on restart). Set SESSION_SECRET in your .env file.'
  );
  return crypto.randomBytes(48).toString('hex');
}

const config = {
  nodeEnv,
  isProduction,
  rootDir,
  publicDir: path.join(rootDir, 'public'),

  port: toInt(process.env.PORT, 3000),

  databasePath: path.resolve(
    rootDir,
    process.env.DATABASE_PATH || './data/saleflow.db'
  ),

  adminUsername: (process.env.ADMIN_USERNAME || '').trim(),
  adminPassword: process.env.ADMIN_PASSWORD || '',

  sessionSecret: resolveSessionSecret(),
  sessionMaxAgeMs: 1000 * 60 * 60 * 8, // 8 hours
  cookieSecure: toBool(process.env.COOKIE_SECURE),
  trustProxy: toBool(process.env.TRUST_PROXY),

  bcryptRounds: 12,
};

module.exports = config;
