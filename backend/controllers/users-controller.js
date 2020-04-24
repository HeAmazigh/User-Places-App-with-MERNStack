const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const User = require('../models/user');


const allUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Now user to fitche!', 500);
        return next(error);
    }
    res.status(200).json({users: users.map(user => user.toObject({getters: true}) )} );
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const {name, email, password} = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Singup field, plase try again later!',500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('E-mail address already exist!', 422);
        return next(error);
    }
    let hashPassword;
    try {
        hashPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Could not create user, please try again.',500);
        return next(error);
    }
    const createUser = new User({
        name, 
        email, 
        password: hashPassword, 
        image: 'uploads/images/'+req.file.filename,
        places: []
    });

    try {
        await createUser.save();
    } catch (err) {
        const error = new HttpError('Signing up field, plase try later', 500);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({
            userId: createUser.id, 
            email: createUser.email
        }, 
        'supersecret_dont_share',
        {
            expiresIn: '1h'
        });      
    } catch (err) {
        const error = new HttpError('Signing up field, plase try later', 500);
        return next(error);
    }
    
    res.status(201).json({ userId: createUser.id, email: createUser.email, token: token});
}

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Login field, plase try later', 500);
        return next(error);
    }

    if (!existingUser) {
        return next(new HttpError('Credentials not match', 401));
    }

    let isValidPassword =  false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);      
    } catch (err) {
        const error = new HttpError('Could not log you in, Please try again.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        return next(new HttpError('Credentials not match', 401));
    }

    let token;
    try {
        token = jwt.sign({
            userId: existingUser.id, 
            email: existingUser.email
        },
            'supersecret_dont_share',
        {
            expiresIn: '1h'
        })
    } catch (error) {
        return next(new HttpError('logging in failed, Please try agin.', 401));
    }

    res.json({message: "You are logedin", userId: existingUser.id, email: existingUser.email, token: token });
}

exports.allUsers = allUsers;
exports.signup = signup;
exports.login = login;