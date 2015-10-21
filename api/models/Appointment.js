/**
* Appointment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

		position: {
			type: 'integer'
		},

		status: {
			type: 'string',
	  		enum: ['Scheduled', 'Queued', 'Ready','In Process', 'Completed', 'Cancelled','Prioritized'],
	  		defaultsTo: 'Queued'

		},

		arrivalTime: {
			type: 'datetime',
			defaultsTo: new Date()
		},
    
                startTime: {
                    type: 'datetime',
                },

                endTime: {
                    type: 'datetime',
                },

		reason: {
			type: 'string'
		},

                
		// Foreign Key references 

		// Data entry staff 
		staff: {
			model: 'staff',
		},

        		// REDUNDANT for optional booking simplicity //
		patient: {
			model: 'patient',
		},
                
                // REDUNDANT for optional booking simplicity //

		vaccinator: {
			model: 'staff',
		},

        clinic : {
            model: 'clinic',
        }
    },

	autoload: {
		type : 'query',
		tables : ['clinic', 'appointment', 'patient', 'region'],
		fields : [ 'clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 
			'appointment.id as appointment_id', 'appointment.patient_id', 'position',
			'MedUser.name as Vaccinator', 'MedStaff.id as Vaccinator_id', 'DeskUser.name as BookedBy', 'MedStaff.role', 
			'patient.id as patient_id', 'patient.firstName', 'patient.lastName', 'patient.gender', "birthdate", "FLOOR(DATEDIFF(CURDATE(), birthdate)/365) as age", "region.name as location"
		],
		order : ['status DESC', 'position', 'appointment.createdAt'],
		conditions: [
			"appointment.status NOT IN ('Cancelled', 'Completed')",
			"appointment.clinic = clinic.id",
			"appointment.patient_id=patient.id",
			"patient.region_id = region.id"
		],
		left_joins : [
			"staff as MedStaff ON appointment.vaccinator=MedStaff.id",
			"user as MedUser on MedStaff.user_id=MedUser.id",
			"staff as DeskStaff ON appointment.staff_id=DeskStaff.id",
			"user as DeskUser on DeskStaff.user_id=DeskUser.id",
		],

	},

	loadAppointmentPageData : function (input, cb) {

		var appointment_id = input.appointment;

		var returnData = {};

		// Generate page settings 
        var page = { 
            item_Class : 'treatment',
            search_title : "Search for Treatments using any of fields below",
            add_to_scope : true
        };
        
        returnData.page = page;

        // Generate Vaccine / Disease Protection Map 
        var q = "SELECT vaccine as vaccine_id, vaccine.name as vaccine_name, disease as disease_id, disease.name as disease_name from protection, vaccine, disease where vaccine=vaccine.id and disease=disease.id"
        Record.query(q, function (err, protection) {
//        Protection.find()
//        .populate('disease')
//        .populate('vaccine')
//        .exec ( function (err, protection) {

            if (err) { return {Error: err} }
                
            var Diseases = {};
            var Vaccines = {};
            for (var i=0; i<protection.length; i++) {
                var disease = protection[i].disease_name;
                var vaccine = protection[i].vaccine_name;

                if (Diseases[vaccine] == undefined) { Diseases[vaccine] = [] }
                if (Vaccines[disease] == undefined) { Vaccines[disease] = [] }
                Diseases[vaccine].push(disease);
                Vaccines[disease].push(vaccine);
            }
            
            returnData.protectionMap = { Diseases : Diseases, Vaccines : Vaccines };
        });

        Appointment.findOne( { id : appointment_id }  )
        .populate('clinic')
        .populate('patient')
        .populate('vaccinator')
        .then ( function (appointmentData) {         

        	var patient_id = appointmentData.patient.id;

        	returnData.appointment = appointmentData;

	       	Treatment.find( { where : { patient : patient_id, status : ['Active'] } , sort : 'applied desc' } )   
	        .populate('appointment')
	        .populate('vaccine')
	        .exec( function (err, treatments ) {
	 //           if (err) { return res.send({ Error: err, message : "Error retrieving Treatments " }) }
	 			if (err) { cb("Error retrieving treatments: " + err) }

	            returnData['treatments'] = treatments;

	            var q = "SELECT vaccine as vaccine_id, vaccine.name as vaccine_name, disease as disease_id, disease.name as disease_name, recommendation from recommendation, vaccine, disease where vaccine=vaccine.id and disease=disease.id"

	            Recommendation.query(q, function (err, recommendations) {
	                var schedule = [];
	                for (var i=0; i < recommendations.length; i++) {
	                    var D = recommendations[i].disease_name;
	                    var V = recommendations[i].vaccine_name;
	                    var DID = recommendations[i].disease_id;
	                    var VID = recommendations[i].vaccine_id;
	                    var rec = recommendations[i].recommendation;

	                    var found = 0;
	                    for (j=0; j<treatments.length; j++) {
	                        var vaccine = treatments[j].vaccine.name;
	                        var against = returnData.protectionMap.Diseases[vaccine];
	                        Dfound = against.indexOf(D);
	                        if (Dfound >=0) { found++ }
	                    }

	                    if (!found) { 
	                        schedule.push( {
	                            disease: { id: DID, name: D}, 
	                            vaccine: { id: VID, name: V}, 
	                            patient: patient_id,
	                            recommendation : rec,

	                        } );
	                        console.log(D + ' not treated');
	                    }
	                    else {
	                        console.log(D + ' Treated with ' + V);
	                    }
	                
	                }
	                returnData['schedule'] = schedule;
	                console.log("Schedule: " + JSON.stringify(schedule));

	                cb(null, returnData);

	            });               
	        });	
	    });	
	},

};

