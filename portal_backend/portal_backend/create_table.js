const pool= require("./db");
const bcrypt = require("bcrypt");                   // for using next level hashing and salting
const saltRounds = 6;

const create_table= async (name)=>{
    const result=  await pool.query(`CREATE TABLE IF NOT EXISTS`+name+`(StudentID SERIAL PRIMARY KEY, name varchar(50), email varchar(100) UNIQUE, college varchar(100), password varchar(255))`);
}

module.exports= {create_table};