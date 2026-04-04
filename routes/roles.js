var express = require("express");
var router = express.Router();

let roleController = require("../controllers/roles");
let roleModel = require("../schemas/roles");
const { checkLogin, checkRole } = require("../utils/authHandler");

// Chỉ người đã đăng nhập mới có thể xem danh sách roles
router.get("/", checkLogin, async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.get("/:id", checkLogin, async function (req, res, next) {
    try {
        let result = await roleModel.find({ _id: req.params.id, isDeleted: false });
        if (result.length > 0) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// Chỉ ADMIN mới có thể tạo role
router.post("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let newItem = await roleController.CreateRole({
            name: req.body.name,
            description: req.body.description
        });
        res.send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// Chỉ ADMIN mới có thể cập nhật role
router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleModel.findById(id);
        if (!updatedItem) return res.status(404).send({ message: "id not found" });

        for (const key of Object.keys(req.body)) {
            updatedItem[key] = req.body[key];
        }
        await updatedItem.save();

        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// Chỉ ADMIN mới có thể xóa role
router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;