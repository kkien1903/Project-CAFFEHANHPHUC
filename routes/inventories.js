var express = require('express');
var router = express.Router();
let inventoryController = require('../controllers/inventories');
const { checkLogin, checkRole } = require('../utils/authHandler');

// ADMIN and MODERATOR can view all inventories
router.get('/', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let inventories = await inventoryController.GetAllInventories();
        res.send(inventories);
    } catch (error) {
        next(error);
    }
})

// Public or logged-in users can see a specific product's inventory
router.get('/:productId', async function (req, res, next) {
    try {
        const inventory = await inventoryController.GetInventoryByProductId(req.params.productId);
        if (inventory) {
            res.send(inventory);
        } else {
            res.status(404).send({ message: "Không tìm thấy sản phẩm trong kho." });
        }
    } catch (error) {
        next(error);
    }
})

// ADMIN and MODERATOR can increase stock
router.post('/increase-stock', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        const updatedInventory = await inventoryController.IncreaseStock(product, quantity);
        if (updatedInventory) {
            res.send(updatedInventory);
        } else {
            res.status(404).send({ message: "Không tìm thấy sản phẩm trong kho." });
        }
    } catch (error) {
        next(error);
    }
})

// ADMIN and MODERATOR can decrease stock
router.post('/decrease-stock', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        const updatedInventory = await inventoryController.DecreaseStock(product, quantity);
        if (updatedInventory) {
            res.send(updatedInventory);
        } else {
            res.status(404).send({ message: "Không tìm thấy sản phẩm trong kho." });
        }
    } catch (error) {
        next(error);
    }
})
module.exports = router;