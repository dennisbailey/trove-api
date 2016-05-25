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
                                            .where('markets_categories.fmid', fmid)
  },
  
  // *** /messages Queries *** //
  getMessagesFor: function(marketID) { return knex('messages')
                                              .where('market_id', marketID)
                                              .orderBy('dt', 'desc') 
  },
                                              
  postMessage: function(payload) { return knex('messages')
                                          .insert(payload) 
  }

};
