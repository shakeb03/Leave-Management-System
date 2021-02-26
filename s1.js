const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const axios = require('axios');

var MClient = require('mongodb').MongoClient;
const { response } = require('express');
var url = "mongodb://localhost:5000/";
//database connectivity
MClient.connect(url, function(err, db) {
    if (err) throw err;
    global.dbo = db.db("Login"); //global dbobject var 
})


//login get req at port
app.get('/', function(req, res) {
    console.log("login file loaded and sent");
    res.sendFile(__dirname + "/" + "login_p.html");
})




//login form post req
app.post("/Main_p", urlencodedParser, async(req, res) => {
    var username = req.body.username;
    global.user = username;
    const pwd = req.body.password;
    //admin login
    if (username == "admin") {
        try {
            const un_v = await dbo.collection("admin_login").findOne({ username });

            if (un_v.password === pwd) {
                dbo.collection("leave_requests").find({}).toArray(function(err, result) {
                    if (err) throw err;
                    res.render('admin_page.ejs', { leave_da: result });
                    console.log("Logged in as Admin");

                });


            } else {
                console.log("invalid password");
                res.render("invalid password");
            }
        } catch (error) {
            console.log("catched error in admin login");
        }
    } else {

        //normal user login
        try {
            const un_v = await dbo.collection("login_ids").findOne({ username });

            if (un_v.password === pwd) {

                res.render('mainpage.ejs', { user_name_t: username });
            } else {
                console.log("invalid password");
                res.render("invalid password ");
            }
        } catch (error) {
            console.log("catched error");

        }
    }

})

//to show the status of leaves
app.get("/getstatus", urlencodedParser, async(req, res) => {
    var Username = user;
    var rem_leaves = await dbo.collection("leaves").findOne({ Username });
    dbo.collection("leave_requests").find({ username: Username }).toArray(function(err, result) {
        if (err) throw err;
        res.render('leave_status.ejs', { prev_leaves: result, rem_leave: rem_leaves });
    })
})

//new req button from main_p.html to register.html
app.post('/request', urlencodedParser, function(req, res) {
    res.render('reg.ejs');
})


//add data from request form to database
app.post('/registered', urlencodedParser, async(req, res) => {
    leave_data = {
        username: req.body.name,
        category: req.body.category,
        date: req.body.start_date,
        duration: req.body.No_of_Days,
        additional_info: req.body.addinf
    };
    dbo.collection("leave_requests").insertOne(leave_data, function(err, result) {
        if (err) throw err;
    });
    try {
        const leave_dta_db = await dbo.collection("leaves").findOne({ Username: leave_data.username });

        const dur = leave_data.duration;



        //If casual leave
        if (leave_data.category == "Casual Leave") {
            leave_dta_db.Casual = leave_dta_db.Casual - dur;
            var query = { Username: leave_data.username }
            var new_data = { $set: { Username: leave_data.username, Casual: leave_dta_db.Casual, Medical: leave_dta_db.Medical, Earned: leave_dta_db.Earned } }
            dbo.collection("leaves").updateOne(query, new_data, function(err, res) {
                if (err) {
                    console.log("error in new data entry");
                }
            });

        }
        //If medical leave
        if (leave_data.category == "Medical Leave") {
            leave_dta_db.Medical = leave_dta_db.Medical - dur;
            var query = { Username: leave_data.username }
            var new_data = { $set: { Username: leave_data.username, Casual: leave_dta_db.Casual, Medical: leave_dta_db.Medical, Earned: leave_dta_db.Earned } }
            dbo.collection("leaves").updateOne(query, new_data, function(err, res) {
                if (err) {
                    console.log("error in new data entry");
                }
            });

        }
        //If Earned leave
        if (leave_data.category == "Earned Leave") {
            leave_dta_db.Earned = leave_dta_db.Earned - dur;
            var query = { Username: leave_data.username }
            var new_data = { $set: { Username: leave_data.username, Casual: leave_dta_db.Casual, Medical: leave_dta_db.Medical, Earned: leave_dta_db.Earned } }
            dbo.collection("leaves").updateOne(query, new_data, function(err, res) {
                if (err) {
                    console.log("error in new data entry");
                }
            });

        }


    } catch (err) {
        console.log("error in leave data extraction/operation");
    }


})



//server listening port
app.listen(8001, function(req, res) {
    console.log("server listning");
})