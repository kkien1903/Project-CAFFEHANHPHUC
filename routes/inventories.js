var express = require('express');
var router = express.Router();
let inventoryController = require('../controllers/inventories');
let inventoryModel = require('../schemas/inventories');

router.get('/', async function (req, res, next) {
    try {
        let inventories = await inventoryModel.find({})
            .populate({
                path: 'product',
                select: 'title price'
            });
        res.send(inventories);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

router.get('/:productId', async function (req, res, next) {
    try {
        // Using find to be consistent with users.js which returns an array
        const inventories = await inventoryModel.find({ product: req.params.productId }).populate('product');
        if (inventories.length > 0) {
            res.send(inventories);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
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