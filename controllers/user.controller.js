const User = require('../models/user.model');
const advanceResults = require('../middlewares/advanceResults');
const crypto = require('crypto');
const asyncHandler = require('../middlewares/async')
const ErrorResponse = require('../utils/errorResponse');

//get all users
//GET api/v1/auth/users
//public
exports.getUsers = asyncHandler(async(req,res,next)=>{  
    res.status(200).json(res.advanceResults);
});

//get user
//GET api/v1/auth/users/:id
//public
exports.getUser = asyncHandler(async(req,res,next)=>{  
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

//create user
//POST api/v1/auth/users
//private/admin
exports.createUser = asyncHandler(async(req,res,next)=>{  
    const user = await User.create(req.body);
    res.status(201).json({
        success: true,
        data: user
    });
});

//update user
//PUT api/v1/auth/users.:id
//private/admin
exports.updateUser = asyncHandler(async(req,res,next)=>{  
    const user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });
    res.status(20).json({
        success: true,
        data: user
    });
});

//delete user
//DE:ETE api/v1/auth/users.:id
//private/admin
exports.deleteUser = asyncHandler(async(req,res,next)=>{  
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
    });
});
