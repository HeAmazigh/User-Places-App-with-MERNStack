const mongoose = require('mongoose');

const Product = require('./models/products');

mongoose.connect('mongodb://localhost:27017/mongo').then( ()=> {
    console.log('Connected Successfull');
}).catch(()=>{
    console.log('Connection field');
});

const createProduct = async (req, res, next) => {
    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price
    });

    const result = await newProduct.save();

    res.json(result);
}

const getProducts = async (req, res, next) => {
    const products = await Product.find().exec();
    res.json(products);
}

exports.createProduct = createProduct;
exports.getProducts = getProducts;