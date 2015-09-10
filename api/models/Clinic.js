/**
* Clinic.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName     : 'clinic',

  attributes: {
    // The clinic's full name
    // e.g. 
    name: {
      type: 'string',
      required: true,
      unique: true,
    },

    // The clinic's email address
    // e.g. nikola@tesla.com
    email: {
      type: 'email',
      required: true,
    },

    // The street address of the clinic
    // 
    address: {
      type: 'string',
      required: true
    },

    // postal code for clinic
    postalCode: {
      type: 'date',
      required: true,
    },

    // fax number if applicable (for requisitions if required)
    faxNumber: {
      type: 'string'
    },

    // phone number for front desk (may change to many to one later)
    phoneNumber: {
      type: 'string',
      required: true
    },

    // foreign key to region
    region_id: {
      type: 'integer'
    },

    // enable clinic status to be verified 
    verificationStatus: {
    	type: 'string',
    	enum: ['Pending','Verified'],
    	defaultsTo: 'Pending'
    },

    staff: {
        collection: 'staff',
        via: 'clinics'
    }
  },

  load: function (input, cb) {
          var fields = ['clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 'user.name as user', 'staff.id as staff_id', 'user.name as staff', 'staff.role', 'CS.dutyStatus'];
          var tables = "clinic";
          var left_joins = [
             "clinic_staff AS CS ON CS.clinic_id=clinic.id",
            "staff ON CS.staff_id=staff.id",
            "user on staff.user_id=user.id"
          ];

      var conditions = [];
      var group = [];

      var clinic_id;
      if ( input['clinic_id'] ) { 
        clinic_id = input['clinic_id'];
        conditions.push("clinic.id = " + input['clinic_id']);
      }
 
      var query = "SELECT " + fields.join(',');
      if (tables) query += ' FROM (' + tables + ')';
      if (left_joins.length) { query += " LEFT JOIN " + left_joins.join(' LEFT JOIN ') }
      if (conditions.length) { query += " WHERE " + conditions.join(' AND ') }
      if (group.length) { query += " GROUP BY " + group.join(',') }

      console.log("Clinic Query: " + query);
    
      Clinic.query(query, function (err, result) {
        if (err || (result == undefined) ) { 
          console.log("No result...");
          return cb(err)
        }

        console.log("CLINIC INFO: " + JSON.stringify(result));

        var clinicStaff = [];
        var appointments = [];

        if (result) {
          for (var i=0; i<result.length; i++) {
            var staffInfo = {
              'id' : result[i]['staff_id'],
              'name' : result[i]['staff'],
              'role' : result[i]['role'],
              'status' : result[i]['dutyStatus'],
            }
            clinicStaff.push(staffInfo);
          }
         
          var info = {};

          info['clinic'] = {
            id: result[0]['clinic_id'],
            name: result[0]['clinic'],
            address: result[0]['address'],
            staff: clinicStaff,
          };

          if (clinic_id) {
            // Load appointments             
            Appointment.load({'clinic_id' : clinic_id}, function (err, result) {          
              if (err) {  return res.negotiate(err) }

              if (!result) {
                console.log('no results');
                return res.send('');
              }
              
              if (result['appointments']) {
                info['clinic']['appointments'] = result['appointments'];
              }
              if (result['schedule']) {
                info['schedule'] = result['schedule'];
              }
              return cb(null, info);
            });
          }  
          else { 
            console.log("no clinic id");                  
            return cb(null, info);
          }
        }
       
    });     

  }

};

