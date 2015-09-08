/**
* Schedule.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes : {
    patient_id : {
        model: 'patient'
    },
    vaccine_id : {
        model: 'vaccine'
    },
    due : {
        type: 'date'
    },
    type : {
        type: 'string',
        enum: ['Standard','Travel','Risk Group','Risk Group','Requested']
    },
    recommendation : {
        type: 'string',
        enum : ['Mandatory','Recommended','Optional','Discouraged']
    },
    status : {
        type: 'string',
        enum: ['Scheduled','Scanned', 'Declined','Taken']
    },
    notification_status : {
        type: 'string',
        enum: ['Notified','Acknowledged']
    }
  }
};

