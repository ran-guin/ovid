'use strict';

var app = angular.module('myApp');

app.controller('ClinicController', 
    ['$scope', '$http', '$q', 'Nto1Factory',
    function clinicController ($scope, $http, $q, Nto1Factory) {

    console.log('loaded clinic controller');        

    /** Interact with standard N21 controller **/

    /** phased out ?? **/
    // $scope.$on('listUpdated', function() {
    //     $scope.items = Nto1Factory.items;
    //     console.log(' service updated list to ' + $scope.items.length);
    // });

    /** timer with date + hours + minutes - automatically updates  **/
    var update_seconds = 1;    
    setInterval (function() {

        if ($scope.recordStatus == 'Draft') { 
          $scope.$parent.created = $scope.timestamp; 
        }
        if ($scope.items) {
            for (var i=0; i < $scope.items.length; i++) {
                $scope.items[i].Wait_Time = Nto1Factory.timediff($scope.items[i].Arrival_Time, $scope.now);
            }
        }
        $scope.$apply();
    }, update_seconds*1000);


    $scope.exampleData = [ {'id' : 1, 'label' : 'ABCDEFG'}, { 'id': 2, 'label' : 'HIJKLMNOP'}];
    $scope.Clinics = [];
    $scope.title = "TEST TITLE";

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.itemClass = 'appointment';
        $scope.$parent.mainClass = 'clinic';
        
        $scope.$parent.statusField = 'status';
        $scope.$parent.statusDefault = 'Active';

        /* Customize as Required */

        /* Set clinic details at login ... */
        $scope.$parent.clinicId = 1;
        $scope.deskStaff = 'Ran';


        $scope.$parent.statusOptions = ['Active', 'Closed', 'Terminated'];
 
        $scope.Columns = [
            { field : 'clinic.id', label: 'clinic_id', set: 1},
            { field : 'clinic.name', label: 'Clinic'},
            { field : 'clinic.address' },
            { field : 'region_id'},
            { field : 'appointment.id' },
            { field : 'user.name', label : 'deskStaff'},
            { field : 'user.id', label : 'deskStaffId', set: 1},
        ];

        $scope.itemColumns = [
            { field : 'patient.id', label: 'patient_id', set: 1, mandatory : 1, hidden:1},
            { field : 'lastName'},
            { field : 'firstName'},
            { field : 'identifier'},
            { field : 'identifierType'},
            { field : 'gender'},
            { field : "DATE_FORMAT(patient.birthdate,'%b %d, %y')", label: 'birthdate', type: 'date'},
            { field : 'appointment.status', hidden: 1},
  //          { field : 'queue.position', hidden: 1},
  //         { field : 'Wait_Time', hidden: 1},
            { field : 'Vaccinator.id', label : 'VaccinatorId', hidden: 1},
            { field : 'Vaccinator.name', label : 'Vaccinator', hidden: 1},
            // { field : 'Age'},
            { field : 'notes'},
            // { field : 'appointment_Reason'},
            { field : 'treatment.id', hidden: 1},
            { field : 'site', hidden: 1},
            { field : 'route', hidden: 1},
            { field : 'position'}

      //      { field : 'appointment_Reason'},
      //      { field : 'appointment_Reason_ID', hidden: 1},
       ];
    
        /* Load Fields based on fields above using tables / condition below */
        $scope.queryTables = "(clinic, appointment)";
        var leftJoins = [
            'patient ON appointment.patient_id=patient.id',
            'clinic_staff ON clinic_id=clinic.id',
            'staff ON clinic_staff.staff_id=staff.id',
            'user as Vaccinator ON Vaccinator.id=staff.user_id',
            'treatment ON treatment.appointment_id=appointment.id',
        ];
        if (leftJoins.length) {
            $scope.queryTables += ' LEFT JOIN ' + leftJoins.join(' LEFT JOIN ');
        }
        
        $scope.queryCondition = "appointment.clinic_id=clinic.id";
   
        $scope.Autocomplete = {
            url : '/api/search',
            view: 'clinic/Clinic',
            target : 'lastName',
            show : "patient_id,lastName,firstName,gender,birthdate, identifier, identifierType",
            search : "patient_id,lastName,firstName,identifier, gender,birthdate",
            hide: 'patient_id',
            query_table : "patient",
            query_field : "patient.id as patient_id,lastName,firstName,gender,identifier, DATE_FORMAT(patient.birthdate,'%b %d, %y') as birthdate, position",
            query_condition : "1",
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "patient_id,lastName,firstName,identifier,gender,birthdate",
            // condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Patients found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newPatientModal'> Add New Patient </button></div>\n"
        };

        console.log($scope.Autocomplete['url']);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        $scope.$parent.setup(config);
    }

      $scope.syncLookup = function (attribute, id, label) {
          console.log("sync " + attribute);
          console.log(JSON.stringify($scope[attribute]));
          $scope.$parent[id] = $scope[attribute]['id'];
          $scope.$parent[label] = $scope[attribute]['label'];
      }

    $scope.initialize = function( config ) {

        console.log("local init: " + config);
        if (config && config['User']) { 
            console.log("loaded user attributes");
            $scope.user = config['User'];
        }
        if (config && config['clinic']) { 
            console.log("loaded clinic attributes");
            $scope.clinic = config['clinic'];
        }
        if (config && config['patient']) { 
            console.log("loaded patient attributes");
            $scope.patient = config['patient'];
        }       

        $scope.$parent.highlightBackground = "background-color:#9C9;";
        var highlight_element = document.getElementById('clinicTab');
        if (highlight_element) {
            highlight_element.style=($scope.highlightBackground)
        }

        $scope.setup(config);

        $scope.$parent.initialize(config);

        if ($scope.recordId) { $scope.loadRecord($scope.recordId) }
        else {
            console.log("Initialize " + $scope.statusField + '=' + $scope.statusDefault);
            if ($scope.statusField ) {
                if ($scope[$scope.statusField] === undefined) {
                    $scope.$parent[$scope.statusField] = $scope.statusDefault;
                    console.log('set default status to' + $scope.recordStatus);
                }
                Nto1Factory.setClasses($scope.statusOptions, $scope[$scope.statusField]);  
            }
        }

        $scope.ac_options = JSON.stringify($scope.Autocomplete);

        $scope.$parent.manualSet = []; /* 'Request_Notes'];  /* manually reset */
    }


  /********** Add Item to List of Requests **********/
    $scope.addItem = function( ) {
        Nto1Factory.addItem( $scope.itemColumns, $scope.items );
        var index = $scope.items.length - 1;
        console.log('add patient to queue ');

        $scope.$parent.items[index].status = 'Queued';
        $scope.$parent.items[index].Arrival_Time = $scope.now;
        $scope.$parent.items[index].staff_id = $scope.user.id;
        $scope.$parent.items[index].clinic_id = $scope.clinic.id;

       $scope.$parent.items[index].position = $scope.items.length;

        var data = JSON.stringify($scope.items[index]);

        console.log("Data: " + data );

        $http.post("/appointment", data)
        .then ( function (res) {
            console.log("Added queued patient");
            console.log(JSON.stringify(res));

        });
    }

    $scope.loadRecord = function (recordId) {
        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');
        $scope.customQuery = "Select " + fields + ',' + itemfields;
        $scope.loadCondition = $scope.mainClass + "_ID = '" + recordId + "'";

        $scope.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

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
            $scope.highlightBackground = "background-color:#9C9;";

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

    $scope.changeDuty = function (index, status) {
        console.log("Reset duty to " + status)
        if ($scope.clinic && $scope.clinic.staff[index]) {
            $scope.clinic.staff[index].status = status;
        }
    }

    $scope.loadStaff = function () {
        console.log('load Staff');

    }

    $scope.focusPatient = function (patient_id) {
        console.log("focus on patient " + patient_id);
        $scope.activePatient = patient_id;
    }

    $scope.checkAssignments = function (appointment_id) {
        console.log("update staff status... ");
        
        $scope.activeAppointment = appointment_id;

        var startTime;
        var endTime;

        if ($scope.clinic && $scope.clinic.appointments) {
            for (var i=0; i< $scope.clinic.appointments.length; i++) {
                if ( $scope.clinic.appointments[i]['id'] == appointment_id ) {
                    startTime = $scope.appointments[i]['startTime'];
                    endTime = $scope.appointments[i]['endTime'];
                }
            }

            $http.get("/staff/schedule/" + $scope.clinic.id + "?start=" + startTime + "&end=" + endTime)
            .then ( function (response) {
                for (var i=0; i<$scope.clinic.staff.length; i++) {
                    var staff_id = $scope.clinic.staff[i]['id'];
                    if (response[staff_id]) {
                        $scope.clinic.staff[i].schedule = response[staff_id]['bookings'].join("<BR>");
                        $scope.clinic.staff[i].assignedTo = response[staff_id]['between'];
                    }
                }
            });
        }
    }

    $scope.assignStaff = function (index, staff_id) {
        console.log("Assign staff " + staff_id + ' to ' + $scope.activeAppointment);
        $scope.clinic.staff[index]['assigned'] = $scope.activeAppointment;
        $scope.clinic.staff[index]['assignedTo'] = $scope.activeAppointment;
   }
    
    $scope.deassignStaff = function (index, staff_id) {
        console.log(" DeAssign staff " + staff_id + ' from ' + $scope.clinic.staff[index]['assignedTo'] );
        $scope.clinic.staff[index]['assigned'] = null;
        $scope.clinic.staff[index]['assignedTo'] = null;
   }
    /********** Save Request and List of Items Requested **********/
    $scope.createRecord = function() {
            console.log("Post " + $scope.mainClass);

            for (var i=0; i<$scope.items.length; i++) {

            }

            var data = { 
                'FKDesk_User__ID' : $scope.userid, 
                'Queue_Creation_Date' : $scope.timestamp,
                'FK_Clinic__ID' : $scope.Clinic_ID,
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
                $scope.recordId = created['id'];

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
