var express = require('express');
let slugify = require('slugify')
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler.js'); // Assuming authHandler exists
let productController = require('../controllers/products');
let productModel = require('../schemas/products');
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
    let result = await productModel.find({ _id: req.params.id, isDeleted: false });
    if (result.length > 0) {
      res.send(result)
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
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
    let id = req.params.id;
    let updatedItem = await productModel.findById(id);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    for (const key of Object.keys(req.body)) {
      updatedItem[key] = req.body[key];
    }
    await updatedItem.save();

    res.send(updatedItem);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) { // Added auth
  try {
    let updatedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    res.send(updatedItem);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})
module.exports = router;
