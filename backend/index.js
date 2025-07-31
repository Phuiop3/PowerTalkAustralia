
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

require('dotenv').config()
console.log(process.env)
//import * as dotenv from 'dotenv'

//if(process.env.NODE_ENV === 'development') {
//  dotenv.config({ path: `.env.${process.env.NODE_ENV}`, debug: true });
//}


const app = express();
app.use(cors());
app.use(express.json());

const server = process.env.DB_SERVER;


// Azure SQL config
const config = {
  server,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: +process.env.PORT,
  options: {
    encrypt: true // For Azure SQL
  }
};

/*
flexible mysql
const mysql = require('mysql2');
const fs = require('fs');

var config =
{
    host: 'your_server_name.mysql.database.azure.com',
    user: 'your_admin_name',
    password: 'your_admin_password',
    database: 'quickstartdb',
    port: 3306,
    ssl: {ca: fs.readFileSync("your_path_to_ca_cert_file_DigiCertGlobalRootCA.crt.pem")}
};

const conn = new mysql.createConnection(config);
*/

app.use(cors({
  origin: ['http://localhost:8081', 'exp://192.168.1.100:8081'], // Add all your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If using cookies/auth
}));

const pool = new sql.ConnectionPool(config);
//const poolConnect = pool.connect();

async function testConnection() {
  try {
    let pool = await sql.connect(config);
    console.log('Connected to Azure SQL Database!');
    return pool;
    //pool.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to Azure SQL Database');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    throw err;
  });


// Test endpoint
app.post("/users/register", async (req, res) => {
  const { user_id, website_login, password } = req.body;
  const request = await pool.request();

 request.input('member_id, website_login, password')

  const loginQuery =
    "INSERT INTO Member_Logins (user_id, website_login, password) VALUES (?, ?, ?)";
  db.query(loginQuery, [user_id, website_login, password], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User Added Successfully" });
  });
});

//Adds a new member to the members table.
app.post("/users/newMember", async (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  const { user_id, first_name, last_name, email } = req.body;
  var join_date = yyyy + "-" + mm + "-" + dd;

  const memberQuery =
    "INSERT INTO members (user_id, first_name, last_name, email, join_date, guest, paid) VALUES (?, ?, ?, ?, ?, TRUE, FALSE)";
  db.query(
    memberQuery,
    [user_id, first_name, last_name, email, join_date],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      return res.status(200).json({ message: "Member Added" });
    }
  );
});
//Checks how many members have joined in the past month. Used to determine a new members sequential number.
app.post("/users/checkMonthlyMembers", (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  const monthlyMembersQuery =
    "SELECT * FROM members WHERE join_date between '" +
    yyyy +
    "-" +
    mm +
    "-" +
    "01' and '" +
    yyyy +
    "-" +
    mm +
    "-" +
    dd +
    "'";
  db.query(monthlyMembersQuery, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res
      .status(200)
      .json({ monthlyMembers: result.length + 1, message: "Query Successful" });
  });
});
//Checks if the requested userID is already in the members table.
app.post("/users/checkIDExists", (req, res) => {
  const { user_id } = req.body;

  const idExistsQuery = "SELECT * FROM members WHERE user_id = ?";
  db.query(idExistsQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    if (result.length > 0) {
      return res
        .status(200)
        .json({ exists: true, message: "Query Successful. ID already Exists" });
    } else {
      return res
        .status(200)
        .json({ exists: false, message: "Query Successful. ID Unique" });
    }
  });
});
app.get("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const db = pool.request();
  const Query = "SELECT * FROM members WHERE user_id = ?";
  db.query(Query, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    if (result.length > 0) {
      const user = result[0];

      res.json(user);
    }
  });
});
app.post("/users/login", async (req, res) => {
  try{
    const { website_login, password } = req.body;
  const pool = await poolPromise;
  // SQL query with placeholders for Email and Password

  const result = await pool.request()
      .input('login', sql.NVarChar, website_login)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT member_id, website_login 
        FROM Member_login 
        WHERE website_login = @login AND password = @password
      `);
      console.log(result);
    if (result.recordset.length > 0) {
      res.json({
        user_id: result.recordset[0].member_id,
        website_login: result.recordset[0].website_login,
        //password: user.password,
        message: "Login successful",
      });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  }
  catch (err){
    console.error("Database error:", err);
    return res.status(500).json({ message: "Database Error" });
  }
  
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));