const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const PlacesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

router.get('/', PlacesController.allPlaces);
router.get('/:pid', PlacesController.getPlaceById);
router.get('/user/:uid', PlacesController.getUserPlaces);

router.use(checkAuth);

router.post('/', fileUpload.single('image') ,[
    check('title').not().isEmpty(),
    check('description').isLength({min: 10}).withMessage('must be at least 10 chars long'),
    check('address').not().isEmpty()
], PlacesController.createPlace);

router.patch('/:pid', [
    check('title').not().isEmpty(),
    check('description').isLength({min: 10})
], PlacesController.updatePlace);

router.delete('/:pid', PlacesController.deletePlace);

module.exports = router;