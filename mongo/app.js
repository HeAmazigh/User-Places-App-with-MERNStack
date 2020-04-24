const express = require('express');
const bodyParser = require('body-parser');
const Products = require('./mongoose');

const app = express();
app.use(bodyParser.json());

app.post('/products', Products.createProduct);
app.get('/products', Products.getProducts);

app.listen(5000);