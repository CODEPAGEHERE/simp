const { verifyToken } = require('./TokenUtil');

const authenticate = async (req, res, next) => {
  try {
    if (!req.cookies) {
      return res.status(401).json({ authenticated: false });
    }

    const token = req.cookies.Simp_token;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const payload = verifyToken(token);
    req.user = payload;
    res.json({ authenticated: true });
  } catch (error) {
    if (error.message.includes('Invalid or expired token')) {
      return res.status(401).json({ authenticated: false });
    }

    console.error('Error during authentication:', error);
    res.status(500).json({ authenticated: false });
  }
};

module.exports = authenticate;
