var express = require('express');
var router = express.Router();
let inventoryController = require('../controllers/inventories');

router.get('/', async function (req, res, next) {
    try {
        let inventories = await inventoryController.GetAllInventories();
        res.send(inventories);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

router.get('/:productId', async function (req, res, next) {
    try {
        const inventory = await inventoryController.GetInventoryByProductId(req.params.productId);
        if (inventory) {
            res.send(inventory);
        } else {
            res.status(404).send({ message: "Không tìm thấy kho cho sản phẩm này" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})
router.post('/increase-stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        const updatedInventory = await inventoryController.IncreaseStock(product, quantity);
        if (updatedInventory) {
            res.send(updatedInventory);
        } else {
            res.status(404).send({ message: "Product not found in inventory" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }

})
router.post('/decrease-stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        const updatedInventory = await inventoryController.DecreaseStock(product, quantity);
        if (updatedInventory) {
            res.send(updatedInventory);
        } else {
            res.status(404).send({ message: "Product not found in inventory" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }

})
module.exports = router;