import { Router } from 'express'
const router = Router();
import db from '../../config/Database.js'
import { authenticate } from '../../middlewares/index.js'
router.use([authenticate]);
// Dashboard
router.get('/dashboard', (req, res) => {
    res.render('user/dashboard');
});

// Setting Page
router.get('/setting', (req, res) => {
    res.render('user/setting');
});


export default router;
