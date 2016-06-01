var express = require('express');
var api = require('../knex-queries/api-v1-queries');
var router = express.Router();
var AWS = require('aws-sdk');
var geoHelpers = require('../helpers/geo-helpers');
var multer = require('multer');

/*************************/
/* --- MULTER HELPERS --- */
/*************************/
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({ //multer settings
                storage: storage
            }).single('file');

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

  var radiusEarth = 3959;
  var radiusSearch = parseFloat(req.query.searchRadius || 10);
  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng)


  var latMax = lat + geoHelpers.degrees(radiusSearch/radiusEarth);
  var latMin = lat - geoHelpers.degrees(radiusSearch/radiusEarth);
  var lngMax = lng + geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));
  var lngMin = lng - geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));

  api.findNearbyMarkets(latMin, latMax, lngMin, lngMax)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'Check out these nearby Farmers Markets',
                                              nearbyMarkets: geoHelpers.sortByDistance(result, lat, lng, radiusSearch) });
  })

  .catch( function(error) { return res.status(401)
                                      .json({ status: 'There was an error',
                                              errorMsg: error }); });

});

// Route to find the markets that are near a given zip code
router.get('/markets/nearbyzip', function(req, res, next) {

  api.getCoordsByZip(req.query.zip)

  .then( function (result) {  var radiusEarth = 3959;
                              var radiusSearch = parseFloat(req.query.searchRadius || 10);
                              var lat = parseFloat(result[0].lat);
                              var lng = parseFloat(result[0].lng)


                              var latMax = lat + geoHelpers.degrees(radiusSearch/radiusEarth);
                              var latMin = lat - geoHelpers.degrees(radiusSearch/radiusEarth);
                              var lngMax = lng + geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));
                              var lngMin = lng - geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));

                              api.findNearbyMarkets(latMin, latMax, lngMin, lngMax)

                              .then( function(result) { return res.status(200)
                                                        .json({ status: 'Check out these nearby Farmers Markets',
                                                                nearbyMarkets: geoHelpers.sortByDistance(result, lat, lng, radiusSearch) });
                              })
  })

  .catch( function(error) { return res.status(401)
                                  .json({ status: 'There was an error',
                                          errorMsg: error }); });

});


// Route to return all information for ONE Farmers Market
router.get('/markets/info', function(req, res, next) {

  var promises = [];

  promises.push(api.getInfoFor(req.query.id))
  promises.push(api.getCategoriesFor(req.query.fmid))

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
router.get('/messages', function(req, res, next) {

  api.getMessagesFor(req.query.id)

  .then( function(result) {
                            res.status(200).json({ status: 'All the great Messages for Market ID ' + req.query.id,
                                                   data: result });
  })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error });
  });

});


// Route to add a message to the database
router.post('/messages', function(req, res, next) {

// Req.body needs the marketID, categoryID, msg, img, and vendor boolean

  api.postMessageFor(req.body)

  .then( function(result) { global.io.emit('message.new', req.body.market_id);
                                  res.status(200)
                                     .json({ status: 'Another message successfully saved. For posterity',
                                             data: result });
  })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error });
  });

});

/*************************/
/* --- IMAGE ROUTES --- */
/*************************/
/** API path that will upload the files */
router.post('/upload', function(req, res) {
  console.log('upload route');
    upload(req,res,function(err){
            console.log(req.file);
        if(err){
          console.log('err', err);
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });
});


/*********************/
/* --- S3 Images --- */
/*********************/
// Set the region for requests.
AWS.config.region = 'us-west-2';

// S3 test route
router.get('/test', function(req, res, next) {

  var s3 = new AWS.S3();

  s3.listBuckets(function(err, data) {

    if (err) { return res.status(401)
                         .json({ status: 'There was an error',
                                 errorMsg: error }); }

    else { return res.status(200)
                     .json({ buckets: data.Buckets }); }
  });

});

// S3 test route
router.get('/upload', function(req, res, next) {

  var s3 = new AWS.S3({params: {Bucket: 'qwertyuioptest'}});

  s3.upload({Key: 'testkey', Body: 'Did the upload work?'}, function() {
      console.log("Successfully uploaded data to myBucket/myKey");
  });

});



// S3 test route
router.get('/bucket', function(req, res, next) {

  var s3 = new AWS.S3({params: {Bucket: 'qwertyuioptest', Key: 'test'}});

  s3.createBucket(function(err) {
    if (err) { console.log("Error:", err); }
    else {
      s3.upload({Body: 'hello'}, function() {
        console.log("Successfully uploaded data to myBucket/myKey");
      });
    }
  });

});



module.exports = router;
