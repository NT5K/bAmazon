# bAmazon
### A command line Amazon like storefront / manager
##### Requirements: <br>
```npm```<br>
```git```<br>
``` a command line prompt ```<br>
```MySQL or a SQL database manager```<br>
```node.js```<br><br>

Clone this repo into new folder: <br>
```https://github.com/NT5K/bAmazon.git```<br><br>

Open a command promp, navigate to repo folder, type:<br>
``` npm install ```<br>
This installs: `mysql` `chalk` `inquirer` `cli-table3` <br><br>

Copy contents of `bAmazonSeed.sql` file into your database manager and create the database<br><br>

Import database content using `bamazonData.csv` file<br><br>

Open your cmd, navigate to repo folder and run: <br>
``` node bamazonManager.js```


#### There are 5 options to choose from:

1. Display all products: <br>
<img src="/gifs/viewall.gif" width=450px><br>

2. Display products with a quantity less than 20 units: <br>
<img src="/gifs/lessthan20.gif" width=450px><br>

3. Add inventory to a product: <br>
<img src="/gifs/addunits.gif" width=450px><br>

4. Add new product to database: <br>
<img src="/gifs/addnewproduct.gif" width=450px><br>

5. Exit Program: <br>
<img src="/gifs/exitprogram.gif" width=450px><br>
