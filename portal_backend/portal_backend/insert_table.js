const pool= require("./db");

const insert_table= async (name,id,username,email,password)=>{ 
    bcrypt.hash(password, saltRounds , async(err,hash)=>{
        try{
            const result=  await pool.query(
                "INSERT INTO "+name+"(StudentID,name,email,college,password) VALUES ($1,$2,$3,$4,$5) RETURNING *",
                [id,username,email,college,hash]
            );
        }
        catch(err)
        { console.error(err.message); }
    });

    return result;
}


module.exports= {insert_table};