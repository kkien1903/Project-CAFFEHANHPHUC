var express = require('express');
let slugify = require('slugify')
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler.js'); // Assuming authHandler exists
let productController = require('../controllers/products');
const { default: mongoose } = require('mongoose');


/* GET users listing. */
//localhost:3000/api/v1
router.get('/', async function (req, res, next) {
  try {
    const products = await productController.GetAllProducts(req.query);
    res.send(products);
  } catch (error) {
    next(error);
  }
});
router.get('/:id', async function (req, res, next) {
  try {
    const result = await productController.GetProductById(req.params.id);
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    next(error);
  }
})

router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) { // Added auth
  try {
    // stock is hardcoded to 100 for now, can be passed in req.body
    const newProduct = await productController.CreateProduct(req.body, 100);
    res.send(newProduct);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    const updatedProduct = await productController.UpdateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedProduct);
  } catch (error) {
    next(error);
  }
})
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) { // Added auth
  try {
    let updatedItem = await productController.DeleteProduct(req.params.id);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    res.send(updatedItem);
  } catch (error) {
    next(error);
  }
})
module.exports = router;
