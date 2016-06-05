var faker = require('faker');

category_counts = [2181, 4631, 2677, 3194, 3661, 3853, 1280, 4196, 5142, 4277, 4242, 1653, 2866, 406, 1505, 3596, 2307, 3185, 3475, 1551, 873, 1547, 639, 4097, 651, 1022, 1007, 816, 167, 586];

console.log('vendor_name,category_id');

// For all 8557 markets, create one vendor per applicable category
for (var i = 0; i < category_counts.length ; i++) { 
  
  for (var j = 0; j < category_counts[i] ; j++) { 
    
    var vendorName = faker.company.companyName();
    var category_id = i + 1;
    
    console.log( vendorName + ',' + category_id );
        
  }
  
}

// faker.company.companyName will produce names with a comma in them. Replace all the ', ' with ' ' to create a valid .csv