var express = require('express');
var api = require('../knex-queries/api-v1-queries');
var router = express.Router();

/*************************/
/* --- MARKET ROUTES --- */
/*************************/
// Route to return a list of ALL Farmers Markets
router.get('/markets', function(req, res, next) {

  api.getAllFrom('markets')

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great Farmers Markets',
                                              data: result }); 
  })

  .catch( function(error) { return res.status(401)
                                      .json({ status: 'There was an error',
                                              errorMsg: error }); 
  });

});

// Route to find the markets that are near a given latitude and longitude
router.get('/markets/nearby', function(req, res, next) {
  console.log(req.query);
  
  var radiusEarth = 3959;
  var radiusSearch = parseFloat(req.query.searchRadius);
  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng)
  
  // Converts from degrees to radians.
  var radians = function(degrees) {
    return degrees * Math.PI / 180;
  };
   
  // Converts from radians to degrees.
  var degrees = function(radians) {
    return radians * 180 / Math.PI;
  };
  
  var latMax = lat + degrees(radiusSearch/radiusEarth);
  var latMin = lat - degrees(radiusSearch/radiusEarth);
  var lngMax = lng + degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(radians(lat)));
  var lngMin = lng - degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(radians(lat)));
  
//   Math.acos(Math.sin(degrees(lat))*Math.sin(radians(LAT)) + Math.cos(degrees(lat))*Math.cos(radians(LAT))*Math.cos(radians(LNG)-degrees(lng))) * 3959 < 10
                              
  console.log(latMax, latMin, lngMax, lngMin);
  
  api.findNearbyMarkets(latMin, latMax, lngMin, lngMax)
  
  .then( function(result) { return res.status(200)
                                      .json({ status: 'Check out these nearby Farmers Markets',
                                              nearbyMarkets: result }); 
  })

  .catch( function(error) { return res.status(401)
                                      .json({ status: 'There was an error',
                                              errorMsg: error }); console.log(error);
  });

});

// Route to return all information for ONE Farmers Market
router.get('/markets/:marketID', function(req, res, next) {

  var promises = [];
  
  promises.push(api.getInfoFor(8370))
  promises.push(api.getCategoriesFor(1011056))
  
  Promise.all(promises)  

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great info for this Farmers Market',
                                              info: result[0], 
                                              categories: result[1] }); 
  })

  .catch( function(error) { return res.status(401)
                                      .json({ status: 'There was an error',
                                              errorMsg: error }); 
  });

});


/***************************/
/* --- MESSAGES ROUTES --- */
/***************************/
// Route to return a list of ALL Messages for ONE Market
router.get('/messages/:marketID', function(req, res, next) {

  api.getMessagesFor(req.params.marketID)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great Messages for Market ' + req.params.marketID,
                                              data: result }); 
  })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error }); 
  });

});


// Route to add a message to the database
router.post('/messages/:marketID', function(req, res, next) {

// Req.body needs the marketID, categoryID, msg, img, and vendor boolean

  api.postMessagesFor(req.body)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'Another message successfully saved. For posterity',
                                              data: result }); 
  })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error }); 
  });

});


module.exports = router;
