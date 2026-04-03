var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/categories');

/* GET categories listing. */
router.get('/', async function (req, res, next) {
  let categories = await categoryModel.find({ isDeleted: false });
  res.send(categories);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await categoryModel.find({ _id: req.params.id, isDeleted: false });
    if (result.length > 0) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newItem = new categoryModel({
      name: req.body.name,
      description: req.body.description
    });
    await newItem.save();
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await categoryModel.findByIdAndUpdate(
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
