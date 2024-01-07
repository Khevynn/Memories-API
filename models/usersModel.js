const bcrypt = require('bcrypt');
const pool = require("../config/database");

class User {
    constructor(id, username, password, active_pet, fruits) {
        this.id = id;
        this.name = username;
        this.password = password;
        this.active_pet = active_pet;
        this.fruits = fruits;
    }

    static async Login(username, password) {
        try {
            let [users] = await pool.query(`select * from user where usr_name = ?`, [username]);

            if (!users.length)
                return { status: 404, data: {msg: "User not found!"} }

            let isPass = await bcrypt.compare(password, users[0].usr_pass);
            if (!isPass)
                return { status: 401, data: {msg: "Incorrect password!"} }

            return { status: 200, data: {msg: "Successfuly Logged-in!", user_id: users[0].usr_id} }
        } catch (err) {
            return { status: 500, data: {msg: err} }
        }
    }

    static async Register(user) {
        try {
            let [users] = await pool.query(`select * from user where usr_name = ?`, [user.username]);

            if (users.length > 0)
                return { status: 404, data: {msg: "User already exists!"} }

            let encpass = await bcrypt.hash(user.password, 10);

            await pool.query(`Insert into user (usr_name, usr_pass, usr_current_pet)
                values (?,?,0)`, [user.username, encpass]);
            return { status: 200, data: {msg: "Registered! You can now log in." }};
        } catch (err) {
            return { status: 500, data: {msg: err} }
        }
    }

    static async GetUserInfo(user_id){
        try {
            let [rows] = await pool.query("Select * From user Where usr_id = ?", [user_id]);
            if(!rows.length) return {status : 404 ,data:{ msg: "No User Found" }};

            let user = new User();
            user.id = rows[0].usr_id;
            user.name = rows[0].usr_name;
            user.active_pet = rows[0].usr_current_pet;
            user.fruits = rows[0].usr_fruits;

            return {status : 200 ,data: user }
        }catch(err){
            console.log(err);
            return{status: 500, data: { msg: err }}
        }
    }

    static async AddFruits(user_id){
        try {
            let [rows] = await pool.query("update user set usr_fruits = usr_fruits + 1 where usr_id = ?", [user_id])
            return {status : 200 ,data: { msg: "Successfully added!" } }
        }catch(err){
            console.log(err);
            return{status: 500, data: { msg: err }}
        }
    }
}

module.exports = User;