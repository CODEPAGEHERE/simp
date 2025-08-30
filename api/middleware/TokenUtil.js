const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const ENCRYPTION_IV = Buffer.from(process.env.ENCRYPTION_IV, 'base64');

if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV are required for token encryption');
}

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes long for AES-256-CBC encryption');
}

if (ENCRYPTION_IV.length !== 16) {
  throw new Error('ENCRYPTION_IV must be 16 bytes long for AES-256-CBC encryption');
}

const encrypt = (text) => {
  try {
    const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, ENCRYPTION_IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    throw new Error(`Error encrypting token: ${error.message}`);
  }
};

const decrypt = (encryptedText) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, ENCRYPTION_IV);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error(`Error decrypting token: ${error.message}`);
  }
};

const generateToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  return encrypt(token);
};

const verifyToken = (encryptedToken) => {
  try {
    const decryptedToken = decrypt(encryptedToken);
    const payload = jwt.verify(decryptedToken, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
};

module.exports = { generateToken, verifyToken };
