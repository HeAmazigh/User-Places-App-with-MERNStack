const MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017/mongo";

const createProduct = async (req, res, next) => {
    const newProduct = {
        name: req.body.name,
        price: req.body.price
    }

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db();
        const result = db.collection('products').insertOne(newProduct);
    }catch(error){
        return res.json({messege:'data not inserted'})
    }
    client.close();

    res.json({product: newProduct});
}

const getProducts = async (req, res, next) => {
    const client = new MongoClient(url);
    let products;
    try{
        await client.connect();
        const db = client.db();
        products = await db.collection('products').find().toArray();
    }catch(error){
        return res.json({message: 'field'})
    }
    client.close();
    res.json({products});
}

exports.createProduct = createProduct; 
exports.getProducts = getProducts;