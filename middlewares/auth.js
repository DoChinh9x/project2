const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');


//protect routes
exports.protect = asyncHandler(async(req,res,next)=>{
    let token;
    if(
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.accessToken){
        token = req.cookies.accessToken;
    }

    //make sure token exists
    if(!token){
        return next(new ErrorResponse('Note authorize to access',401))
    }

    try {
        //verify token
        const decoded = await jwt.verify(token,process.env.ACCESS_TOKEN);

        console.log(decoded);

        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Ivalid Token',401))
    }
})

//grant access to specific roles
exports.authorize = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access`,403))
        }
        next();
    }
}