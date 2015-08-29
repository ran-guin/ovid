'use strict';

var app = angular.module('myApp');

app.controller('VisitController', 
    ['$scope', '$http', '$q', 'Nto1Factory',
    function clinicController ($scope, $http, $q, Nto1Factory) {

    console.log('loaded clinic controller');        

    $scope.debugMode = false;

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.itemClass = 'treatment';
        $scope.$parent.mainClass = 'visit';
        
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
            { field : 'patient_id' },
            { field : 'patient.name' },
            { field : 'patient.birthdate' },
        ];

        $scope.itemColumns = [
            { field : 'vaccine.id', set: 1, mandatory : 1, hidden:1},
            { field : 'vaccine.name', label: 'Vaccine'},
            { field : 'disease.name', label: 'Disease'},
            { field : 'site'},
            { field : 'route'},            
            { field : 'lot'},
            { field : 'status'},
            { field : 'notes'},
            { field : 'treatment.id', hidden: 1},
            { field : 'contraindication.condition', label: 'Contraindications' },
            { field : 'known_side_effect' },
            { field : 'recommendationLevel', label: 'recommendation'}
       ];
    
        /* Load Fields based on fields above using tables / condition below */
        $scope.queryTables = "(clinic, visit, patient, staff, user)";
        var leftJoins = [
            'treatment ON treatment.visit_id=visit.id',
            'vaccine ON treatment.vaccine_id=vaccine.id',
            'contraindication ON contraindication.vaccine_id=vaccine.id',
            'side_effect ON side_effect.vaccine_id=vaccine.id',
        ];
        if (leftJoins.length) {
            $scope.queryTables += ' LEFT JOIN ' + leftJoins.join(' LEFT JOIN ');
        }
        
        $scope.queryCondition = "visit.clinic_id=clinic.id AND visit.patient_id=patient.id AND visit.staff_id=staff.id AND staff.user_id=user.id";
   
        $scope.Autocomplete = {
            url : '/api/search',
            view: 'visit/Visit',
            target : 'Vaccine',
            show : "Vaccine, Disease, Contraindications, known_side_effect, recommendation",
            search : "Vaccine, Disease, Contraindications, known_side_effect, recommendation",
            hide: 'id',

            query_table : "(vaccine,  disease_vaccines__vaccine_diseases as DV, disease) LEFT JOIN contraindication ON contraindication.vaccine_id=vaccine.id LEFT JOIN side_effect ON side_effect.vaccine_id=vaccine.id",
            query_field : "disease.name as Disease, vaccine.name as Vaccine, contraindication.condition as Contraindications, known_side_effect, recommendationLevel as recommendation",
            query_condition : "DV.vaccine_diseases=disease.id and DV.disease_vaccines=vaccine.id",
            
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "Vaccine, Disease, Contraindications, known_side_effect,recommendation",
            // condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Vaccine found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newPatientModal'> Add New Patient </button></div>\n"
        };

        console.log($scope.Autocomplete['url']);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        $scope.$parent.setup(config);
    }

/** redundant ? **/
$scope.$parent.MenuSettings = {
    closeOnSelect: true,
    selectionLimit: 1,
    enableSearch: true,
    showCheckAll: false,
    showUncheckAll: false,
    externalIdProp: '',
    smartButtonMaxItems: 3,
    smartButtonTextConverter: function(itemText, originalItem) {
        return itemText;
    }
};

      $scope.syncLookup = function (attribute, id, label) {
          console.log("sync " + attribute);
          console.log(JSON.stringify($scope[attribute]));
          $scope.$parent[id] = $scope[attribute]['id'];
          $scope.$parent[label] = $scope[attribute]['label'];
      }

    $scope.initialize = function( config ) {

        console.log("local init: " + JSON.stringify(config));
        
        if (config && config['me']) { 
            console.log("loaded user attributes");
            $scope.me = config['me'];
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
    $scope.addItem = function () {
        Nto1Factory.addItem( $scope.itemColumns, $scope.items );
        var index = $scope.items.length - 1;
        console.log('added treatment...');
        $scope.$parent.items[index].status = 'requested';

    }

    $scope.loadTravel = function () {
        console.log("load travel plans...");
        var travel = [
            {
                'region' : 'South America',
                'start'  : '2015-09-01',
                'finish' : '2015-10-01',
            },{
                'region' : 'Spain',
                'start'  : '2016-02-01',
            }
        ];
        $scope.travel = travel;
    }

    $scope.addBarcodedVaccine = function () {
        var barcode = document.getElementById('barcode');
        console.log("Barcode: " + barcode);

        $scope.loadExamples(['scanned','scanned'],[null,null], ['Recommended','Mandatory for Region'],1);
 
    }

    $scope.loadQueue = function () {
        console.log("LOAD QUEUE");
        var queueExample = [
            {
                id: 1,
                patient: 'Ryan Reynolds',
                age: 55,
            },
            {
                id: 2,
                patient: 'Brenda Reynolds',
                age: 35,
            },            

        ];

        $scope.queued = queueExample;
    }

    $scope.loadScheduledVaccinations = function () {
        console.log("Retrieve suggested vaccinations from CDC API (?)");
 
        $scope.loadExamples(['scheduled','scheduled'], ['due','overdue'],['Recommended','Mandatory for Region'],0);
    }

    $scope.loadExamples = function (status, due, recommendation, replace) {
        var example1 = {
            'Disease' : 'HepA',
            'Vaccine' : "Example Vaccine",
            'lot' : '1234',
            'known_side_effect' : "Nausea",
            'status' : status[0],
            'due' : due[0],
            'recommendation' : recommendation[0],
        };
        $scope.applyVaccine(example1, replace);

        var example2 = {
            'Disease' : 'Yellow Fever',
            'Vaccine' : "Yellow Fever vaccine",
            'known_side_effect' : "Nausea",
            'Contraindications' : 'Pregnancy',
            'status' : status[1],
            'due' : due[1],
            'recommendation' : recommendation[1],
        };

        $scope.applyVaccine(example2, replace);
    }

    $scope.applyVaccine = function (vaccine, replace) {

        var alreadyTracked = null;
        for (var i=0; i<$scope.items.length; i++) {
            console.log("Compare " + $scope.items[i]['Vaccine'] + ' with ' + vaccine['Vaccine']);
            if ($scope.items[i]['Vaccine'] == vaccine['Vaccine']) {
                alreadyTracked = i;
            }
        }
        if (alreadyTracked == null) {
            console.log("Add new vaccine: " + JSON.stringify(vaccine));
            $scope.$parent.items.push(vaccine);
        }
        else if (replace) { 
            console.log("Replace item " + alreadyTracked);
            var keys = Object.keys(vaccine);
            for (var i= 0; i<keys.length; i++) {
                // eg.. maintain due/overdue status if scanned...
                if (vaccine[keys[i]] == null) { vaccine[keys[i]] = $scope.items[alreadyTracked][keys[i]] }  
            }
            $scope.$parent.items[alreadyTracked] = vaccine;
        }

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

    /********** Save Request and List of Items Requested **********/
    $scope.createRecord = function() {
            console.log("Post " + $scope.mainClass);

            for (var i=0; i<$scope.items.length; i++) {

            }

            var data = { 
                'FKDesk_User__ID' : $scope.userid, 
                'Queue_Creation_Date' : $scope.timestamp,
                'FK_Visit__ID' : $scope.Visit_ID,
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
