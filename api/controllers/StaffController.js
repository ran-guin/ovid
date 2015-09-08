/**
 * StaffController
 *
 * @description :: Server-side logic for managing staff
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	/* separate load function only required when model loading requires information from multiple tables */
	load: function (req, res) {
		var id = req.param('id') || 0;
		var query = "SELECT staff.id, user_id, name, email, role, lastLoggedIn, gravatarURL from staff, user where user_id=user.id";

		if (id) query += " AND staff.id = " + id;

		console.log("Q: " + query);
		
		Clinic.query(query, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			return res.send(result);
	
		});
	},

	/* separate list function only required when query uses or retrieves information from multiple tables */
	list: function (req, res) {
		var id = req.param('id');
		var clinic = req.param('clinic');

		var tables = 'staff';
		var conditions = [];
		if (id)  conditions.push("staff.id = " + id) 
		if (clinic) { 
			tables += ', clinic_staff'; 
			conditions.push("clinic_staff.staff_id=staff.id AND clinic_id = " + clinic);
		}

		var query = "SELECT * from " + tables;
		if (conditions.length > 0)  query += " WHERE " + conditions.join(' AND ');
		console.log("staff Q: " + query);

 		Staff.query(query, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			return res.send(result);
	
		});
	},

	schedule: function (req, res) {
		var clinic = req.param('clinic');
		var start = req.param('start');
		var end = req.param('end');
		var staff = req.param('staff');

		var tables = 'appointment';

		var conditions = [];
		
		if (staff)  conditions.push("staff.id = " + staff)
		if (clinic) { 
			tables += ', clinic_staff'; 
			conditions.push("clinic_staff.staff_id=staff.id AND clinic_id = " + clinic);
		}

		var fields = ['vaccinator_id', 'startTime', 'endTime', 'patient_id', 'appointment.id as appointment_id'];
		var left_joins = [];

		var query = "SELECT " + fields.join(',');
		if (tables) query += ' FROM (' + tables + ')';
		if (left_joins.length) { query += " LEFT JOIN " + left_joins.join(' LEFT JOIN ') }
		if (conditions.length) { query += " WHERE " + conditions.join(' AND ') }

		console.log("schedule query: " + query);

 		Staff.query(query, function (err, result) {
			if (err) {
				return res.negotiate(err);
     		}

			if (!result) {
				console.log('no results');
				return res.send('');
			}

			var schedule = {};
			for (var i=0; i<result.length; i++) {
				var staff_id = result[i]['vaccinator_id'];
				if (! schedule[staff_id]) {
					schedule[staff_id] = {};
					schedule[staff_id]['starts'] = [];
					schedule[staff_id]['ends'] = [];
					schedule[staff_id]['patients'] = [];
					schedule[staff_id]['bookings'] = [];
					schedule[staff_id]['appointments'] = [];
				}
				
				schedule[staff_id]['starts'].push(result[i]['startTime']);
				schedule[staff_id]['ends'].push(result[i]['endTime']);
				schedule[staff_id]['patients'].push(result[i]['patient_id']);
				schedule[staff_id]['appointments'].push(result[i]['appointment_id']);
				schedule[staff_id]['bookings'].push( result[i]['startTime'] + '-' + result[i]['endTime']);
			}
			return res.send(schedule);
	
		});		
	},


	edit: function (req, res) {
		console.log("Edit...");
	},

	new: function (req, res) { 
		console.log('new staff form...');
		res.render('clinic/new');
	},

	add: function (req, res) {
		console.log('add staff...');
	},

	manage: function (req, res) { 
		console.log('manage staff...');
	}
	
};

