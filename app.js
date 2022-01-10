const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const users = require('./data').userDB;
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://nagpalnitansh:<password>@cluster0.v6yvf.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var isLogin = 0;

const app = express();
const server = http.createServer(app);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./views')));



async function run() {
    try {
      await client.connect();
      console.log("connection succeed");
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
    }
  }

app.get('/',(req,res) => {
    if(isLogin){
        res.render("weather");
    }else{
        res.render("home");
    }
    res.render("home");
});

app.get('/weather',(req,res) => {
    if(isLogin){
        res.render("weather");
    }else{
        res.send("<a href='login'>Login First</a>");
    }
});


app.get('/logout',(req,res) => {
    if(isLogin){
        isLogin = 0;
        res.render("home");
    }
});

// Showing register form
app.get("/register", function (req, res) {
    if(isLogin){
        res.render('weather');
    }else{
        res.render("register");
    }
});

app.get("/login", function (req, res) {
    if(isLogin){
        res.render('weather');
    }else{
        res.render("login");
    }
});

app.post('/register', async (req, res) => {
    try{       
        const database = client.db('sample_mflix');
        const userData = database.collection('users_db');
        const query = { email: req.body.email};
        
        const foundUser = await userData.findOne(query);
       
       // let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
    
            let hashPassword = await bcrypt.hash(req.body.password, 10);
    
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
           await database.collection("users_db").insertOne(newUser, function(err, res) {
            if (err) throw err;
           
        });
            res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='login'>login</a></div><br><br><div align='center'><a href='register'>Register another user</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='register'>Register again</a></div>");
        }
    } catch{
        res.send("Internal server error");
    }
});

app.post('/login', async (req, res) => {
    try{
        const database = client.db('sample_mflix');
        const userData = database.collection('users_db');
        const query = { email: req.body.email};
        const foundUser = await userData.findOne(query);
       // let foundUser = users.find((data) => req.body.email === data.email);
        if (foundUser) {
    
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = foundUser.username;
                isLogin = 1;
               // res.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);
                res.render("weather");
            } else {
                res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='login'>login again</a></div>");
            }
        }
        else {
    
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='login'>login again<a><div>");
        }
    } catch{
        res.send("Internal server error");
    }
});


run().catch(console.dir);

server.listen(3000, function(){
    console.log("server is listening on port: 3000");
});