const express = require('express');
const bodyParser = require('body-parser');
const pool= require("./db");
const bcrypt = require("bcrypt");                   // for using next level hashing and salting
const saltRounds = 6;

//-------------------modules---------------------------
const route = require('./route.js');

const app=express();

app.use(bodyParser.urlencoded({
  extended: true
}));

//------------------------------------------  get requests ---------------------------------------------------



//------------------------------------------  post requests --------------------------------------------------
app.post("/signup",async(req,res)=>{
    try{
        const username = req.body.name;
        var password = req.body.password;
        var repassword = req.body.repassword;
        const email= req.body.email;

        if(repassword==password){
            const result = await pool.query(
                'insert into agents(username,email,password) values ($1,$2,$3)',
                [username,email,password]
            );
            res.redirect("/search");
        }
        else{
            console.log("restype password not match");
            res.redirect("/signup");
        }

    }
    catch(err){
        console.log(err);
    }
});

app.post("/login",async(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;
    try{
        const result = await pool.query(
            'select * from agents as a where a.email=$1',
            [email]                
        );

        if(result.rows[0].password===password){
            res.redirect("/search");
        }
        else{
            console.log("wrong password");
            res.redirect("/login");
        }
        
    }
    catch(err){
        console.log(err);
    }
});

app.post("/admin",async(req,res)=>{
    var trainNO = req.body.number;
    var doj = req.body.doj;
    var sl = req.body.slCoach;
    var sl_berths = sl*72;
    var ac = req.body.acCoach;
    var ac_berths = ac*64;
    var tableName = doj.substring(0,4)+doj.substring(5,7)+doj.substring(8,11)+trainNO;
    try{
        const result = await pool.query(
            'INSERT INTO admin (TrainNO,DOJ,NO_SL,NO_AC) VALUES ($1,$2,$3,$4)',
            [trainNO,doj,sl,ac]
        )

        const temp = await pool.query(
            `CREATE TABLE _`+tableName+`(Available_ac INTEGER,Available_sl INTEGER)`,
        )
        
        const temp1 = await pool.query(
            `insert into _`+tableName+`(Available_ac,Available_sl) values ($1,$2)`,
            [ac_berths,sl_berths]
        )
        res.redirect("/admin");

    }
    catch(err){
        console.log(err);
    }
    // console.log(number,doj,sl,ac)
});

app.post("/book/:no/:date",async(req,res)=>{
    var trainNO = req.params.no;
    var doj = req.params.date;
    var tableName = doj.substring(0,4)+doj.substring(5,7)+doj.substring(8,11)+trainNO;
    console.log(tableName);
    // console.log(doj+trainNO);
    var name = req.body.name;
    var age = req.body.age;
    var gender = req.body.gender;
    var coach = req.body.coach;
    try{
        const result = await pool.query(
            `select * from _`+tableName+``,
        )

        var temp,temp1,temp2;

        temp = await pool.query(
            `select * from admin where trainno=$1 and doj=$2`,
            [trainNO,doj]
        )


        if(coach=="AC"){
            var available_ac = result.rows[0].available_ac;
            console.log(available_ac);
            
            if(available_ac>0){
                temp1 = await pool.query(
                    `CREATE TABLE IF NOT EXISTS _`+tableName+`_Active( PNR VARCHAR(17) UNIQUE, name VARCHAR(100), age INTEGER, gender VARCHAR(7), coach_type VARCHAR(3), coach_number VARCHAR(3), berth_number INTEGER, berth_type VARCHAR(3))`
                )

                var pnr = tableName + Math.floor(1000 + Math.random() * 9000);
                
                // console.log(pnr);
                var i = available_ac/64;
                var j = Math.floor(available_ac/64);
                var coach_number;
                if(available_ac===temp.rows[0].no_ac*64){
                    coach_number = 'A1';
                }
                else{
                    if(j-i!==0){
                        coach_number = 'A' + (temp.rows[0].no_ac-j);
                    }
                    else{
                        coach_number = 'A' + (temp.rows[0].no_ac-j+1);
                    }
                }

                var berth_number;
                if(available_ac%64===0){
                    berth_number= available_ac%64 +1;
                }
                else{
                    berth_number= 64-available_ac%64+1;
                }
                var berth_type;
                if(berth_number%8===1 && berth_number%8===4){
                    berth_type="LB";
                }
                else if(berth_number%8===2 && berth_number===5){
                    berth_type="MB";
                }
                else if(berth_number%8===3 && berth_number%8===6){
                    berth_type="UB";
                }
                else if(berth_number%8===7){
                    berth_type="SLB";
                }
                else{
                    berth_type="SUB";
                }
                

                temp1 = await pool.query(
                    `insert into _`+tableName+`_Active (PNR,name,age,gender,coach_type,coach_number,berth_number,berth_type) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [pnr,name,age,gender,"AC",coach_number,berth_number,berth_type]
                )

                available_ac-=1;
                temp1 = await pool.query(
                    `UPDATE _`+tableName+` set available_ac=$1`,
                    [available_ac]
                )

                console.log(available_ac);
            }
            else{
                console.log("NO sheats available");
            }
        }
        else{
            var available_sl = result.rows[0].available_sl;
            console.log(available_sl);
            if(available_sl>0){
                temp1 = await pool.query(
                    `CREATE TABLE IF NOT EXISTS _`+tableName+`_Active( PNR VARCHAR(17) UNIQUE, name VARCHAR(100), age INTEGER, gender VARCHAR(7), coach_type VARCHAR(3), coach_number VARCHAR(3), berth_number INTEGER, berth_type VARCHAR(3))`
                )

                var pnr = tableName + Math.floor(1000 + Math.random() * 9000);
                
                // console.log(pnr);
                var i = available_sl/72;
                var j = Math.floor(available_sl/72);
                var coach_number;
                if(available_sl===temp.rows[0].no_sl*72){
                    coach_number = 'S1';
                }
                else{
                    if(j-i!==0){
                        coach_number = 'S' + (temp.rows[0].no_sl-j);
                    }
                    else{
                        coach_number = 'S' + (temp.rows[0].no_sl-j+1);
                    }
                }

                var berth_number;
                if(available_sl%72===0){
                    berth_number= available_sl%72 +1;
                }
                else{
                    berth_number= 72-available_sl%72+1;
                }
                var berth_type;
                if(berth_number%8===1 && berth_number%8===4){
                    berth_type="LB";
                }
                else if(berth_number%8===2 && berth_number===5){
                    berth_type="MB";
                }
                else if(berth_number%8===3 && berth_number%8===6){
                    berth_type="UB";
                }
                else if(berth_number%8===7){
                    berth_type="SLB";
                }
                else{
                    berth_type="SUB";
                }
                

                temp1 = await pool.query(
                    `insert into _`+tableName+`_Active (PNR,name,age,gender,coach_type,coach_number,berth_number,berth_type) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [pnr,name,age,gender,"SL",coach_number,berth_number,berth_type]
                )

                available_sl-=1;
                temp1 = await pool.query(
                    `UPDATE _`+tableName+` set available_sl=$1`,
                    [available_sl]
                )

                console.log(available_sl);
            }
            else{
                console.log("NO sheats available");
            }
        }
        res.send("<h1> Booked successfull</h1>");
    }
    catch(err){
        console.log(err);
    }
});


//-------------------------------------------------------------------------------------------------------------
const PORT = 5000 || process.env.PORT;

app.listen(PORT,function(){
    console.log("server is running on "+PORT);
});
