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
        var demoUser = 'DemoPatient';

        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {

            console.log(JSON.stringify(userData));
            req.session.param['User'] = userData;

            var user_id = userData.id;

            Patient.load( user_id, function (err, data) {
                if (err) { res.send( { "Error" : "Error loading patient data", message : error }) }
                req.session.param['patient'] = data.patient;
                req.session.param['treatments'] = data.treatments;
                req.session.param['schedule'] = data.schedule;
                req.session.param['protectionMap'] = data.protectionMap;

                console.log("**** Patient Data ***** " + JSON.stringify(data));
                res.render('user/Patient', req.session.param);
            });
 
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
               
            var payload = { id: userData.id, access: 'Demo' };
            var token = null;
            
            console.log("payload: " + JSON.stringify(payload));

            jwToken.issueToken(payload, function(err, result) {
                if (err) { console.log("Error: " + err) }
                else { 
                    req.token = result;
                    req.session.param['token'] = result;

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

                        console.log("Page Input: " + JSON.stringify(req.session.param));
                        // res.send({"DEMO Clinic Data: " : req.session.param});
                        return res.render('clinic/Clinic', req.session.param);
                    });
                }
            });
        });

    },                                                                                                                                                                                                                                                                                                                                                  

    appointment : function (req, res) {
        console.log("Run Appointment Demo");

       var demoAppointment = 1;
        var demoUser = 'demoNurse';
        var region   = 1;

        if (!req.session.param) { req.session.param = {} }

        User.findOne( { name : demoUser} )
        .then ( function ( userData ) {
   
            req.session.param['User'] = userData;
               
            var payload = { id: userData.id, access: 'Demo'};
            var token = null;
            
            console.log("payload: " + JSON.stringify(payload));

            jwToken.issueToken(payload, function(err, result) {
                if (err) { return res.send({'Error' : err }) }
                req.token = result;
                req.session.param['token'] = result;

                Appointment.loadAppointmentPageData( {appointment: demoAppointment}, function (err, data) {
                    if (err) { return res.send( { 'Error' : err }) }

                    console.log("*** set params:" + JSON.stringify(data));
                    req.session.param['page'] = data.page;
                    req.session.param['appointment'] = data.appointment;
                    req.session.param['treatments'] = data.treatments;
                    req.session.param['schedule'] = data.schedule;
                    req.session.param['protectionMap'] = data.protectionMap;

                    return res.render("appointment/Appointment", req.session.param);
                });

            });
        });
    },

    research : function (req, res) {
        console.log('Research Demo');

        return res.render("research/Research", req.session.param);
    }
};

 