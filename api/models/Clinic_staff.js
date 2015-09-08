/**
* Clinic_staff.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    staff_id : {
        model : 'staff'
    },
    clinic_id : {
        model : 'clinic'
    },
    
    on_duty : {
        type : 'time'
    },
    off_duty : {
        type : 'datetime'
    },

    dutyStatus : {
        type: 'string',
        enum: ['On Duty', 'Off Duty']
    }
  }
};

