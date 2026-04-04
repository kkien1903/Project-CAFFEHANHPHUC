let categoryModel = require('../schemas/categories');
let slugify = require('slugify');

module.exports = {
    GetAllCategories: async function () {
        return await categoryModel.find({ isDeleted: false });
    },
    GetCategoryById: async function (id) {
        return await categoryModel.findOne({ _id: id, isDeleted: false });
    },
    CreateCategory: async function (categoryData) {
        const newCategory = new categoryModel({
            ...categoryData,
            slug: slugify(categoryData.name, {
                replacement: '-', remove: undefined,
                locale: 'vi',
                trim: true
            })
        });
        return await newCategory.save();
    },
    UpdateCategory: async function (id, categoryData) {
        if (categoryData.name) {
            categoryData.slug = slugify(categoryData.name, {
                replacement: '-', remove: undefined,
                locale: 'vi',
                trim: true
            });
        }
        return await categoryModel.findByIdAndUpdate(id, categoryData, { new: true, runValidators: true });
    },
    DeleteCategory: async function (id) {
        return await categoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
};