const express = require('express');
console.log("hello")
const jwt = require('jsonwebtoken');
const db = require('./dbconnection');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
// app.use(express.static(path.resolve(__dirname, '../client/public')));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
var username = null;
var token = null;

// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
// });

app.post("/login/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    username = req.body.username;
    const password = req.body.password;
    const sql = "select UserDetails.EmpID, UserCredential.SecretID, UserDetails.First_Name, UserDetails.Last_Name, UserCredential.UserName, UserCredential.Password, UserDetails.Designation, UserDetails.DOJ, DATEDIFF(CURDATE(), DOJ)/365 as Experience, UserDetails.Address, UserDetails.Zipcode, UserDetails.Is_Active, UserCredential.MobileNo from UserDetails inner join UserCredential on UserDetails.EmpID = UserCredential.EmpID where Is_Active = 1 and username =? and password =?";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            const id = result;
            token = jwt.sign({ id }, "jwtSecret");
            res.cookie('token', token, { httpOnly: true, maxAge: 600000 });
            res.send({
                token,
                result
            });
        }
    });
});

app.post("/my_info/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const sql = "select UserDetails.EmpID, UserDetails.First_Name, UserDetails.Last_Name,  DATEDIFF(CURDATE(), DOJ)/365 as Experience, UserDetails.Designation, UserDetails.DOJ, UserDetails.Address, UserDetails.Zipcode, UserCredential.MobileNo, UserDetails.Is_Active, UserDetails.Profile from UserDetails inner join UserCredential on UserDetails.EmpID = UserCredential.EmpID where Is_Active = 1 and username = ?";
    res.setHeader("Content-Type", "text/plain");
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
})

app.post("/dashboard/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const sql = "select UserDetails.EmpID, UserDetails.First_Name, UserDetails.Last_Name,  DATEDIFF(CURDATE(), DOJ)/365 as Experience, UserDetails.Designation, UserDetails.DOJ, UserDetails.Address, UserDetails.Zipcode, UserCredential.MobileNo, UserDetails.Is_Active, UserDetails.Profile from UserDetails inner join UserCredential on UserDetails.EmpID = UserCredential.EmpID where Is_Active = 1";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/show_attendance/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const empid = req.body.empid;
    const mode = req.body.mode;
    const datefrom = req.body.datefrom;
    const dateto = req.body.dateto;
    const sql = "select * from attendance_reports where EmpID = ? and mode = ? and date between ? and ?";
    db.query(sql, [empid, mode, datefrom, dateto], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/show_attendance_details/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const empid = req.body.empid;
    const date = req.body.date;
    const sql = "select * from attendance_reports where EmpID = ? and date = ?";
    db.query(sql, [empid, date], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/attendance/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const empid = req.body.empid;
    const empname = req.body.empname;
    const designation = req.body.designation;
    const date = req.body.date;
    const mode = req.body.mode;
    const sql = "insert into attendance_reports(EmpID, EmpName, Designation, Date, mode) values(?, ?, ?, ?, ?)";
    db.query(sql, [empid, empname, designation, date, mode], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/forget_psw/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const email = req.body.email;
    var mailOptions = {};
    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'my1stcompany2001@gmail.com',
            pass: 'yauifmhmgschtpwt'
        }
    });
    const sql = "select * from usercredential where Mail = ?"
    db.query(sql, [email], (err) => {
        if (err) {
            console.log(err);
        } else {
            mailOptions = {
                from: 'my1stcompany2001@gmail.com',
                to: email,
                subject: "OTP SEND BY COMPANY",
                html: "<h3>OTP FOR FORGET PASSWORD</h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
            };
        }
    });

    const sql1 = "update usercredential set OTP = ? where EmpID = 34"
    db.query(sql1, [otp], (err) => {
        if (err) {
            console.log(err);
        } else {
            transporter.sendMail(mailOptions, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    res.send(JSON.stringify(result));
                }
            });
        }

    });
});

app.post("/forget_psw/otp_generate/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const otp = req.body.otp;
    const sql = "select * from usercredential where OTP = ?";
    db.query(sql, [otp], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/forget_psw/change_psw/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const newpassword = req.body.newpassword;
    const sql = "update usercredential set Password = ? where empid =34";
    db.query(sql, [newpassword], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post("/add&show_employee/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const empid = req.body.empid;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const experience = req.body.experience;
    const designation = req.body.designation;
    const doj = req.body.doj;
    const dod = req.body.dod;
    const address = req.body.address;
    const zipcode = req.body.zipcode;
    const is_active = 1;
    const username = req.body.username;
    const password = req.body.password;
    const mobileno = req.body.mobileno;
    const otp = "NULL";
    const mail = "my1stcompany2001@gmail.com";
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'my1stcompany2001@gmail.com',
            pass: 'yauifmhmgschtpwt'
        }
    });
    const sql = "insert into userdetails(EmpID, First_Name, Last_Name, Experience, Designation, DOJ, DOD, Address, Zipcode, Is_Active) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const sql1 = "insert into usercredential(EmpID, UserName, Password, MobileNo, OTP, Mail) values(?, ?, ?, ?, ?, ?)";
    db.query(sql, [empid, firstname, lastname, experience, designation, doj, dod, address, zipcode, is_active], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });

    db.query(sql1, [empid, username, password, mobileno, otp, mail], (err) => {
        if (err) {
            console.log(err);
        } else {
            var mailOptions = {
                from: 'my1stcompany2001@gmail.com',
                to: mail,
                subject: "CREDENTIAL SEND BY COMPANY",
                html: "<h1>YOUR LOGIN CREDENTIAL</h1>" + "<h3 style='font-weight:bold;'> USERNAME : " + username + "<h3 style='font-weight:bold;'> PASSWORD : " + password + "</h3>" // html body
            };

            transporter.sendMail(mailOptions, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    res.send(JSON.stringify(result));
                }
            });
        }
    });
});

app.get("/:universalURL", (req, res) => {
    res.send("404 URL NOT FOUND");
});

app.post("/remove_employee/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const removeid = req.body.removeid;
    const active = 0;
    const date = req.body.date;
    const secretcode = req.body.secretcode;
    const adminpass = req.body.adminpass;
    const sql = "update UserCredential, userdetails set Is_Active = ?, DOD = ? where Is_Active = 1 and Userdetails.EmpID =? and SecretID =? and Password =?";
    db.query(sql, [active, date, removeid, secretcode, adminpass], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    })
});

app.post("/edit_employee/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const empid = req.body.empid;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const designation = req.body.designation;
    const address = req.body.address;
    const zipcode = req.body.zipcode;
    const mobileno = req.body.mobileno;
    const mail = "my1stcompany2001@gmail.com";
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'my1stcompany2001@gmail.com',
            pass: 'yauifmhmgschtpwt'
        }
    });
    const sql = "update userdetails set First_Name = ?, Last_Name = ?, Designation = ?, Address = ?, Zipcode = ? where empid =?";
    const sql1 = "update usercredential set MobileNo = ? where EmpID =?"
    db.query(sql, [firstname, lastname, designation, address, zipcode, empid], (err) => {
        if (err) {
            console.log(err);
        } else {
            db.query(sql1, [mobileno, empid], (err) => {
                var mailOptions = {
                    from: 'my1stcompany2001@gmail.com',
                    to: mail,
                    subject: "UPDATE YOUR PROFILE BY COMPANY",
                    html: "<h1>YOUR USER DATA</h1>" + "<h3 style='font-weight:bold;'> NOW YOUR EMPLOYEE NAME IS : </h3>" + "<h4 style='font-weight:bold; color:red;'>" + firstname + " " + lastname + "</h4>"
                        + "<h3 style='font-weight:bold;'> NOW YOUR DESIGNATION IS : </h3>" + "<h4 style='font-weight:bold; color:red;'>" + designation + "</h4>"
                        + "<h3 style='font-weight:bold;'> NOW YOUR ADDRESS AND ZIPCODE IS : </h3>" + "<h4 style='font-weight:bold; color:red;'>" + address + "-" + zipcode + "</h4>"
                        + "<h3 style='font-weight:bold;'> NOW YOUR MOBILE NUMBER IS : </h3>" + "<h4 style='font-weight:bold; color:red;'>" + mobileno + "</h4>"
                        + "<h3 style='font-weight:bold;'> More details please visit :</h3>" + "<h4 style='font-weight:bold; color:red;'>" + "http://localhost:3000/" + "</h4>"// html body
                };

                transporter.sendMail(mailOptions, function (error, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(JSON.stringify(result));
                    }
                });
            });
        }
    });
});

app.post("/find/", (req, res) => {
    res.setHeader('mysql', { "Content-Type": "text/plain" });
    const sql = "select UserDetails.EmpID, UserDetails.First_Name, UserDetails.Last_Name,  DATEDIFF(CURDATE(), DOJ)/365 as Experience, UserDetails.Designation, UserDetails.DOJ, UserDetails.Address, UserDetails.Zipcode, UserCredential.MobileNo, UserDetails.Is_Active, UserDetails.Profile from UserDetails inner join UserCredential on UserDetails.EmpID = UserCredential.EmpID";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));
