var knex = require('../../../db/knex');

module.exports = {
  
  // *** Flexible Queries *** //
  
  getAllFrom: function (table) { return knex(table); },
  
  
  // *** /markets Queries *** //
  
  getInfoFor: function(marketID) { return knex('markets')
                                   .innerJoin('markets_categories', 'markets_categories.fmid', 'markets.fmid')
                                   .innerJoin('categories', 'categories.id', 'markets_categories.category_id')
                                   .where('markets.id', marketID)
    
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
