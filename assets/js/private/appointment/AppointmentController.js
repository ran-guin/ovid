'use strict';

var app = angular.module('myApp');

app.controller('AppointmentController', 
    ['$scope', '$http', '$q', 'Nto1Factory',
    function appointmentController ($scope, $http, $q, Nto1Factory) {

    console.log('loaded appointment controller');        
    $scope.context = 'Appointment';

    $scope.debugMode = false;

    $scope.testMessage = {
       text: 'hello world!',
       time: new Date()
    };
    
    var start = moment([2007, 0, 5]);
    var end   = moment([2007, 0, 10]);
    $scope.tester = end.to(start);       // "5 days ago"

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.setup(config);
        $scope.$parent.itemClass = 'treatment';
        $scope.$parent.mainClass = 'appointment';
        
        $scope.$parent.statusField = 'status';
        $scope.$parent.statusDefault = 'In Process';

        /* Customize as Required */

        $scope.$parent.statusOptions = ['Scheduled', 'Waiting', 'In Process', 'Cancelled', 'Completed'];
 
        $scope.Columns = [
            { field : 'clinic.id', set: 1},
            { field : 'clinic.name' },
            { field : 'clinic.address' },
            { field : 'user.name', label : 'Vaccinator'},
            { field : 'user.id', label : 'VaccinatorId', set: 1},
            { field : 'patient' },
            { field : 'patient.name' },
            { field : 'patient.birthdate' },
            { field : 'appointment.id', label: 'appointment_id'},
        ];

        $scope.itemColumns = [
            { field : 'vaccine.id', set: 1, mandatory : 1, hidden:1},
            { field : 'vaccine.name', label: 'Vaccine'},
            { field : 'disease.name', label: 'Disease'},
            { field : 'treatment.id', label: 'treatment_id'},
            { field : 'site'},
            { field : 'route'},            
            { field : 'lot'},
            { field : 'status'},
            { field : 'notes'},
            { field : 'treatment.id', hidden: 1},
            { field : 'contraindication.condition', label: 'Contraindications' },
            { field : 'side_effect.name', label:'known_side_effect'},
            { field : 'recommendationLevel', label: 'recommendation'}
       ];
    
        /* Load Fields based on fields above using tables / condition below */
        $scope.queryTables = "(clinic, appointment, patient, staff, user)";
        var leftJoins = [
            'treatment ON treatment.appointment_id=appointment.id',
            'vaccine ON treatment.vaccine_id=vaccine.id',
            'contraindication ON contraindication.vaccine_id=vaccine.id',
            'side_effect ON side_effect.vaccine_id=vaccine.id',
        ];
        if (leftJoins.length) {
            $scope.queryTables += ' LEFT JOIN ' + leftJoins.join(' LEFT JOIN ');
        }
        
        $scope.queryCondition = "appointment.clinic=clinic.id AND appointment.patient=patient.id AND appointment.staff=staff.id AND staff.user_id=user.id";
   
        $scope.Autocomplete = {
            url : '/api/search',
            view: 'appointment/Appointment',
            target : 'Vaccine',
            show : "Vaccine, Disease, Contraindications, known_side_effect, recommendation",
            search : "Vaccine, Disease, Contraindications, known_side_effect, recommendation, treatment_id",
            hide: 'id',

            query_table : "(vaccine,  disease_vaccines__vaccine_diseases as DV, disease) LEFT JOIN contraindication ON contraindication.vaccine_id=vaccine.id LEFT JOIN vaccine_side_effect ON vaccine_side_effect.vaccine_id=vaccine.id LEFT JOIN side_effect ON side_effect_id=side_effect.id",
            query_field : "disease.name as Disease, vaccine.name as Vaccine, contraindication.condition as Contraindications, side_effect.name as known_side_effect, recommendationLevel as recommendation, treatment_id",
            query_condition : "DV.vaccine_diseases=disease.id and DV.disease_vaccines=vaccine.id",
            
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "Vaccine, Disease, Contraindications, known_side_effect,recommendation, treatment_id",
            // condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Vaccine found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newPatientModal'> Add New Patient </button></div>\n"
        };

        console.log($scope.Autocomplete['url']);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        //$scope.$parent.setup(config);
    }

    $scope.initialize = function( config ) {
        $scope.setup(config);
        console.log('initialize appointment');
    }

    $scope.syncLookup = function (attribute, id, label) {
      console.log("sync " + attribute);
      console.log(JSON.stringify($scope[attribute]));
      $scope.$parent[id] = $scope[attribute]['id'];
      $scope.$parent[label] = $scope[attribute]['label'];
    }

    $scope.loadRecommendations = function (data) {
        console.log('load recommendations');

        $scope.$parent['recommendations'] = data;
         console.log("got recommendations: " + JSON.stringify(data));
  
        /*
        $http.get("/recommendation")
        .success ( function (response) {
            $scope.$parent['recommendation'] = response;
            console.log("got recommendations: " + JSON.stringify(response));
        });
        */
    }

    $scope.loadPatientHistory = function (patient_id, attr) {
        console.log("Retrieve patient " + patient_id + " History");
        $http.get('/patient/history/' + patient_id)
        .success ( function (response) {
                console.log("Retrieved History");

                $scope.$parent.patient_history = response;
                console.log("HIST: " + JSON.stringify($scope.patient_history)); 

                if (attr) { $scope.$parent[attr] = response }
            })
            .error (function (error) {
                console.log("Error loading history");
                console.log(error);
            });


    }

  /********** Add Item to List of Requests **********/
    $scope.addItem = function () {
        Nto1Factory.addItem( $scope.itemColumns, $scope.items, 'treatment' );
        var index = $scope.items.length - 1;
        console.log('added treatment...');
        $scope.$parent.items[index].status = 'requested';

    }

    $scope.addBarcodedVaccine = function () {
        var barcode = document.getElementById('barcode');
        console.log("Barcode: " + barcode);

        var ids = $scope.loadExamples(['Scanned','Scanned'],[null,null], ['Recommended','Mandatory for Region'],1);

        for (var i=0; i<ids.length; i++) {
            $scope.$parent.items[i].status = 'Scanned';

            var data = {
                'status' : 'Scanned'
            };

            $http.put("/schedule/" + ids[i], JSON.stringify(data))
            .then ( function (res) {
                console.log("Updated status for  " + ids[i]);
            });
        }
 
    }

    $scope.loadPatient = function (id) {
        $scope.$parent.patient = {};
        $scope.$parent.patient.id = id;
    }

// move to ClinicController only ... 
    $scope.loadQueue = function () {
        console.log("LOAD QUEUE");
        var queueExample = [
            {
                appointment_id: 1,
                name: 'Ryan Reynolds',
                age: 55,
                gender: 'M'
            },
            {
                appointment_id: 2,
                name: 'Brenda Reynolds',
                age: 35,
                gender: 'F'
            },            

        ];

//        $http.get(url + '/clinic/queue')

        $scope.$parent.queued = queueExample;
    }

    $scope.loadScheduledVaccinations = function () {
        console.log("Retrieve suggested vaccinations from CDC API (?)");
 
        $scope.loadExamples(['Scheduled','Scheduled'], ['due','overdue'],['Recommended','Mandatory for Region'],0);
    }

    $scope.loadExamples = function (status, due, recommendation, replace) {

        var ids = [];

        var example1 = {
            'Disease' : 'HepA',
            'Vaccine' : "HepA-HepB",
            'lot' : '1234',
            'known_side_effect' : "Nausea",
             'due' : due[0],
            'recommendation' : recommendation[0],
            'vaccine_id' : 24,
            'status' : status[0],
            'appointment_id' : $scope.appointment_id, 
            'defaultRoute' : 'IM - Intramuscular',
        };
        
        ids.push( $scope.applyVaccine(example1, replace) );

        var example2 = {
            'Disease' : 'Yellow Fever',
            'Vaccine' : "Monkeypox",
            'known_side_effect' : "Nausea",
            'Contraindications' : 'Pregnancy',
            'due' : due[1],
            'recommendation' : recommendation[1],
            'vaccine_id' : 28,
            'status' : status[1],
            'appointment_id' : $scope.appointment_id,
            'defaultRoute' : 'IM - Intramuscular',
        };


        ids.push( $scope.applyVaccine(example2, replace) );
        return ids;
    }

    $scope.applyVaccine = function (vaccine, replace) {

        var alreadyTracked = null;

        var data = {
            'vaccine_id' : vaccine['vaccine_id'],
            'status' : vaccine['status'],
            'appointment_id' : vaccine['appointment_id'],
            'route' : vaccine['defaultRoute'],
        };

        for (var i=0; i<$scope.items.length; i++) {
            console.log("Compare " + $scope.items[i]['Vaccine'] + ' with ' + vaccine['Vaccine']);
            if ($scope.$parent.items[i]['Vaccine'] == vaccine['Vaccine']) {
                alreadyTracked = i;
            }
        }

        if (alreadyTracked == null) {
            console.log("Add new vaccine: " + JSON.stringify(vaccine));
            $scope.$parent.items.push(vaccine);
            
            console.log("Post to database (treatment): " + JSON.stringify(data));
            
            var config = { headers : { 'token' : $scope.token }};

            $http.post("/treatment", JSON.stringify(data), config)
            .then ( function (response) {
                console.log("added to database");
                var index = $scope.items.length - 1;
                $scope.$parent.items[index]['treatment_id'] = response['id'];
                return index;
            });

        }
        else if (replace) { 
            console.log("Replace item " + alreadyTracked);
            var keys = Object.keys(vaccine);
            for (var i= 0; i<keys.length; i++) {
                // eg.. maintain due/overdue status if scanned...
                if (vaccine[keys[i]] == null) { vaccine[keys[i]] = $scope.items[alreadyTracked][keys[i]] }  
            }
            $scope.$parent.items[alreadyTracked] = vaccine;
 
            var treatment_id = $scope.items[alreadyTracked]['treatment_id'];

            console.log("update database (treatment) " + treatment_id + ": " + JSON.stringify(data));
            if ($scope.treatement_id) {
                console.log("updated treatment " + $scope.items[alreadyTracked]['treatment_id'] );
                $http.put("/treatment/" + treatment_id , JSON.stringify(data))
                .then ( function (response) {
                    console.log("updated database");
                    return alreadyTracked;
                });
            }
        }

    }

    $scope.loadRecord = function (recordId) {
        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');
        $scope.$parent.customQuery = "Select " + fields + ',' + itemfields;
        $scope.$parent.loadCondition = $scope.mainClass + "_ID = '" + recordId + "'";

        $scope.$parent.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

        console.log($scope.customQuery);
        var url = '/api/q';
        console.log('preload from ' + url);

        /* implement promise */
        var promise =  $scope.$parent.loadRecord(url, recordId, $scope.customQuery);
        $q.when(promise)
        .then ( function (res) {
            // $scope.loadCostCentre();
            $scope.loadNextStatus();
            Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus); 
            console.log('apply user  ' + $scope.user);

            $scope.updateTotals();
            $scope.$parent.highlightBackground = "background-color:#9C9;";

        });

    }


    $scope.saveChanges = function (status) {
        var data = {

         };         

        var jsonData = JSON.stringify(data);
        var url = '/api/update/' + $scope.mainClass + '/' + $scope.recordId;

        $q.when ($scope.$parent.saveChanges(url, jsonData))
        .then ( function () {
            $scope.loadRecord($scope.recordId);
            console.log('reload ' + $scope.recordId);
            // Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus);  
        });

    }

    /********** Save Request and List of Items Requested **********/
    $scope.createRecord = function() {
            console.log("Post " + $scope.mainClass);

            for (var i=0; i<$scope.items.length; i++) {

            }

            var data = { 
                'FKDesk_User__ID' : $scope.userid, 
                'Queue_Creation_Date' : $scope.timestamp,
                'FK_appointment__ID' : $scope.appointment_ID,
                'Queue_Status' : 'Active',
                'items' : $scope.items,
                'map'   : $scope.itemSet,
            }; 

            var jsonData = JSON.stringify(data);
            var url = "/queue/create";
            $q.when($scope.$parent.createRecord(url, jsonData))
            .then ( function (response) {
                console.log('got response');
                console.log(response);

                console.log(JSON.stringify($scope.createdRecords));
                var created = $scope.createdRecords[$scope.createdRecords.length-1];
                $scope.$parent.recordId = created['id'];

                var link = "Queue #" + $scope.recordId + ' created : ' + created['description']
                console.log('created Queue # ' + $scope.recordId);
                
                $scope.clearScope();
                $scope.$parent.mainMessage = link;
                // $('#topMessage').html(link);

            });           
    }

    $scope.dumpLocalScope = function () {
        console.log("*** Dumped Local Attribute List **");
        for (var i= 0; i<$scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            console.log(att + ' = ' + $scope[att]);
            if ($scope.$parent[att] && $scope.$parent[att] != $scope[att]) { console.log("** Parent  " + att + " = " + $scope.$parent[att]) }
        }

        console.log('id: ' + $scope.recordId);
        console.log('url: ' + $scope.url + ' : ' + $scope.$parent.url);
        console.log('config: ' + JSON.stringify($scope.config))
        console.log('P config: ' + JSON.stringify($scope.$parent.config))

        console.log("** message **");
        console.log($scope.mainMessage);
        console.log("** Local Items: **");
        for (var i= 0; i<$scope.items.length; i++)  {
            console.log(JSON.stringify($scope.items[i]))
        }
        console.log("** item Maps **");
        console.log('Set: ' + JSON.stringify($scope.Set));
        console.log('ReSet: ' + JSON.stringify($scope.Reset));
        console.log('Map: ' + JSON.stringify($scope.Map));
        console.log('item Set: ' + JSON.stringify($scope.itemSet));
        console.log('item ReSet: ' + JSON.stringify($scope.itemReset));
        console.log('item Map: ' + JSON.stringify($scope.itemMap));
        console.log("**Local Lookups: **");
        console.log(JSON.stringify($scope.Lookup));
        console.log("** DB logs **");
        console.log(JSON.stringify($scope.createdRecords));
        console.log(JSON.stringify($scope.editedRecords));
    }
}]);
