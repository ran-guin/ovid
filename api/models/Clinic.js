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
          var fields = ['clinic.name as clinic', 'clinic.id as clinic_id', 'clinic.address', 'user.name as user', 'staff.id as staff_id', 'user.name as staff', 'staff.role', 'visit.id as visit_id', 'CS.dutyStatus'];
          var tables = "clinic";
          var left_joins = [
            "visit ON visit.clinic_id=clinic.id",
            "clinic_staff AS CS ON CS.clinic_id=clinic.id",
            "staff ON CS.staff_id=staff.id",
            "user on staff.user_id=user.id"
          ];

      var conditions = [];

      if ( input['clinic_id'] ) { conditions.push("clinic.id = " + input['clinic_id']) }

     if (input['visit_id']) { 
        conditions.push("visit.id =" + input['visit_id']);
//        left_joins.push("patient on visit.patient_id=patient.id");
        fields.push('patient.firstName', 'patient.lastName', 'patient.gender', "DATE_FORMAT(patient.birthdate,'%b %d, %Y') as birthdate", 'visit.patient_id', "FLOOR(DATEDIFF(CURDATE(), birthdate)/365) as age", "region.name as location");
        tables += ",patient, region";
        conditions.push("patient.id = visit.patient_id");
        conditions.push("patient.region_id=region.id");
      }
 
      var query = "SELECT " + fields.join(',');
      if (tables) query += ' FROM (' + tables + ')';
      if (left_joins.length) { query += " LEFT JOIN " + left_joins.join(' LEFT JOIN ') }
      if (conditions.length) { query += " WHERE " + conditions.join(' AND ') }
      console.log("Q: " + query);
    
      Visit.query(query, function (err, result) {
        if (err || (result == undefined) ) { 
          console.log("No result...");
          return cb(err)
        }

        console.log("CLINIC INFO: " + JSON.stringify(result));

        var clinicStaff = [];
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
          /** load clinic info **/

          /** load clinic info **/ 
          info['clinic'] = {
            id: result[0]['clinic_id'],
            name: result[0]['clinic'],
            address: result[0]['address'],
            staff: clinicStaff, 
          };

          if (result[0]['patient_id']) {
            info['patient'] = {
              id: result[0]['patient_id'],
              firstName: result[0]['firstName'],
              lastName: result[0]['lastName'],
              name: result[0]['firstName'] + ' ' + result[0]['lastName'],
              gender: result[0]['gender'],
              birthdate: result[0]['birthdate'],
              age: result[0]['age'],
              location: result[0]['location'],
              visit_id: result[0]['visit_id'],
            }
          }
        }
        else { 
          console.log("nothing returned");
          return cb("NO RESULT");
        }
        
        return cb(null, info);
    });     

  }

};

