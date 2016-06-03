var faker = require('faker');

console.log('market_id,category_id,msg,vendor');

// For all 8557 markets, create some dummy messages
// We don't have vendor_ids yet
for (var i = 1; i < 8558; i++) { 
  
  for (var j = 0; j < 10 ; j++) { 
    
    var market_id = i;
    var category_id = Math.floor(Math.random() * (31 - 1)) + 1;
    var msg = faker.lorem.sentence();
    var vendor = faker.random.boolean();
        
    console.log( market_id + ',' + category_id + ',' + msg + ',' + vendor );
        
  }
  
}