const express = require("express");
const cors = require('cors');
const exp = require("constants");
const mysql = require('mysql');
const { connect } = require("http2");
const port = 5000;
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const CryptoJS = require('crypto-js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

//const upload = multer({dest: 'uploads/'});
const storagePath = "C:/xampp/htdocs/Proiect/uploads";//Fisier de stocat fisier incarcate

app.use(express.json());
app.use(cors());

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(sessions({
    secret:"thisismysecretkey",
    saveUninitialized:true,
    cookie: {maxAge: 1000 * 60 * 60 }, //o ora
    resave: false
}));

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, storagePath);  // Specify the directory where you want to store the uploaded files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);  // Use the original file name for storing the uploaded file
    }
});

// Create an instance of the multer middleware with the specified storage configuration
const upload = multer({ storage:  storage });


var con = mysql.createConnection({
    host:"localhost",
    user:"ioana",
    password:"abcdef",
    database:"convertor_db"

});
con.connect(function(err){
    if(err){
        console.log("EROARE: "+err);
    }else{
        console.log("Connected to the MYSQL databse!");
    }
});


app.post('/register', (req, res) => {
   
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    // Check if the email already exists in the database
    var emailCheckSql = `SELECT COUNT(*) AS count FROM accounts WHERE email = '${email}'`;

    con.query(emailCheckSql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        var count = result[0].count;

        if (count > 0) {
            // Email already exists, return an appropriate response
            res.status(409).send('Email already exists');
        } else {
            // Email doesn't exist, proceed with the registration process
            var sql = `INSERT INTO accounts (name, email, password) VALUES ('${name}','${email}','${password}')`;

            con.query(sql, function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                console.log('Registration successful');
                res.sendStatus(200);
            });
        }
    });
});

app.post('/login', (req, res) => {
    
    var email = req.body['login-email'];
    var password = req.body['login-password'];
    
    var hashedPassword = CryptoJS.SHA256(password).toString();
    password = hashedPassword;
   
    var pass = `SELECT password FROM accounts WHERE email = '${email}' AND EXISTS (SELECT 1 FROM accounts WHERE email = '${email}');`;
   
    con.query(pass,function(err,result){
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        else if (result[0] == null)
        {
            console.error("Invalid Email");
            res.status(499).send("Invalid Email.")

        }
        else if(result[0].password == password)
        {
            console.error("Connection success.");
            //req.session.userid = email;
            console.log(req.session)

            res.status(200).send("Connection success.");
        }else{
            console.error("Wrong password.");
            res.status(502).send('Wrong password.');
        }
    });
});

app.post('/forgot',(req,res)=>{
    
    var email = req.body['f_email'];
    var password = req.body['f_password'];
    var hashedPassword = CryptoJS.SHA256(password).toString();
    password = hashedPassword;
    var emailCheckSql = `SELECT COUNT(*) AS count FROM accounts WHERE email = '${email}'`;
    con.query(emailCheckSql, function (err, result){
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        var count = result[0].count;
        if (count == 0)
        {
            res.status(409).send('No account with this email.');
        }
        else{
            var sql = `UPDATE accounts SET password = '${password}' WHERE email = '${email}'`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log('Update successful');
                res.sendStatus(200);
            });
        }

    }); 
});

app.post('/guest',(req,res)=>{
    //req.session.userid = "guest";
    res.status(200).send("Connection success.");
});

app.post('/upload',upload.single('file'),(req,res)=>{

    const file = req.file;
    const email = req.body.email;
    var id=0;
   
    const sql_id = `SELECT id FROM accounts WHERE email = '${email}'`;
    con.query(sql_id, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            //return;
        }
        else{
            id = result[0].id;
            const {originalname, size, filename} = file;
            const filePath = path.join(storagePath,filename);
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            const sql = `INSERT INTO files (client_id,name, size, content) VALUES (?,?,?,?)`;
            con.query(sql,[id,filename,size,fileContent],function(err,result){
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else {   
                    console.log("Files inserted.");
                    res.status(200).send('Success.');
                }
            });
        }
    });   
});

app.get('/files/:userId',(req,res)=>{

    const userId = req.params.userId;
    let id = 0;
    const sql_id = `SELECT id FROM accounts WHERE email = '${userId}'`;
    con.query(sql_id, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            //return;
        }else{
            
            id = result[0].id;
            con.query(`SELECT name, size FROM files WHERE client_id = ${id} AND converted_file IS NULL;`,(err,results)=>{
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    //return;
                }else {
                    // Send the file information as JSON response
                    res.json(results);
                }
        
            });
        }
    });

   
});

app.delete('/delete-file/:email',(req,res)=>{
    const email = req.params.email;
    let id = 0;
    const sql_id = `SELECT id FROM accounts WHERE email = '${email}'`;
    con.query(sql_id, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            //return;
        }
        else{
            id = result[0].id;
            con.query(`DELETE FROM files WHERE client_id = ${id} ORDER BY id ASC LIMIT 1;`);
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                //return;
            }else {
                // Send the file information as JSON response
                res.status(200).send('Document deleted.');
            }
        }
    });
});

app.post('/convert',(req,res)=>{
    email = req.body.email;
    console.log(email);
    const fileLocation = 'C:/xampp/htdocs/Proiect/converted/converted.dwg';
    const fileData = fs.readFileSync(fileLocation);


    let id = 0;
    const sql_id = `SELECT id FROM accounts WHERE email = '${email}'`;
    con.query(sql_id, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            //return;
        }
        else{
            id = result[0].id;

            const sql = `UPDATE files SET converted_file = ?, conv_name = 'converted.dwg', conv_size = ${fileData.length}
            WHERE client_id = ${id} AND converted_file IS NULL LIMIT 1;`;
           
            con.query(sql,[fileData],function(err,result){
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    //return;
                }else {
                    // Send the file information as JSON response            
                    res.status(200).send('Document converted.');
                }
            })
        }
    });
});

app.get('/mydocs/:email',(req,res)=>{
   
    let id = 0;
    const sql_id = `SELECT id FROM accounts WHERE email = '${req.params.email}'`;
    con.query(sql_id, function (err, result) {
        if(err)
        {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            id = result[0].id;
            con.query(`SELECT name, conv_name, size FROM files WHERE client_id = ${id};`,(err,results)=>{
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    //return;
                }else {
                    // Send the file information as JSON response
                    res.json(results);
                }
            });
           
        }
    })
});
app.get('/users',(req,res) =>{

    const sql = "SELECT name, email FROM accounts";
    con.query(sql, function (err, result){
        if(err)
        {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
        else {
            // Send the file information as JSON response
            res.json(result);
        }
    })
});
app.get('/no_users',(req,res)=>{

    const sql = `SELECT COUNT(*) AS count FROM accounts;`;
    con.query(sql, function (err, result) {
        if(err)
        {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            res.json(result);
        }
    })
});

app.delete('/del_account',(req,res)=>{
    console.log(req.params)
    const sql =  `DELETE FROM accounts WHERE email = '${req.params.email}';`;
    con.query(sql, function (err, result) {
        if(err)
        {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            res.status(200).send('User deleted.');
        }
    })

});


app.listen(port, ()=>{
    console.log('Server running on port 5000');
});

