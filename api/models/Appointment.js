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
		staff_id: {
			model: 'staff',
		},

		patient_id: {
			model: 'patient',
		},

		vaccinator_id: {
			model: 'staff',
		},

                clinic_id : {
                    model: 'clinic',
                }


	},


	load: function (input, cb) {         
        var info = {};

		var tables = "clinic, appointment, patient, region";
		var fields = ['clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 'user.name as user', 'staff.id as staff_id', 'user.name as staff', 'staff.role'];

		fields.push('appointment.id as appointment_id', 'appointment.patient_id');

		var conditions = [];
		var group = [];

        conditions.push("appointment.clinic_id = clinic.id");
        conditions.push("appointment.patient_id=patient.id");
        conditions.push("patient.region_id = region.id");

      	conditions.push("appointment.id =" + input['appointment_id']);

      	var patientFields = ['patient.id as patient_id', 'patient.firstName', 'patient.lastName', 'patient.gender', "DATE_FORMAT(patient.birthdate,'%b %d, %Y') as birthdate", "FLOOR(DATEDIFF(CURDATE(), birthdate)/365) as age", "region.name as location"];
        fields.push(patientFields);

		var left_joins = [
			"clinic_staff AS CS ON CS.clinic_id=clinic.id",
			"staff ON CS.staff_id=staff.id",
			"user on staff.user_id=user.id"
		];

 
		var query = "SELECT " + fields.join(',');
		if (tables) query += ' FROM (' + tables + ')';
		if (left_joins.length) { query += " LEFT JOIN " + left_joins.join(' LEFT JOIN ') }
		if (conditions.length) { query += " WHERE " + conditions.join(' AND ') }
		if (group.length) { query += " GROUP BY " + group.join(',') }

		console.log("Q: " + query);
    
		Appointment.query(query, function (err, result) {
			if (err || (result == undefined) ) { 
				  console.log("No result...");
				  return cb(err)
			}

        	console.log("Appointment INFO: " + JSON.stringify(result));

        	info['appointment'] = result[0];

        	// load patient fields 
        	info['patient'] = {
        		id : result[0]['patient_id'],
        		firstName : result[0]['firstName'],
                lastName : result[0]['lastName'],
        		gender : result[0]['gender'],
        		birthdate : result[0]['birthdate'],
        		age : result[0]['age'],
        		location : result[0]['location'],
        	};

	        var scheduled = [];
	        var treatments = [];
	        var patient_id = result[0]['patient_id'];

	        if (patient_id) {
	            // Load scheduled 

	            var query = "SELECT * from schedule WHERE patient_id = " + patient_id;

	            Appointment.query(query, function (err, result) {
	              if (err) { return cb(err) }
	              info['scheduled'] = result;
	              return cb(null, info);
	            });
	        }
	        else { return cb("No record found") }

    	});     
	}

};

