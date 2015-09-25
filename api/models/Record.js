/**
* Record.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

	},

	join_data: function (join_to) {   
	    var rawData = join_to['join'];
	    var to      = join_to['to'];

	    var data = [];
	    for (var i=0; i<rawData.length; i++) {

	      var Ndata = rawData[i][to];

	      
	      var keys = Object.keys(rawData[i]);

	      for (j=0; j<keys.length; j++) {
	      	var key = keys[j];
	      	if (key != to) {
	       		Ndata[key] = rawData[i][key];
	       	}
	      }

	      data.push(Ndata);
	    }

	    return data;
	},
};

