let productModel = require('../schemas/products');
let inventoryModel = require('../schemas/inventories');
let slugify = require('slugify');

module.exports = {
    GetAllProducts: async function (query) {
        const { title, maxPrice, minPrice, limit = 10, page = 1, category, origin, ingredients } = query;

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
        if (origin) filter.origin = origin;
        if (ingredients) {
            // Lọc các sản phẩm chứa tất cả thành phần được chỉ định
            filter.ingredients = { $all: ingredients.split(',') };
        }

        return await productModel.find(filter)
            .populate('category')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
    },
    GetProductById: async function (id) {
        return await productModel.findOne({ _id: id, isDeleted: false }).populate('category');
    },
    CreateProduct: async function (productData, stock) {
        const productToSave = {
            ...productData,
            slug: slugify(productData.title, {
                replacement: '-', remove: undefined,
                locale: 'vi',
                trim: true
            })
        };

        const newProduct = new productModel(productToSave);
        const savedProduct = await newProduct.save();

        const newInventory = new inventoryModel({
            product: savedProduct._id,
            stock: stock
        });
        await newInventory.save();

        return savedProduct;
    },
    UpdateProduct: async function (id, productData) {
        if (productData.title) {
            productData.slug = slugify(productData.title, {
                replacement: '-', remove: undefined,
                locale: 'vi',
                trim: true
            });
        }
        return await productModel.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
    },
    DeleteProduct: async function (id) {
        // Soft delete
        return await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
};