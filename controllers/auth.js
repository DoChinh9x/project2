const User = require('../models/user.model');
const RefreshToken =require('../models/RefreshToken.model');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const asyncHandler = require('../middlewares/async')
const ErrorResponse = require('../utils/errorResponse');
const { underline } = require('colors');
const jwt = require('jsonwebtoken');


//Register user
//POST api/v1/auth/register
//public

exports.register = asyncHandler(async(req,res,next)=>{  
    const {name,email,password,role} = req.body;
    const emailExist = await User.findOne({email: req.body.email});

    if(emailExist) return next(new ErrorResponse("Email is exist",400));

    //Creat user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    //Creat token
    const accessToken = user.getSignedJwtToken();

    res.status(200).json({success: true, accessToken});
});

//login user
//POST api/v1/auth/login
//public
exports.login = asyncHandler(async(req,res,next)=>{
    const {email, password} = req.body;

    //validate email & password
    if(!email||!password){
        return next(new ErrorResponse("Please provide an email and password",400))
    }

    //Check for user
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid email',401));
    }

    //check if password match
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        return next(new ErrorResponse('Invalid password',401));
    }
    sendTokenReponse(user,200,res);
});



//get current logged user
//GET api/v1/auth/me
//puclic
exports.getMe = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        data:user
    })

});

//get log user out/ clear cookie
//GET api/v1/auth/logout
//puclic
exports.logout = asyncHandler(async(req,res,next)=>{
    res.cookie('accessToken','none',{
        exprires: new Date(Date.now()+10*1000),
        httpOnly: true
    })
    // const refreshToken = await RefreshToken.find();
    // refreshToken.token = undefined;
    // await refreshToken.save();


    res.status(200).json({
        success:true,
    })

});

//update password
//GET api/v1/auth/updatepassword
//private
exports.updatePassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');

    //check current password
    if(!await user.matchPassword(req.body.currentPassword)){
        return next(new ErrorResponse('Password is incorrect',401));
    }
    user.password = req.body.newPassword;
    await user.save();

    sendTokenReponse(user,200,res);

})

//update user deatil
//GET api/v1/auth/updatedetails
//private
exports.updateDetails1 = asyncHandler(async(req,res,next)=>{
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success:true,
        data:user
    })

})

//reset password
//GET api/v1/auth/resetpassword/:resettoken
//public
exports.resetPassword = asyncHandler(async(req,res,next)=>{
    //Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');
    
    const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorResponse('Invalid token',400));
    }

    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenReponse(user,200,res);
})

//forgot password
//GET api/v1/auth/forgot
//public
exports.forgotPassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email',404));
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    //creat reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email. please PUT request to :\n\n ${resetUrl}`;

    try {
        await sendEmail({
            email:user.email,
            subject: 'Password reset token',
            message
        });
        res.status(200).json({success: true, data:"Email sent"});
    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire= undefined;
        await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email can not be send',500))
    }

    res.status(200).json({
        success:true,
        data:user
    })

})

//Get token from model, creat cookie and send reponse
const sendTokenReponse = async(user, statusCode, res) =>{
    const accessToken = user.getSignedJwtToken();
    let refreshToken = await RefreshToken.createToken(user);
    const options ={
        expires : new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    res
        .status(statusCode)
        .cookie('accessToken', accessToken,options)
        .json({
            success: true,
            accessToken,
            refreshToken
        });

};

//refreshtoken
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }
    try {
      let refreshToken = await RefreshToken.findOne({ token: requestToken });
      if (!refreshToken) {
        res.status(403).json({ message: "Refresh token is not in database!" });
        return;
      }
      if (RefreshToken.verifyExpiration(refreshToken)) {
        RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
        
        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
      let newAccessToken = jwt.sign({ id: refreshToken.user._id }, process.env.ACCESS_TOKEN, {
        expiresIn: process.env.JWT_COOKIE_EXPIRE,
      });
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: refreshToken.token,
      });
    } catch (err) {
      return res.status(500).send({ success:false });
    }
});