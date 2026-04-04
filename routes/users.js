var express = require("express");
var router = express.Router();
let { postUserValidator, validateResult } = require('../utils/validatorHandler')
let userController = require('../controllers/users')
let cartModel = require('../schemas/cart');
let { checkLogin, checkRole } = require('../utils/authHandler.js')
const { default: mongoose } = require("mongoose");
//- Strong password

router.get("/", checkLogin,
  checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
    try {
      const users = await userController.GetAllUsers();
      res.send(users);
    } catch (error) {
      next(error);
    }
  });

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    const result = await userController.FindUserById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/",  postUserValidator, validateResult,
  async function (req, res, next) {
    try {
      let newItem = await userController.CreateAnUser({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        role: req.body.role
      })
      let newCart = new cartModel({
        user: newItem._id
      })
      let result = await newCart.save()
      result = await result.populate('user')
      res.send(result)
    } catch (err) {
      next(err);
    }
  });

router.put("/:id", checkLogin, async function (req, res, next) {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInUserId = req.userId;

    const loggedInUser = await userController.FindUserById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(401).send({ message: "Người dùng không hợp lệ." });
    }
    const loggedInUserRole = loggedInUser.role.name.toUpperCase();

    if (loggedInUserId !== userIdToUpdate && loggedInUserRole !== 'ADMIN') {
      return res.status(403).send({ message: "Bạn không có quyền cập nhật người dùng này." });
    }

    // Only admins can change roles
    if (loggedInUserRole !== 'ADMIN' && req.body.role) {
      delete req.body.role;
    }

    const updatedUser = await userController.UpdateUser(userIdToUpdate, req.body);

    if (!updatedUser) return res.status(404).send({ message: "id not found" });

    res.send(await updatedUser.populate('role'));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    const deletedUser = await userController.DeleteUser(req.params.id);
    if (!deletedUser) return res.status(404).send({ message: "id not found" });
    res.send(deletedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;