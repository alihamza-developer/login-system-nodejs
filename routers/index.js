import { Router } from 'express'
import { authenticate, verifyLogin } from '../middlewares/index.js'
const router = Router();

// Render Index File
router.get("/", [authenticate], (req, res) => {
    res.render('login');
});
// Register Page
router.get("/register", [verifyLogin], (req, res) => {
    res.render('register');
});
// Login Page
router.get("/login", [verifyLogin], (req, res) => {
    res.render('login');
});
// Forgot Page
router.get("/forgot", [verifyLogin], (req, res) => res.render('forgot'));

// Logout
router.get('/logout', [authenticate], (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.log(err)
            return next(err)
        }
        return res.redirect("../login");
    })
});

export default router;

