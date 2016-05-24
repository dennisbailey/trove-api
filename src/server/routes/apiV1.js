var express = require('express');
var api = require('../knex-queries/api-v1-queries');
var router = express.Router();

/*************************/
/* --- MARKET ROUTES --- */
/*************************/
// Route to return a list of ALL Farmers Markets
router.get('/markets', function(req, res, next) {

  api.getAll('markets')

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great Farmers Markets',
                                              data: result }); })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error }); });

});


/***************************/
/* --- MESSAGES ROUTES --- */
/***************************/
// Route to return a list of ALL Messages for ONE Market
router.get('/messages/:marketID', function(req, res, next) {

  api.getMessages(req.params.marketID)

  .then( function(result) { return res.status(200)
                                      .json({ status: 'All the great Messages for Market ' + req.params.marketID,
                                              data: result }); })

  .catch( function(error) { return res.status(401)
                                       .json({ status: 'There was an error',
                                               errorMsg: error }); });

});



module.exports = router;
