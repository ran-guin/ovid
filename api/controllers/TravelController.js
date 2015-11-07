/**
 * TravelController
 *
 * @description :: Server-side logic for managing travels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	recommendations : function (req, res) {
		var patient = req.param('patient');

		Travel.find( { patient : patient })
		.populate('region')
		.then ( function (travelPlans) {
			console.log("Get Travel Plans: " + JSON.stringify(travelPlans));

			var regionList = '';
			for (var i=0; i<travelPlans.length; i++) {
				var region = travelPlans[i].region.id;
				var applicable = travelPlans[i].region.applicable || region;
				if (applicable) {
					regionList = regionList + ',' + applicable;
				}
				
				travelPlans[i].travelPlans = {};
			}
			
			var list = regionList.split(',');

			Recommendation.find( { region : list } )
			.populate('disease')
			.populate('vaccine')
			.then (function (recomm) {
				for (var i=0; i<travelPlans.length; i++) {
					for (var j=0; j<recomm.length; j++) {
						
						if (recomm[j].region == travelPlans[i].region.id) {
							travelPlans[i].recommendations = recomm[j];
							console.log("added recommendations for " + travelPlans[i].region.id);
						}
					}
				}
				//travelPlans[i].recommendations = recomm;

				return res.send(travelPlans);

			});

			
		});

	}
};

