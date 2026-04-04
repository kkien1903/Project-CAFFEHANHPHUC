var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let roleController = require('../controllers/roles');
let jwt = require('jsonwebtoken')
let bcrypt = require('bcrypt')
let { checkLogin } = require('../utils/authHandler.js')
let { changePasswordValidator, validateResult, resetPasswordValidator } = require('../utils/validatorHandler')
let crypto = require('crypto')
let mailHandler = require('../utils/sendMailHandler')
let cartModel = require('../schemas/cart');
const mongoose = require('mongoose');

/* GET home page. */
//localhost:3000
router.post('/register', async function (req, res, next) {
    try {
        const userRole = await roleController.FindRoleByName("USER");
        if (!userRole) {
            throw new Error("Không tìm thấy vai trò người dùng mặc định.");
        }
        let newUser = await userController.CreateAnUser({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            role: userRole._id // Use the found role ID
        });

        // Create a cart for the new user
        await new cartModel({ user: newUser._id }).save();
        res.send({ message: "Đăng kí thành công" });
    } catch (error) {
        next(error);
    }
});
router.post('/login', async function (req, res, next) {
    let result = await userController.QueryByUserNameAndPassword(
        req.body.username, req.body.password
    )
    if (result) {
        let token = jwt.sign({
            id: result.id
        }, process.env.JWT_SECRET || 'your_jwt_secret', { // Use environment variable
            expiresIn: '1h'
        })
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        });
        res.send(token)
    } else {
        res.status(404).send({ message: "sai THONG TIN DANG NHAP" })
    }

});
router.get('/me', checkLogin, async function (req, res, next) {
    console.log(req.userId);
    let getUser = await userController.FindUserById(req.userId);
    res.send(getUser);
})
router.post('/logout', checkLogin, function (req, res, next) {
    res.cookie('token', null, {
        maxAge: 0,
        httpOnly: true
    })
    res.send("da logout ")
})
router.post('/changepassword', checkLogin, changePasswordValidator, validateResult, async function (req, res, next) {
    try {
        const { oldpassword, newpassword } = req.body;
        const user = await userController.FindUserById(req.userId);
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (isMatch) {
            user.password = newpassword;
            await user.save();
            res.send("password da duoc thay doi");
        } else {
            res.status(400).send({ message: "old password sai" });
        }
    } catch (error) {
        next(error);
    }
})
router.post('/forgotpassword', async function (req, res, next) {
    let email = req.body.email;
    let user = await userController.FindUserByEmail(email);
    if (!user) {
        res.status(404).send({
            message: "email khong ton tai"
        })
        return;
    }
    user.forgotPasswordToken = crypto.randomBytes(21).toString('hex'); // Changed to camelCase
    user.forgotPasswordTokenExp = new Date(Date.now() + 10 * 60 * 1000); // Changed to camelCase
    await user.save();
    let URL = 'http://localhost:3000/api/v1/auth/resetpassword/'+ user.forgotPasswordToken; // Sử dụng tên trường mới
    mailHandler.sendMail(user.email,URL);
    res.send("check mail")
})
router.post('/resetpassword/:token',resetPasswordValidator,validateResult, async function (req, res, next) {
    let password = req.body.password;
    let token =req.params.token;
    let user = await userController.FindUserByToken(token);
    if(!user){
        res.status(404).send("token reset password sai");
        return;
    }
    user.password = password;
    user.forgotPasswordToken = null; // Sử dụng tên trường mới
    user.forgotPasswordTokenExp = null; // Sử dụng tên trường mới
    await user.save()
    res.send("update password thanh cong")

})






module.exports = router;
