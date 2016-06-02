var express = require('express');
var api = require('../knex-queries/api-v1-queries');
var router = express.Router();
var AWS = require('aws-sdk');
var geoHelpers = require('../helpers/geo-helpers');
var multer = require('multer');
var fs = require('fs');

/*************************/
/* --- MULTER HELPERS --- */
/*************************/
var upload = multer({ dest: 'uploads/' });

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
router.post('/upload', upload.single('file'), function(req, res, next){
   console.log('/// ----------- Upload');
   console.log(req.file);
   console.log(__dirname + '/uploads');
   if(!req.file) { return res.render('upload', { title : 'Upload Image',
                                                 message : { type: 'danger',
                                                             messages : [ 'Failed uploading image. 1x001']}});
   }
   else { fs.rename(req.file.path, __dirname + '/uploads/' + req.file.originalname,
          function(err){
            var datetimestamp = Date.now();
            var newfilename = datetimestamp + '-' + req.file.originalname;
            if(err) { return res.render('upload', { title : 'Upload Image',
                                                    message : { type: 'danger',
                                                                messages : [ 'Failed uploading image. 1x001']}});
            }
            else { //pipe to s3
                   AWS.config.update({ accessKeyId: process.ENV.AWS_ACCESS_KEY_ID,
                                      secretAccessKey: process.ENV.AWS_SECRET_ACCESS_KEY});

                   var fileBuffer = fs.readFileSync(__dirname + '/uploads/' + req.file.originalname);
                   console.log(fileBuffer);

                   var s3 = new AWS.S3();

                   var s3_param = {
                      Bucket: 'qwertyuioptest',
                      Key: newfilename,
                      Expires: 60,
                      ContentType: req.file.mimetype,
                      ACL: 'public-read',
                      Body: fileBuffer
                   };

                   s3.putObject(s3_param, function(err, data){

                      if(err) { console.log(err); }
                      else { var return_data = { signed_request: data,
                                                 url: 'https://s3-us-west-2.amazonaws.com/qwertyuioptest/' + newfilename };

                      console.log('return data - ////////// --------------');
                      console.log(return_data);
                      console.log("upload successful!!!");

                      }

                   });
              }
          })
   }
});

module.exports = router;
