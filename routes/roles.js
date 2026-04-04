var express = require("express");
var router = express.Router();

let roleController = require("../controllers/roles");
const { checkLogin, checkRole } = require("../utils/authHandler");

// Chỉ ADMIN mới có thể xem, tạo, sửa, xóa roles
router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let roles = await roleController.GetAllRoles();
        res.send(roles);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let result = await roleController.GetRoleById(req.params.id);
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        next(error);
    }
});

router.post("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let newItem = await roleController.CreateRole(req.body);
        res.send(newItem);
    } catch (err) {
        next(err);
    }
});

router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleController.UpdateRole(id, req.body);
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleController.DeleteRole(id);
        if (!updatedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(updatedItem);
    } catch (err) {
        next(err);
    }
});

module.exports = router;