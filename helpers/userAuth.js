const jwt=require('jsonwebtoken')
const createError=require('http-errors')
const dotenv=require('dotenv')

module.exports={userAuth: (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log("Authorization Header:", authHeader);
        if (!authHeader) return next(createError.Unauthorized("No authorization header"));

        const bearerToken = authHeader.split(' ');
        if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
            return next(createError.Unauthorized("Invalid authorization header format"));
        }

        const token = bearerToken[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
                return next(createError.Unauthorized(message));
            }
            const { role, userId } = payload;
            console.log("Decoded Payload:", payload);

            req.payload = payload;
            req.role = role;
            req.userId = userId;
            if (role !== 'user') {
                return res.status(403).json({ error: "Access forbidden" });
            }

            console.log(`${role}`)
            next();
        });
    } catch (error) {
        next(createError.InternalServerError(error.message));
    }
}}