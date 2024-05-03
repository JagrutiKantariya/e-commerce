const jwt = require('jsonwebtoken');
const { UNAUTHORIZED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, BAD_GATEWAY } = require('http-status-codes')
const {JWT_ACCESS_SECRET,JWT_ACCESS_TIME} = require('../config')

const tokenAuth = {
    verifyToken: async(req,res,next)=>{
        const tokens_ = req.headers?.authorization?.split(' ') ?? []
        if(tokens_.length <= 1){
            return res.status(UNAUTHORIZED).json({status: false, message: 'Token not found in header' })
        }
        const token = tokens_[1];
    
        jwt.verify(token, JWT_ACCESS_SECRET, async(err, user) => {
            if (err) {
                return res.status(UNAUTHORIZED).json({status: false, message: 'Token is expire' })
            } else {
                next()
            }
        })
    }
}

module.exports = tokenAuth