/**
* Recommendation.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    vaccine : {
        'model' : 'vaccine'
    },
    
    disease : {
        'model' : 'disease'
    },

    recommendation : {
        'type' : 'text',
        'enum' : ['Mandatory','Recommended','Optional','Discouraged'] 
    },

    region : {
        'model' : 'region'
    },
  }
};

