var faker = require('faker');

console.log('market_id,img');

// For all 8557 markets, create some dummy messages
// We don't have vendor_ids yet
for (var i = 1; i < 8558; i++) { 
  
  var images = [ 'https://s3-us-west-2.amazonaws.com/troveimages/market1.jpeg',
                 'https://s3-us-west-2.amazonaws.com/troveimages/market2.jpg',
                 'https://s3-us-west-2.amazonaws.com/troveimages/market3.jpg',
                 'https://s3-us-west-2.amazonaws.com/troveimages/market4.jpg',
                 'https://s3-us-west-2.amazonaws.com/troveimages/market5.jpg',
               ]
  
  for (var j = 0; j < 5 ; j++) { 
    
    var market_id = i;
    var img = images[j];
        
    console.log( market_id + ',' + img );
        
  }
  
}