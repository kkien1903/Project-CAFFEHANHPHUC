var express = require('express');
var router = express.Router();
let categoryController = require('../controllers/categories');

/* GET categories listing. */
router.get('/', async function (req, res, next) {
  try {
    let categories = await categoryController.GetAllCategories();
    res.send(categories);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await categoryController.GetCategoryById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(400).send({ message: "ID không hợp lệ" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newItem = await categoryController.CreateCategory(req.body);
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    let updatedItem = await categoryController.UpdateCategory(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "ID không hợp lệ hoặc có lỗi" });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let updatedItem = await categoryController.DeleteCategory(req.params.id);
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "ID không hợp lệ hoặc có lỗi" });
  }
});
module.exports = router;
