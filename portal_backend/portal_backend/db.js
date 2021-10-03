const Pool= require("pg").Pool;
const env = require("dotenv");
env.config();

const pool= new Pool({
    user: `${process.env.USER}`,
    password: `${process.env.PASSWORD}`,
    database: "railwayDB",
    host: "localhost",
    port: 3000
});

module.exports= pool;