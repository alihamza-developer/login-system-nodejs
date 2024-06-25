import { Router } from 'express'
import db from "../config/Database.js";
import { success, error, passwordHash, passwordVerify } from '../utils/functions.js'
const router = Router();


// Register User In Database
router.post("/register", async (req, res) => {
    const { fname, lname, email, password, confirm_password } = req.body;
    let name = `${fname} ${lname}`;
    // Check if passwords are the same
    if (password !== confirm_password) return error("Passwords do not match", res);

    // Check if user exists
    let check = db.selectOne("users", 'email', { email });
    if (check) error("User already exists", res);
    let hash = await passwordHash(password);
    // Register user
    let addUser = db.insert('users', {
        'fname': fname,
        'lname': lname,
        'name': name,
        'email': email,
        'image': 'avatar.png',
        'password': hash,
        'verify_status': 0
    });
    if (addUser)
        return success("User registered successfully", res);
    return error("User not registered", res);

});

// Login User
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user = db.selectOne('users', "id,password", { email });
    if (!user) {
        error("User not exists", res);
        return false;
    }
    let hash_password = user.password;

    let verify = passwordVerify(password, hash_password);
    if (!verify) {
        error("Password is Wrong", res);
        return false;
    }

    // Set Session
    req.session.user_id = user.id;

    return success("User logged in successfully", res, {
        redirect: "user/dashboard"
    });

});

// Forgot Password
router.post("/forgot", async (req, res) => {
    const { email } = req.body;
    let user = db.selectOne('users', "id,password", { email });
    if (!user)
        return error("User not exists", res);
    // TODO:
});

export default router;
