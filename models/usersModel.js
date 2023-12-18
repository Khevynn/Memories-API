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
                return { status: 404, msg: "User not found!" }

            let isPass = bcrypt.compare(password, users[0].usr_pass);

            if (!isPass)
                return { status: 401, msg: "Incorrect password!" }

            return { status: 200, msg: "Successfuly Logged-in!" }
        } catch (err) {
            return { status: 500, msg: err }
        }
    }

    static async Register(user) {
        try {
            let [users] = await pool.query(`select * from user where usr_name = ?`, [user.username]);

            if (users.length > 0)
                return { status: 404, msg: "User already exists!" }

            let encpass = await bcrypt.hash(user.password, 10);

            await pool.query(`Insert into user (usr_name, usr_pass, usr_current_pet)
                values (?,?,0)`, [user.username, encpass]);
            return { status: 200, msg: "Registered! You can now log in." };
        } catch (err) {
            return { status: 500, msg: err }
        }
    }
}

module.exports = User;