const jwt = require('jsonwebtoken');

function jwtSign(payload){
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, 
        { expiresIn: '7d' }
    );
}

function jwtVerify(token){
    return jwt.verify(token, 
        process.env.JWT_SECRET_KEY
    );
}

module.exports = { jwtSign, jwtVerify }