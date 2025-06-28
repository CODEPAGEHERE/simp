// File: backend/middleware/AuthMiddleware.js

const Jwt = require('jsonwebtoken');

const AuthMiddleware = (Req, Res, Next) => {
    let Token = Req.headers.authorization;

    if (!Token || !Token.startsWith('Bearer ')) {
        return Res.status(401).json({ Message: 'No token, authorization denied' });
    }

    Token = Token.slice(7).trim();

    try {
        const Decoded = Jwt.verify(Token, process.env.JWT_SECRET);
        Req.User = { UserId: Decoded.UserId }; // Critical change for req.user.userId consistency
        Next();
    } catch (Err) {
        console.error("JWT verification error:", Err.Message);
        Res.status(401).json({ Message: 'Token is not valid' });
    }
};

module.exports = AuthMiddleware;