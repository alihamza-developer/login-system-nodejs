import { Router } from 'express'
import { authenticate } from '../middlewares/index.js';
import Delete from '../config/Delete.js';
const router = Router();


router.use(authenticate);

router.post("/delete", (req, res) => {
    const _delete = new Delete();

    _delete.set({
        "user": 'users',
        
    });
    
    let response = _delete.init(req, res);
    res.send(response);
});

export default router;  
