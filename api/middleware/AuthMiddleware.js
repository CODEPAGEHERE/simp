const Jwt = require('jsonwebtoken'); 

const Protect = (req, res, next) => { 
    let Token = req.headers.authorization;

    if (!Token || !Token.startsWith('Bearer ')) {
        return res.status(401).json({ Message: 'No token, authorization denied' }); 
    }

    Token = Token.slice(7).trim();

    try {
        const Decoded = Jwt.verify(Token, process.env.JWT_SECRET); 
        
      
        req.User = { UserId: Decoded.UserId }; 
        
        next(); 
    } catch (err) { 
        console.error("JWT verification error:", err.Message); 
        res.status(401).json({ Message: 'Token is not valid' }); 
    }
};

module.exports = { Protect }; 