import { Router } from 'express'
import { authenticate } from '../../middlewares/index.js';
import { error, success, passwordVerify, passwordHash, Multer, setUploadPath } from '../../utils/functions.js';
import db from "../../config/Database.js";
const router = Router();
setUploadPath("public/images/users/");

// Update Personal Information
router.post('/personal-information', [authenticate, Multer.single("avatar")], (req, res) => {
    let { fname, lname } = req.body;
    let image = false;

    let file = req.file;

    if (file.fieldname == 'avatar') image = file.filename;

    let name = `${fname} ${lname}`;

    let dbData = { fname, lname, name };

    if (image) dbData.image = image; // If Image Exist


    let user = db.update("users", dbData, { id: req.user.id });
    if (!user) error("User Can't Updated", res);

    success("User Updated Successfully", res);
});

// Change Password
router.post('/change-password', [authenticate], async (req, res) => {
    let { current_password, new_password, confirm_password } = req.body;
    let user = req.user;

    if (new_password != confirm_password) return error("Password not matched", res);


    // Check if user password matching
    let verify = passwordVerify(current_password, user.password);
    if (!verify) return error("Current Password not matched", res);



    // Update New Password
    let hashPassword = await passwordHash(new_password);
    let updateUser = db.update("users", { password: hashPassword }, { id: user.id });

    if (!updateUser) return error("Password Can't Updated", res);

    return success("Password Changed Successfully", res);
});

// Save Category
router.post("/category", [authenticate], (req, res) => {
    let { category } = req.body;


    let insert = db.insert("categories", { name: category });
    if (!insert) return error("Category Can't Saved", res);

    return success({ name: category, id: insert }, res);
});

export default router;
