var express = require("express");
var router = express.Router();
let { uploadImage, uploadExcel } = require('../utils/uploadHandler')
let path = require('path')
let excelJS = require('exceljs')
let fs = require('fs');
let productModel = require('../schemas/products')
let categoryModel = require('../schemas/categories') // Import category model
let InventoryModel = require('../schemas/inventories')
let mongoose = require('mongoose')
let slugify = require('slugify')

router.post('/single', uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        res.send(req.file.path)
    }
})
router.post('/multiple', uploadImage.array('files'), function (req, res, next) {
    if (!req.files) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        let data = req.body;
        console.log(data);
        let result = req.files.map(f => {
            return {
                filename: f.filename,
                path: f.path,
                size: f.size
            }
        })
        res.send(result)
    }
})
router.get('/:filename', function (req, res, next) {
    let fileName = req.params.filename;
    let pathFile = path.join(__dirname, '../uploads', fileName)
    res.sendFile(pathFile)

})

router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        //workbook->worksheet-row/column->cell
        let pathFile = path.join(__dirname, '../uploads', req.file.filename)
        let workbook = new excelJS.Workbook();
        await workbook.xlsx.readFile(pathFile);
        let worksheet = workbook.worksheets[0];
        // Fetch existing titles and SKUs for validation
        const existingProducts = await productModel.find({}).select('title sku');
        let existingTitles = new Set(existingProducts.map(p => p.title));
        let existingSkus = new Set(existingProducts.map(p => p.sku));
        let errors = [];
        let batchsize = 50;
        let maxcommit = Math.ceil((worksheet.rowCount - 1) / batchsize);
        for (let timeCommit = 0; timeCommit < maxcommit; timeCommit++) {
            let start = 2 + batchsize * timeCommit;
            let end = Math.min(start + batchsize - 1, worksheet.rowCount);
            let validProduct = []
            let session = await mongoose.startSession()
            session.startTransaction()
            try {
                let mapProductToStock = new Map()
                for (let index = start; index <= end; index++) {
                    let errorRow = [];
                    const row = worksheet.getRow(index)
                    let sku = row.getCell(1).value;
                    let title = row.getCell(2).value;
                    let categoryName = row.getCell(3).value; // Category name from Excel
                    let price = Number.parseInt(row.getCell(4).value);
                    let stock = Number.parseInt(row.getCell(5).value);
                    let beanType = row.getCell(6).value || 'Blend'; // New field
                    let roastLevel = row.getCell(7).value || 'Medium'; // New field
                    let origin = row.getCell(8).value || ''; // New field
                    let sizeOptions = row.getCell(9).value ? String(row.getCell(9).value).split(',').map(s => s.trim()) : []; // New field
                    let isAvailable = row.getCell(10).value === 'TRUE'; // New field

                    if (price < 0 || isNaN(price)) {
                        errorRow.push(`Dinh dang price chua dung: ${price}`);
                    }
                    if (stock < 0 || isNaN(stock)) {
                        errorRow.push(`Dinh dang stock chua dung: ${stock}`);
                    }
                    if (existingTitles.has(title)) {
                        errorRow.push(`Title da ton tai: ${title}`);
                    }
                    if (existingSkus.has(sku)) {
                        errorRow.push(`SKU da ton tai: ${sku}`);
                    }

                    let categoryId;
                    try {
                        const categoryDoc = await categoryModel.findOne({ name: categoryName });
                        if (!categoryDoc) {
                            errorRow.push(`Category '${categoryName}' khong ton tai.`);
                        } else {
                            categoryId = categoryDoc._id;
                        }
                    } catch (catErr) {
                        errorRow.push(`Loi khi tim category '${categoryName}': ${catErr.message}`);
                    }
                    if (errorRow.length > 0) {
                        errors.push({ row: index, messages: errorRow });
                        continue;
                    } else {
                        let newObj = new productModel({
                            sku: sku,
                            title: title,
                            slug: slugify(title, {
                                replacement: '-', remove: undefined,
                                locale: 'vi',
                                trim: true
                            }),
                            price: price,
                            description: title, // Assuming description is title for now
                            category: categoryId, // Use the found category ObjectId
                            beanType: beanType,
                            roastLevel: roastLevel,
                            origin: origin,
                            sizeOptions: sizeOptions,
                            isAvailable: isAvailable
                        })
                        mapProductToStock.set(sku, stock);
                        validProduct.push(newObj)
                    }
                }
                listProduct = await productModel.insertMany(validProduct, { session })
                let validInventory = listProduct.map(function (e) {
                    return {
                        product: e._id,
                        stock: mapProductToStock.get(e.sku)
                    }
                })
                await InventoryModel.insertMany(validInventory, { session })
                await session.commitTransaction();
                await session.endSession()
            } catch (error) {
                await session.abortTransaction();
                await session.endSession()
                errors.push({ row: `Batch starting at ${start}`, messages: [`Loi trong transaction: ${error.message}`] });
            }

        }
        if (errors.length > 0) {
            res.status(400).send({ message: "Co loi khi import excel", errors: errors });
        } else {
            res.send({ message: "Import excel thanh cong" });
        }
        fs.unlinkSync(pathFile);

    }
})


module.exports = router;