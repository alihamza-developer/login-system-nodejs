import express from 'express';
import http from 'http';
import index from './routers/index.js'
import _delete from './routers/delete.js'
import authorize from './routers/authorize.js'
import userControllers from './routers/user/controller.js'
import adminControllers from './routers/admin/controller.js'
import admin from './routers/admin/index.js'
import user from './routers/user/index.js'
import dotenv from 'dotenv';
import bodyParser from "body-parser"
import cookieParser from 'cookie-parser';
import sessions from 'express-session';
import { SITE_NAME } from './utils/config.js';
import { svgIcon } from './utils/functions.js';

// main directory
const app = express(),
    server = http.createServer(app);

dotenv.config();

// Setting up sessions
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Setting up Global Variables 
const GLOBAL_VARIABLES = {
    pageName: "Dashboard",
    CSS_FILES: [],
    JS_FILES: [],
    LOGGED_IN_USER: false,
    LOGGED_IN_USER_ID: false,
    SITE_NAME,
    IS_ADMIN: false,
    svgIcon
}

// Map global variables to all views
app.use((req, res, next) => {
    for (const key in GLOBAL_VARIABLES) {
        res.locals[key] = GLOBAL_VARIABLES[key];
    }
    next();
});

// Setting view engine to ejs
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// Routers
app.use("/", index);
app.use("/user", user);
app.use("/admin", admin);

app.use("/controllers", authorize);
app.use("/controllers", _delete);
app.use("/user/controllers", userControllers);
app.use("/admin/controllers/", adminControllers);



server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}; ${process.env.SITE_URL}`);
});