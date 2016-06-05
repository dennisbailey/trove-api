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
  var lng = parseFloat(req.query.lng);


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
                              var lng = parseFloat(result[0].lng);


                              var latMax = lat + geoHelpers.degrees(radiusSearch/radiusEarth);
                              var latMin = lat - geoHelpers.degrees(radiusSearch/radiusEarth);
                              var lngMax = lng + geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));
                              var lngMin = lng - geoHelpers.degrees(Math.asin(radiusSearch/radiusEarth) / Math.cos(geoHelpers.radians(lat)));

                              api.findNearbyMarkets(latMin, latMax, lngMin, lngMax)

                              .then( function(result) { return res.status(200)
                                                        .json({ status: 'Check out these nearby Farmers Markets',
                                                                nearbyMarkets: geoHelpers.sortByDistance(result, lat, lng, radiusSearch) });
                              });
  })

  .catch( function(error) { return res.status(401)
                                  .json({ status: 'There was an error',
                                          errorMsg: error }); });

});


// Route to return all information for ONE Farmers Market
router.get('/markets/info', function(req, res, next) {

  var promises = [];

  promises.push(api.getInfoFor(req.query.id));
  promises.push(api.getCategoriesFor(req.query.fmid));
  promises.push(api.getVendorsFor(req.query.fmid))

  Promise.all(promises)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great info for this Farmers Market',
                                              info: result[0],
                                              categories: result[1],
                                              vendors: result[2] });
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

  api.postMessage(req.body)

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
// Route to return a list of ALL Messages for ONE Market
router.get('/images', function(req, res, next) {

  api.getImagesFor(req.query.id)

  .then( function(result) { res.status(200).json({ status: 'All the great Images for Market ID ' + req.query.id,
                                                   data: result });
  })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error });
  });

});

/** API path that will upload the files */
router.post('/images', upload.single('file'), function(req, res, next){
   console.log('/// ----------- Upload');
   console.log(req.file);
   console.log('market id? ', req.body.marketID);
//    console.log('req', req);
   console.log(__dirname + '/uploads');



   // Check for a file in the request. Fail if there's no file present
   if(!req.file) { return res.render('upload', { title : 'Upload Image',
                                                 message : { type: 'danger',
                                                             messages : [ 'Failed uploading image. 1x001']}});
   }

   //
   else { fs.rename(req.file.path, __dirname + '/uploads/' + req.file.originalname, function(err) {
            var datetimestamp = Date.now();
            var newfilename = datetimestamp + '-' + req.file.originalname;

            if(err) { console.log('errrrrrror', err); return res.render('upload', { title : 'Upload Image',
                                                    message : { type: 'danger',
                                                                messages : [ 'Failed uploading image. 1x001']}});
            }

            else { //pipe to s3
                   AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

                   var fileBuffer = fs.readFileSync(__dirname + '/uploads/' + req.file.originalname);
                   console.log(fileBuffer);

                   var s3 = new AWS.S3();

                   var s3_param = {
                      Bucket: 'troveimages',
                      Key: newfilename,
                      Expires: 60,
                      ContentType: req.file.mimetype,
                      ACL: 'public-read',
                      Body: fileBuffer
                   };

                   s3.putObject(s3_param, function(err, data){

                      if(err) { console.log(err); }
                      else { var return_data = { signed_request: data,
                                                 url: 'https://s3-us-west-2.amazonaws.com/troveimages/' + newfilename };

                            var imageInsert = {};
                            imageInsert.market_id = req.body.marketID;
                            imageInsert.img = 'https://s3-us-west-2.amazonaws.com/troveimages/' + newfilename;

                            api.postImage(imageInsert)

                            .then( function (result) { global.io.emit('image.new', req.body.marketID);
                                                       console.log('image insert', result); })

                            .catch( function (error) { console.log('image insert', error); });

                            console.log('return data - ////////// --------------');
                            console.log(return_data);
                            console.log("upload successful!!!");

                      }

                   });

            // After a successful upload to S3, get the path to the recently uploaded photo
            var photoPath = __dirname + '/uploads/' + req.file.originalname;

            // Remove the photo from the server
            fs.unlink(photoPath, function() {
              console.log('delete file from uploads?');
            });


            }
        });
   }
});

/**************************/
/* --- VENDORS ROUTES --- */
/**************************/

// Route to return all information for ONE Farmers Market
router.get('/vendors', function(req, res, next) {

  api.getVendorsFor(req.query.fmid)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great vendors for this Farmers Market',
                                              vendors: result });
  })

  .catch( function(error) { return res.status(401)
                                      .json({ status: 'There was an error getting vendors for this market',
                                              errorMsg: error });
  });

});

module.exports = router;
