var express = require('express');
var router = express.Router();
let categoryController = require('../controllers/categories');
const { checkLogin, checkRole } = require('../utils/authHandler');

/* GET categories listing. */
router.get('/', async function (req, res, next) {
  try {
    let categories = await categoryController.GetAllCategories();
    res.send(categories);
  } catch (error) {
    next(error);
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
    next(error);
  }
});

router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let newItem = await categoryController.CreateCategory(req.body);
    res.send(newItem);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let updatedItem = await categoryController.UpdateCategory(req.params.id, req.body);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    res.send(updatedItem);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let updatedItem = await categoryController.DeleteCategory(req.params.id);
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
