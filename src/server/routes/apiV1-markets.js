var express = require('express');
var router = express.Router();
var knex = require('../knex-queries/api-v1-queries');
var geoHelpers = require('../helpers/geo-helpers');

/*************************/
/* --- MARKET ROUTES --- */
/*************************/
// Returns JSON containing ALL Farmers Markets
router.get('/markets', function(req, res, next) {

    knex.getAllFrom('markets')

    .then(function(result) {
        return res.status(200)
            .json({
                status: 'All the great Farmers Markets',
                data: result
            });
    })

    .catch(function(error) {
        return res.status(401)
            .json({
                status: 'There was an error in your request for all Farmers Markets',
                errorMsg: error
            });
    });
});

// Route to find the markets that are near a given latitude and longitude
router.get('/markets/nearby', function(req, res, next) {

    var radiusEarth = 3959;
    var radiusSearch = parseFloat(req.query.searchRadius || 10);
    var lat = parseFloat(req.query.lat);
    var lng = parseFloat(req.query.lng);

    // Define a bounding box for the SQL query
    var latMax = lat + geoHelpers.degrees(radiusSearch / radiusEarth);
    var latMin = lat - geoHelpers.degrees(radiusSearch / radiusEarth);
    var lngMax = lng + geoHelpers.degrees(Math.asin(radiusSearch / radiusEarth) / Math.cos(geoHelpers.radians(lat)));
    var lngMin = lng - geoHelpers.degrees(Math.asin(radiusSearch / radiusEarth) / Math.cos(geoHelpers.radians(lat)));

    /*
    function getBounds() {
        return  {
            latmax: latmax
        }
    }
    */

    knex.findNearbyMarkets(latMin, latMax, lngMin, lngMax)

    .then(function(result) {
        return res.status(200)
            .json({
                status: 'Check out these nearby Farmers Markets',
                nearbyMarkets: geoHelpers.sortByDistance(result, lat, lng, radiusSearch)
            });
    })

    .catch(function(error) {
        return res.status(401)
            .json({
                status: 'There was an error finding nearby markets',
                errorMsg: error
            });
    });

});

// Route to find the markets that are near a given zip code
router.get('/markets/nearbyzip', function(req, res, next) {

    knex.getCoordsByZip(req.query.zip)

    .then(function(result) {
        var radiusEarth = 3959;
        var radiusSearch = parseFloat(req.query.searchRadius || 10);
        var lat = parseFloat(result[0].lat);
        var lng = parseFloat(result[0].lng);

        // Define a bounding box for the SQL query
        var latMax = lat + geoHelpers.degrees(radiusSearch / radiusEarth);
        var latMin = lat - geoHelpers.degrees(radiusSearch / radiusEarth);
        var lngMax = lng + geoHelpers.degrees(Math.asin(radiusSearch / radiusEarth) / Math.cos(geoHelpers.radians(lat)));
        var lngMin = lng - geoHelpers.degrees(Math.asin(radiusSearch / radiusEarth) / Math.cos(geoHelpers.radians(lat)));

        knex.findNearbyMarkets(latMin, latMax, lngMin, lngMax)

        .then(function(result) {
            return res.status(200)
                .json({
                    status: 'Check out these nearby Farmers Markets',
                    nearbyMarkets: geoHelpers.sortByDistance(result, lat, lng, radiusSearch)
                });
        });
    })

    .catch(function(error) {
        return res.status(401)
            .json({
                status: 'There was an error searching for nearby markets by zip',
                errorMsg: error
            });
    });

});


// Route to return all information for ONE Farmers Market
router.get('/markets/info', function(req, res, next) {

    var promises = [];

    promises.push(knex.getInfoFor(req.query.id));
    promises.push(knex.getCategoriesFor(req.query.fmid));
    promises.push(knex.getVendorsFor(req.query.fmid));

    Promise.all(promises)

    .then(function(result) {
        return res.status(200)
            .json({
                status: 'All the great info for this Farmers Market',
                info: result[0],
                categories: result[1],
                vendors: result[2]
            });
    })

    .catch(function(error) {
        return res.status(401)
            .json({
                status: 'There was an error getting the info for the requested market',
                errorMsg: error
            });
    });

});

module.exports = router;
