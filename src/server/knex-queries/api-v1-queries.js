var knex = require('../../../db/knex');

module.exports = {
  
  // *** Flexible Queries *** //
  
  getAllFrom: function (table) { return knex(table); },
  
  
  // *** /markets Queries *** //
  
  getInfoFor: function(marketID) { return knex('markets')
                                         .where('markets.id', marketID)
    
  },
  
  getCategoriesFor: function(fmid) { return knex('markets_categories')
                                            .innerJoin('categories', 'categories.id', 'markets_categories.category_id')
                                            .where('markets_categories.fmid', fmid);
  },
  
  findNearbyMarkets: function(latMin, 
                              latMax, 
                              lngMin, 
                              lngMax) { return knex('markets')
                                              .where(   'lat', '>', latMin)
                                              .andWhere('lat', '<', latMax)
                                              .andWhere('lng', '>', lngMin)
                                              .andWhere('lng', '<', lngMax);
                                                                                            
  },
  
  getCoordsByZip: function(zip) { return knex('zip_codes')
                                        .where('zip', zip);
  },
  
  // *** /messages Queries *** //
  getMessagesFor: function(marketID) { return knex('messages')
                                              .where('market_id', marketID)
                                              .innerJoin('categories', 'categories.id', 'messages.category_id')
                                              .orderBy('dt', 'asc');
  },
                                              
  postMessage: function(marketID, payload) { return knex('messages')
                                                    .insert(payload); 
  }

};
