var express = require('express');
let slugify = require('slugify')
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler.js'); // Assuming authHandler exists
let modelProduct = require('../schemas/products')
let modelInventory = require('../schemas/inventories');
const { default: mongoose } = require('mongoose');


/* GET users listing. */
//localhost:3000/api/v1
router.get('/', async function (req, res, next) {
  let queries = req.query;
  const { title, maxPrice, minPrice, limit = 10, page = 1, category, beanType, roastLevel, origin } = queries;

  let filter = { isDeleted: false };

  if (title) {
    filter.title = { $regex: title, $options: 'i' };
  }
  if (minPrice) {
    filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
  }
  if (category) {
    filter.category = category;
  }
  if (beanType) filter.beanType = beanType;
  if (roastLevel) filter.roastLevel = roastLevel;
  if (origin) filter.origin = origin;

  const products = await modelProduct.find(filter)
    .populate('category') // Populate category details
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  res.send(products);
});
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findById(id)
    if (result && (!result.isDeleted)) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "ID not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID not found"
    })
  }
})

router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) { // Added auth
  let session = await mongoose.startSession()
  let transaction = session.startTransaction()
  try {
    let newObj = new modelProduct({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-', remove: undefined,
        locale: 'vi', trim: true
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      beanType: req.body.beanType,
      roastLevel: req.body.roastLevel,
      origin: req.body.origin,
      sizeOptions: req.body.sizeOptions,
      isAvailable: req.body.isAvailable,
      images: req.body.images
    })
    let newProduct = await newObj.save({session});
    let newInv = new modelInventory({
      product: newProduct._id,
      stock: 100
    })
    newInv = await newInv.save({session})
    await session.commitTransaction();
    session.endSession()
    res.send(newObj)
  } catch (error) {
    session.abortTransaction();
     session.endSession()
    res.status(400).send(error.message)
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findByIdAndUpdate(
      id,
      { ...req.body, isDeleted: false },
      {
        new: true,
        runValidators: true
      }
    )
    if (!result) return res.status(404).send({ message: "ID not found" });
    res.send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID not found"
    })
  }
})
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) { // Added auth
  try {
    let id = req.params.id;
    let result = await modelProduct.findByIdAndUpdate(
      id, {
      isDeleted: true
    }, {
      new: true
    }
    )
    if (!result) return res.status(404).send({ message: "ID not found" });
    res.send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID not found"
    })
  }
})
module.exports = router;
