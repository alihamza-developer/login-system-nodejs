import { Router } from 'express'
const router = Router();
import { authenticate, isAdmin } from '../../middlewares/index.js';
import db from '../../config/Database.js';
import { monthDate } from '../../utils/functions.js';

router.use([authenticate, isAdmin]);
// Render Admin Login Page
router.get('/login', (req, res) => {
    return res.redirect('dashboard');
});
// Admin Dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

// Render Users Page
router.get('/users', (req, res) => {
    let users = db.select("users", "id,uid,image,email,name,date_added,verify_status", {
        id: {
            operator: "!=",
            value: req.user.id
        }
    });
    users.forEach(user => {
        let joinDate = user.date_added;
        user["date_added"] = monthDate(joinDate);
        user['verify_status'] = user['verify_status'] == 1;
    });

    res.render('admin/users', { users });
});

export default router;