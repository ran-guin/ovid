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

		patient: {
			model: 'patient',
		},

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

};

