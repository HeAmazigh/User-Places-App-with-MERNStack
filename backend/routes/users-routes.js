const express = require('express');
const {check} = require('express-validator');
const router = express.Router();

const UsersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

router.get('/', UsersController.allUsers);
router.post('/signup',
fileUpload.single('image'),
[
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 8})
], UsersController.signup);
router.post('/login', UsersController.login);

module.exports = router;