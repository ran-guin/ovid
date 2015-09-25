/**
 * DemoController
 *
 * @description :: Server-side logic for managing demoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var q = require('q');

module.exports = {


    test : function (req, res) {
        console.log("Run Demo Test");

        res.send({"DEMO" : "OKAY"});
    },
    
    patient : function (req, res) {
        console.log("Run Patient Demo");

     
        var demoClinic = 1;
        var demoUser = 'demoNurse';

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {
            res.send({"DEMO Patient Data: " : userData});
        })
        .catch ( function (error) {
            res.send( { "Error" : "error loading user" });
        });     
    },

    clinic : function (req, res) {
        console.log("Run Clinic Demo");
     
        var demoClinic = 1;
        var demoUser = 'demoNurse';
 
        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {
   
            req.session.param['User'] = userData;
 
            Clinic.load( {'clinic_id' : demoClinic, include : { staff: true, appointments : true} }, function (err, clinicData) {         
                if (err) {
                  console.log('no results');
                  return res.send('');
                }

                console.log("loaded data...");

                var page = { 
                    item_Class : 'patient',
                    search_title : "Search for Patients using any of fields below",
                    add_to_scope : true
                };

                req.session.param['page'] = page;    
                req.session.param['clinic'] = clinicData;

                console.log("PARAMS: " + JSON.stringify(req.session.param));
                // res.send({"DEMO Clinic Data: " : req.session.param});
                return res.render('clinic/Clinic', req.session.param);
            });
        });

    },

    appointment : function (req, res) {
        console.log("Run Appointment Demo");

        res.send({"DEMO" : "Appointment"});
    }
};

