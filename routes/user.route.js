const express = require('express');
const advanceResults = require('../middlewares/advanceResults');
const User = require('../models/user.model');
const {getUsers,getUser,createUser,updateUser,deleteUser} = require('../controllers/user.controller');
const {protect,authorize} = require('../middlewares/auth');
const router = express.Router({mergeParams: true});

router.use(protect);
//router.use(authorize('admin'));

router.get('/',advanceResults(User),getUsers);
router.get('/:id',getUser);
router.put('/:id',protect,authorize('admin'),updateUser);
router.delete('/:id',protect,authorize('admin'),deleteUser);

module.exports = router;