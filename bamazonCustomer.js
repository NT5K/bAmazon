
const connection = require('./connection');
const inquirer = require('inquirer')
const Table = require('cli-table3')

    var displayProducts = function () {
        var query = "Select * FROM products";
        connection.query(query, function (err, res) {
            if (err) throw err;
            var displayTable = new Table({
                head: ["ID", "Product Name", "Category", "Price", "Quantity"],
                colWidths: [8, 55, 15, 8, 8]
            });
            for (var i = 0; i < res.length; i++) {
                displayTable.push([
                    res[i].id, 
                    res[i].product_name, 
                    res[i].department_name, 
                    res[i].price, 
                    res[i].stock_quantity]
                );
            }
            console.log(displayTable.toString());
            purchasePrompt()
        });
    }
// console.log(res.affectedRows) returns how many rows were effected so if it is either successful
//      or not, it shows that something has been done
function purchasePrompt() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the ID of the product they would like to buy?",
                name: "id",
                filter: Number
            },
            {
                type: "input",
                message: "How much product did you want to purchase?",
                name: "quantity",
                filter: Number
            }
        ]).then(function (answers) {
            var quantityNeeded = answers.quantity;
            var itemId = answers.id;
            if (isNaN(quantityNeeded) || isNaN(itemId)) {
                console.log("error, input is not a number")
                displayProducts()
            } else {
                purchaseOrder(itemId, quantityNeeded);
            }
        });
};

function purchaseOrder(id, amount) {
    connection.query('Select * FROM products WHERE id = ' + id, function (err, res) {
        const result = res[0]
        // CATCH ERROR

        if (err) { 
            console.log(err) 
        };
        
        if (amount <= result.stock_quantity) {
        
            var totalCost = result.price * amount;
        
            console.log("There are at least " + amount + " of these in stock!");
            console.log("Your total cost for " + amount + " " + result.product_name + " is " + totalCost + ", database has been updated!");

            connection.query("UPDATE products SET stock_quantity = stock_quantity - " + amount + " WHERE id = " + id);
        } else {
            console.log("Insufficient quantity, sorry we do not have enough " + result.product_name + "'s to complete your order.");
        };
        displayProducts();
    });
};

displayProducts();
