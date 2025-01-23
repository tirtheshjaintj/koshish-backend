const { Router } = require('express');
const { getCategories, getCategory } = require('../controllers/category.controller');

const router = Router();

router.get("/", getCategories);
router.get("/:category_id", getCategory);

module.exports = router;