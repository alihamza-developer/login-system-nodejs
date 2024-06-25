import db from '../config/Database.js';

/*
    req.params: Get parameters from the URL
    res.send() : Send a response of various types 
    next() : Call the next middleware function in the stack
*/

// Authenticate User
function authenticate(req, res, next) {
    if (req.session.user_id) {
        let user = db.selectOne("users", "*", { id: req.session.user_id });
        if (!user) res.redirect("/login");
        req.user = user;
        res.locals.LOGGED_IN_USER = user;
        res.locals.IS_ADMIN = user.is_admin == 1 ? true : false;
        res.locals.LOGGED_IN_USER_ID = user.id;
        next();
    }
    else
        res.redirect("/login");

}
// Verify Login
function verifyLogin(req, res, next) {
    if (req.session.user_id) {
        res.redirect("/user/dashboard");
    } else
        next();
}

// IS Admin
function isAdmin(req, res, next) {
    let user = req.user;
    if (user.is_admin == 1)
        next();
    else
        res.redirect("/login");


}
export { authenticate, verifyLogin, isAdmin };