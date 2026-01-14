const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');

const express = require('express');
const app = express();

const path = require('path');
const methodOverride = require('method-override');

const uuid = require('uuid');
const uuidv4 = uuid.v4;

const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '/views'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'app',
    password: 'Sankalp@2225' 
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];
}

app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
}) 

//Home Route
app.get('/', (req, res) => {
    let q = "SELECT count(*) FROM user";
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", {count});
        })
    } catch {
        res.send("some error occurred in database");
    }
})

//Show Route
app.get('/user', (req, res) => {
    let q = "SELECT * FROM user";
    try {
        connection.query(q, (err, result) =>{
            if(err) throw err;
            let data = result;
            res.render("users.ejs", {data});
        })
    } catch {
        res.send("There was some error");
    }
})

//Edit Route
app.get('/user/:id/edit', (req, res) => {
    let { id } = req.params;
    try {
        let q = `SELECT * FROM user WHERE id = ?`;
        connection.query(q, [id], (err, data) => {
            if(err) throw err;
            let user = data[0];
            res.render("edit.ejs", {user});
        })
    } catch {
        res.send("Some error occurred in database");
    }
})

//Update Route 
app.patch('/user/:id', (req, res) => {
    const {id} = req.params;
    const {username: newUsername, password: formPassword} = req.body;
    let q = "SELECT * FROM user WHERE id = ?";
    
    connection.query(q, [id], (err, result) => {
        if(err) {
            res.status(500).send("Database error");
        }
        let data = result[0];
        if(data.password == formPassword) {
            let q = "UPDATE user SET username = ? WHERE id = ?";
            connection.query(q, [newUsername, id], (err, result) => {
                if(err) {
                    res.status(500).send("Database error");
                }
                res.redirect('/user');
            })
        } else {
            res.send("wrong password");
        }
    })
})

//Delete Route
app.get('/user/:id/delete', (req, res) => {
    let {id} = req.params;
    let q = "SELECT * FROM user WHERE id = ?";
    connection.query(q, [id], (err, data) => {
        if(err) {
            res.status(500).send("Some error in Database");
        }
        let user = data[0];
        res.render("deleteForm.ejs", {user});
    } )
})

app.delete('/user/:id', (req, res) => {
    let {id} = req.params;
    let {pass: formPassword} = req.body;
    let q = "SELECT * FROM user WHERE id = ?";
    connection.query(q, [id], (err, data) => {
        if(err) {
            res.status(500).send("Some error in Database");
        }
        let user = data[0];
        if(user.password != formPassword) {
            res.send("Wrong password");
        }
        else {
            let q2 = "DELETE FROM user WHERE id = ?";
            connection.query(q2, [id], (err, result) => {
                if(err) {
                    res.status(500).send("Some error in Database");
                }
                res.redirect('/user');
            }) 
        }
    })
})

//Add Route 
app.get('/user/new', (req, res) => {
    res.render("newForm.ejs");
})

app.post('/user', (req, res) => {
    let {username, email, password} = req.body;
    let id = uuidv4();
    let user = [id, username, email, password];

    let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
    connection.query(q, user, (err, result) => {
        if(err) {
            res.status(500).send("some error in Database");
        }
        res.redirect('/user');
    })
})

// connection.end();

