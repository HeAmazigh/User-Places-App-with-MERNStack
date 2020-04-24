// const axios = require('axios');
// const HttpError = require('../models/http-error');
// const APP_KEY = 'AIzaSyAQGpR4lNkJWgECQEttzC33nrIdBJDFtbA';

const getCoordinats = () => {
    return {
        lat: 36.7146,
        lng: 4.04571
    };
};
// const getCoordinats = async (address) => {
//     return {
//         lat: 36.7146,
//         lng: 4.04571,
//     };
//     const responce = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${APP_KEY}`);

//     const data = responce.data;
//     if(!data || data.status === 'ZERO_RESULTS'){
//         const errors = new HttpError('Could not find location for the specified address',422);
//     }
//     console.log(data);
//     const coordinates = data.results[0].geometry.location;
//     return coordinates;
// };

module.exports = getCoordinats;