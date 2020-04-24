const fs = require('fs');

const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const getCoordinates = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const allPlaces = async (req, res, next) => {
    let places;
    try {
        places = await Place.find();
    } catch (err) {
        const error = new HttpError('Non places', 500);
        return next(error);
    }

    res.json({places: places.map(place => place.toObject({getters: true })) });
}

const getPlaceById = async (req, res, next) => {
    const pid = req.params.pid;
    let place;
    try {
        place = await Place.findById(pid);
    } catch (err) {
        const error = new HttpError('Non place with this id', 500);
        return next(error);
    }

    if (!place) {
        return next(new HttpError('Place not faond', 404));
    }
    res.json({place: place.toObject({getters: true})});
}

const getUserPlaces = async (req, res, next) => {
    const uid = req.params.uid;
    let places;
    //let userWithPlaces;
    try {
        places = await Place.find({creator: uid});
        // userWithPlaces = await User.findById(uid).populate('places');
    } catch (err) {
        const error = new HttpError('Now places for this User', 500);
        return next(error);
    }

    // if (!userWithPlaces || userWithPlaces.places.length === 0)
    if (!places || places.length === 0 ) {
        return next(new HttpError('Now places for this user', 404));
    }
    // res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true})) });
    res.json({places: places.map(place => place.toObject({getters: true})) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, plase check your data.', 422));
    }
    const {title, description, address, creator} = req.body;

    let coordinates = getCoordinates();
    // the logic to get coordinates form google API using Address
    //let coordinates;
    // try{
    //     coordinates = await getCoordinates(address);
    // }catch(error){
    //     return next(error);
    // }
    const newPlace = new Place({
        title,
        description,
        image: 'uploads/images/'+req.file.filename,
        address,
        creator,
        location: coordinates
    });
    
    let user;
    try{
        user = await User.findById(creator);
    } catch(err){
        return next(new HttpError('Could net find user for this provided ID.', 500));
    }

    if(!user) {
        return next(new HttpError('Could net find user for this provided ID.', 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newPlace.save(); // await newPlace.save({session: sess}); Not work for me
        user.places.push(newPlace);
        await user.save(); //await user.save({session: sess}); Not work for me
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating Place failed, place try again!',500);
        return next(error);
    }

    res.status(201).json({ place: newPlace });
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, plase check your data.', 422));
    }
    const {title, description} = req.body;
    const pid = req.params.pid;
    let place;
    try {
        place = await Place.findById(pid);
    } catch (err) {
        const error = new HttpError('Updating Place failed 1, place try again!', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        place = await place.save();
    } catch (err) {
        const error = new HttpError('Updating Place failed, place try again!', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});
} 

const deletePlace = async (req, res, next) => {
    const pid = req.params.pid;
    let place;
    try {
        place = await Place.findById(pid).populate('creator');
    } catch (err) {
        const error = new HttpError('Deleteng Place failed, place try again!', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find Place for this provided id, place try again!', 500);
        return next(error);
    }
    const imagePath = place.image;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove(); // await place.remove({session: sess}); Not work for me
        place.creator.places.pull(place);
        await place.creator.save(); // await place.creator.save({session: sess}); Not work for me
        await sess.commitTransaction();

        fs.unlink(imagePath, err => {
            console.log(err)
        });
    } catch (err) {
        const error = new HttpError('Deleteng Place failed, place try again!', 500);
        return next(error);
    }
    res.status(200).json({messege: "Place deleted Succesfull"});
}

exports.allPlaces = allPlaces;
exports.getPlaceById = getPlaceById;
exports.getUserPlaces = getUserPlaces;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

