const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db-connect');
const DBServices = require('./db-connect');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//read
app.get('/getNames', (request, response) => {
    const db = DBServices.getDBServiceInstance();

    const result = db.getAllCustomerNames();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

app.get('/getProducts', (request, response) => {
    const db = DBServices.getDBServiceInstance();

    const result = db.getAllProducts();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

//get data
app.get('/getCustomer/:id', (request, response) => {
    const {id} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getCustomerData(id);
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

//get order details
app.get('/getOrderDetails/:id', (request, response) => {
    const {id} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getCustomerOrderData(id);
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

app.get('/getProductData/:id', (request, response) => {
    const {id} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getProductData(id);
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

//get latest order id 
app.get('/getLatestOrder', (request, response) => {
    const {id} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getLatestOrder();
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

//get orders
app.get('/getOrder/:id', (request, response) => {
    const {id} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getCustomerOrder(id);
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

//insert order
app.post('/insertCustomerOrder', (request, response) => {

    const db = DBServices.getDBServiceInstance();
    const result = db.insertCustomerOrder(request.body);

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
})

//get orders
app.get('/getOrders', (request, response) => {
    const db = DBServices.getDBServiceInstance();

    const result = db.getAllOrders();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});
//get orders by date
app.get('/getOrdersByDate/:from_date/:to_date', (request, response) => {
    const {from_date, to_date} = request.params;
    const db = DBServices.getDBServiceInstance();
    const result = db.getOrdersByDate(from_date, to_date);
    
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));