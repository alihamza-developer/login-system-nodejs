import { Router } from 'express'
import { authenticate, isAdmin } from '../../middlewares/index.js';
import db from "../../config/Database.js";
import { error, success } from '../../utils/functions.js';
const router = Router();
router.use(authenticate, isAdmin); // Apply this middleware to all routes

// Verify User
router.post("/verify-user", (req, res) => {
    let { uid, status } = req.body;

    status = status == "true" ? true : false;

    let user = db.update("users", { "verify_status": status ? 1 : 0 }, { uid });
    if (!user) return error("User not found", res);
    let message = status ? "verified" : "unverified";
    return success(`User ${message}`, res);
});

export default router;  