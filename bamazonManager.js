
// requirements for app to run
const inquirer = require('inquirer')
const Table = require('cli-table3')
const chalk = require('chalk');
// connection to database
const connection = require('./connection');

//displays table function
function showTable(res) {
    // table outline
    var displayTable = new Table({
        head: ["ID", "Product Name", "Category", "Price", "Quantity"],
        colWidths: [8, 55, 15, 8, 8]
    });
    // loop for displaying table data into outline
    for (let i = 0; i < res.length; i++) {
        const r = res[i]
        displayTable.push([
            r.id,
            r.product_name,
            r.department_name,
            r.price,
            r.stock_quantity
        ]);
    }
    // display table
    console.log(displayTable.toString());
}

// function for catching errors, passing data to the showTable function, reshowing questions 
function catchErrorShowTableAskQuestions(err, res) {
    // catch error
    if (err) {
        throw err
    };
    // show table using query data
    showTable(res)
    //reshow questions
    questionPrompt()
}

// show all products function
function displayProducts() {
    // query for database
    const query = "Select * FROM products";
    // query the products database
    connection.query(query, function (err, res) {
        // run this function to catch errors and display table
        catchErrorShowTableAskQuestions(err, res)
    });
}

// returns last item id number in the tables id column
function returnMaxItemIdLength() {
    // query for database
    const query = "SELECT * FROM products ORDER BY id DESC LIMIT 1";
    // query the products database
    connection.query(query, function (err, res) {
        // catch errors
        if (err) {
            throw err
        }
        // console.log("max length of item id's", res[0].id)
        return Number(res[0].id)
    })
}

// display products without auto reshow questions
function displayProductsNoQuestions() {
    // query for database
    const query = "Select * FROM products";
    // query the products database
    connection.query(query, function (err, res) {
        // run this function to catch errors and display table
        // catch error
        if (err) throw err;
        // show table using query data
        showTable(res)
    });
}

// display products with low inventory (<= 20 units)
function lowInventory() {
    var query = "Select * FROM products WHERE stock_quantity <= 20";
    connection.query(query, function (err, res) {
        console.log("\nThese products have a supply quantity of less than 20 units")
        // run this function to catch errors and display table
        catchErrorShowTableAskQuestions(err, res)
    })
}

// add new product to database function
function addNewProduct(name, department, price, quantity) {
    // query for inserting new row into database

    const insert = "INSERT INTO products SET ?"
    const items = [
        {
            product_name: name,
            department_name: department,
            price: price,
            stock_quantity: quantity
        }]

    // query the database
    connection.query(insert, items, function (err) {
        console.log(insert)
        // catch error
        if (err) {
            throw err
        };
        // display this string
        console.log((chalk.bold.green("\nCongratulations!")) + "You have added " + name + "\n to the " + department + " department!\n")
    })
    // query for selecting last item in the database
    const lastRow = "SELECT * FROM products ORDER BY id DESC LIMIT 1;";
    // query the products database
    connection.query(lastRow, function (err, res) {
        // run this function to catch errors and display last item, ask questions again
        catchErrorShowTableAskQuestions(err, res)
    });
}

// add new product to table function
function newProductQuestions() {
    // questions with outputs for query 
    inquirer.prompt([
        {
            type: "list",
            name: "department",
            message: "\nWhat Category would you like to add this product to?",
            choices: [
                "Toys & Games",
                "Electronics",
                "Womens Clothing",
                "Mens Clothing",
                "Appliances",
                "Housewares",
                "Food and Beverages",
                "Others"
            ]
        },
        {
            type: "input",
            message: "\nWhat is the name of the product you would like to add?",
            name: "name",
            filter: String
        },
        {
            type: "input",
            message: "\nWhat is the price of the new product?",
            name: "price",
            filter: Number
        },
        {
            type: "input",
            message: "\nHow many units of the product do you have in stock?",
            name: "quantity",
            filter: Number
        }

    ]).then(function (answers) {

        const a = answers
        // checks for if statements
        const nanPrice = isNaN(a.price)
        const nanQuant = isNaN(a.quantity)
        if (nanPrice && nanQuant)  {
            console.log(chalk.bold.redBright("the price and quantity are not a valid input"))
            questionPrompt()
        } else if (nanQuant) {
            console.log(chalk.bold.redBright("The quantity you provided is not a valid input"))
            questionPrompt()
            
        } else if (nanPrice) {
            console.log(chalk.bold.redBright("The price you provided is not a valid input"))
            questionPrompt()
        } else {
            // pass inputs to addNewProduct function if they pass validations
            addNewProduct(a.name, a.department, a.price, a.quantity)
        }
        });
}

// displays database without question, then question is displayed with a setTimeOut()
function setTimeOutAddInventoryQuestions() {
    // display products with no questions
    displayProductsNoQuestions()
    // questions with timeout attached
    addToInventory()
}

// adds to inventory with inputs from questions function
function addToInventory() {
    // set time out so table displays first
    setTimeout(function () {
        //questions for adding inventory
        inquirer.prompt([
            {
                type: "input",
                name: "product",
                message: "Select the item number to add more to inventory??"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many items would like to add to inventory??"
            }
        ]).then(function (answer) {

            // **
            //  NOTE: Cannot figure out how to catch error when input number is greater than table length
            //        attempts on line 221, 239-241
            // **
    
            // store answers in reusable variables
            const itemId = answer.product
            const quantity = answer.quantity
            //if input is not a number or max id is greater than id number input
            if (isNaN(itemId) || isNaN(quantity) || Number(itemId) > returnMaxItemIdLength()){  //NEED ERROR FOR (id.length)
                    console.log("Invalid Input")
                    questionPrompt()
                }
            // })
            // query for selecting the column to update
            const columnQuery = "SELECT * FROM products WHERE id = ?"
            // query database using ID from input
            connection.query(columnQuery, [itemId], function (err, res) {
                // catch any errors
                if (err) {
                    throw err
                }

                /* once we know what row to update we query the database again 
                    and add quantity to the response from previous query */

                    //error attempt
                    if (res[0].stock_quantity > itemId) {
                        console.log("error id not found")
                    }
                
                const updateQuantity = res[0].stock_quantity + parseFloat(quantity);
                const updateQuery = "update products set ? where ?"
                const updateObject = [
                    {
                        stock_quantity: updateQuantity
                    },
                    {
                        id: itemId
                    }
                ]
                connection.query(updateQuery, updateObject, function (err) {
                    // catch any errors
                    if (err) {
                        throw err
                    };
                    // console log message "Congratulations! You have added NUM units to item NUM's inventory!"
                    console.log((chalk.bold.green("\nCongratulations!")) + 
                                " You have added " + (chalk.bold.redBright(quantity)) + 
                                " units to item " + (chalk.bold.redBright(itemId)) + 
                                "'s inventory!\n")
                    // variable to query database again to display that new quantity was updated
                    const displayAddedInventory = "SELECT * FROM products WHERE id =" + itemId;
                    // query the products database again
                    connection.query(displayAddedInventory, function (err, res) {
                        // run this function to catch errors and display table, ask main menu questions again
                        catchErrorShowTableAskQuestions(err, res)
                    });
                });
            });                
        });
    // end set time out
    }, 500)
}

// exit program function
function exitTheProgram() {
    connection.end(function () {
        console.log("connection closed!")
    })
}

// questions to navigate through program function
function questionPrompt() {
    // reusable variables
    const allProducts = "View" + (chalk.green(' all ')) + "Products for " + (chalk.green('sale'));
    const lessThan20 = "View Products with" + (chalk.green(' inventory ')) + "lower than " + (chalk.red('20 units'));
    const addProduct = 'Add' + (chalk.green(" units ")) + 'to a products' + (chalk.green(" inventory"));
    const newProduct = "Add a " + (chalk.green('new product ')) + "to the " + (chalk.green('database'));
    const exitProgram = '***' + (chalk.bold.red(" Exit Program ")) + '***';
    const prompt = (chalk.bold.italic.underline.cyan("\nbAmazon Manager App\n")) + (chalk.yellow("What would you like to do?"))
    // questions with outputs for query 
    inquirer.prompt([
        {
            type: "list",
            name: "questions",
            message: prompt,
            choices: [
                allProducts,
                lessThan20,
                addProduct,
                newProduct,
                exitProgram
            ]
        }

        // depending on the input from questions, output a function
    ]).then(function (input) {
        switch (input.questions) {
            case allProducts:
                displayProducts()
                break;
            case lessThan20:
                lowInventory()
                break;
            case addProduct:
                setTimeOutAddInventoryQuestions()
                break;
            case newProduct:
                newProductQuestions();
                break;
            default:
                exitTheProgram()
                break;
        }
    });
};

// ** START PROGRAM **
// check if connected
connection.connect(function (error) {
    // catch error
    if (error) {
        console.error('error connecting :' + error.stack);
        return;
    }
    // show questions for the first time
    questionPrompt()
});