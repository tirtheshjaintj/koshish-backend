const Category = require("../models/category.model");
const asyncHandler = require("express-async-handler");

const create = asyncHandler(async function (req, res) {
    const { name } = req.body;
    try {
        const categoryExists = await Category.findOne({ name });
        console.log(categoryExists);
        if (categoryExists) return res.status(500).json({ status: false, message: "Category Already Present" });
        const category = await Category.create({ name });
        return res.status(200).json({ status: true, message: "Category Created", data: category });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    return res.status(200).json({ status: true, message: "Category Found", data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
    const { category_id } = req.params;
    const category = await Category.find({ category_id });
    if (!category) return res.status(404).json({ status: false, message: "Category Not Found" });
    return res.status(200).json({ status: true, message: "Category Found", data: category });
});

module.exports = { create, getCategories, getCategory };

