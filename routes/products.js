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
    res.status(500).send({ message: error.message });
  }
});
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productController.GetProductById(req.params.id);
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({ message: "ID not found" });
    }
  } catch (error) {
    res.status(400).send({ message: "ID không hợp lệ" });
  }
})

router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) { // Added auth
  let session = await mongoose.startSession()
  session.startTransaction()
  try {
    // stock is hardcoded to 100 for now, can be passed in req.body
    const newProduct = await productController.CreateProduct(req.body, 100, session);
    await session.commitTransaction();
    res.send(newProduct);
  } catch (error) {
    session.abortTransaction();
    res.status(400).send(error.message)
  } finally {
    session.endSession();
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let result = await productController.UpdateProduct(req.params.id, req.body);
    if (!result) return res.status(404).send({ message: "ID not found" });
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) { // Added auth
  try {
    let result = await productController.DeleteProduct(req.params.id);
    if (!result) return res.status(404).send({ message: "ID not found" });
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})
module.exports = router;
