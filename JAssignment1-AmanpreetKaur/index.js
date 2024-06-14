const express = require("express");
const path = require("path");//needed  for the file paths 
const dotenv = require("dotenv");
//load environment variables from the .env file
dotenv.config();
const { MongoClient, ObjectId } = require("mongodb");//get the mongodb class of objects so that we can create one 

//create a new MongoClient
// const dbUrl= "mongodb://localhost:27017/";
const dbUrl = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}/?retryWrites=true&w=majority&appName=Http5222`;
const client = new MongoClient(dbUrl);// creates the MongoClient Object


//creates an express application
const app = express();
const port = process.env.PORT || "8888";

//settings for express app
app.set("views", path.join(__dirname, "views"));//setting for "views" is set to path :  __dirname/views
app.set("view engine", "pug");

//convert query string format in form data  to JSON format
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set up a folder for static files
app.use(express.static(path.join(__dirname, "public")));
//set a page route 
app.get("/", async (request, response) => {
    let emps = await getEmployees();
    //response.status(200).send("Test");

    response.render("index", { title: "Home Test", employees: emps });

});
app.get("/about", async (request, response) => {

    //response.status(200).send("Test");

    response.render("about", { title: "About" });

});

app.get("/contact", async (request, response) => {

    //response.status(200).send("Test");

    response.render("contact", { title: "Contact" });

});


//page route  to  Employee Details
app.get("/detail", async (request, response) => {
    let id = request.query.empId;
    let emp = await getEmployee(id);
    response.render("detail", { title: "Employee", employee: emp });

});

// page  route to employee (Which is the admin page)
app.get("/employee", async (request, response) => {
    let emps = await getEmployees();
    console.log(emps);

    response.render("employee", { title: "Administer Employee", employees: emps });

});

// page  route to add employee 
app.get("/add", async (request, response) => {
    response.render("add", { title: "Add Employee" });

});

// page  route after the add employee form submission 
app.post("/add/submit", async (request, response) => {
    let Login = request.body.empLogin;
    let Name = request.body.empName;
    let Department = request.body.empDepartment;
    let Rating = request.body.empRating;
    if (Login == "" || Name == "" || Department == "" || Rating == "") {
        //  response indicating that the request was invalid
        response.status(400).send("All fields are required.");
    }
    else {
        let newemp = {
            "empLogin": Login,
            "empName": Name,
            "empDepartment": Department,
            "empRating": parseInt(Rating)
        }

        await AddEmployee(newemp);
        response.redirect("/employee");
    }


});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

//MongoDb Functions

//function to establish a connection to the database 
async function connection() {
    db = client.db("amazon");
    return db; // returns the database
}

//function to get the list of all employees fron the employees collection
async function getEmployees() {
    db = await connection();
    let results = db.collection("employees").find({});
    return await results.toArray(); // convert results to an array 
}

//function to get one employee from the employees collection
async function getEmployee(id) {
    db = await connection();
    const empId = { _id: new ObjectId(id) };
    let result = db.collection("employees").findOne(empId);
    return await result;
}

//function to add  an  employee to the employees collection
async function AddEmployee(emp) {
    db = await connection();
    let status = await db.collection("employees").insertOne(emp);
    console.log(" employee added");
}