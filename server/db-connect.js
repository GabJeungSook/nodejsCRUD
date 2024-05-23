const mysql = require('mysql2');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to database');
});


class DBServices {
    static getDBServiceInstance() {
        return instance ? instance : new DBServices();
    }

    async getAllCustomerNames() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id, CONCAT(first_name, ' ', last_name) as 'name' FROM customers;";
                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async getAllProducts() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id, product_name FROM products;";
                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async getCustomerData(id)
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id, company, city FROM customers WHERE id = ?;";
                db.query(query, [id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    
    async getCustomerOrderData(id)
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT od.product_id AS pid, p.product_code AS pc, p.product_name AS pn, od.quantity AS q, od.unit_price AS up, od.discount AS d FROM order_details od INNER JOIN products p ON od.product_id = p.id WHERE od.order_id = ?";
                db.query(query, [id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async getProductData(id)
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id, product_code, list_price FROM products WHERE id = ?;";
                db.query(query, [id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async getLatestOrder()
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT MAX(id) AS maxOrderId FROM orders";
                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async getCustomerOrder(id)
    {
        try {
            const response = await new Promise((resolve, reject) => {
                
                const query = "SELECT o.customer_id AS cid, c.company AS com, c.city as city, o.ship_city AS sc, o.order_date AS od, o.shipped_date AS sd, CONCAT(c.first_name, ' ', c.last_name) AS name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.id = ?;";
                db.query(query, [id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error)
        {
            console.log(error);
        }
    }

    async insertCustomerOrder({custId, custName, custComp, custCity, orderId, orderDate, shipDate, shipCountry, shipCity, products})
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO orders (customer_id, ship_name, order_date, shipped_date, ship_address, ship_city) VALUES (?, ?, ?, ?, ?, ?);";
                db.query(query, [custId, custName, orderDate, shipDate, shipCountry, shipCity], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            const response2 = await new Promise((resolve, reject) => {
                const query2 = `INSERT INTO order_details (order_id, product_id, quantity, unit_price, discount) VALUES ${products.map((p)=>{
                    return `(${orderId},${p.product_id},${p.product_quantity},${p.price},${p.discount})`
                })}`;
                db.query(query2, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            return {response, response2};
        } catch (error)
        {
            console.log(error);
        }


    }

}

module.exports = DBServices;