var app = angular.module('myApp');

app.controller('CommonController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'CommonFactory', 
    function ($scope, $q, $rootScope, $http, $location, CommonFactory) {
        console.log('loaded Common Controller');


        $scope.initialize = function( config ) {

	        console.log("Appointment init: " + JSON.stringify(config));
	        
	        if (config && config['User']) { 
	            console.log("loaded user attributes");
	            $scope.$parent.user = config['User'];
	        }
	        if (config && config['clinic']) { 
	            console.log("loaded clinic attributes in Appointment init");
	            $scope.$parent.clinic = config['clinic'];
	        }
	        if (config && config['patient']) { 
	            console.log("loaded patient attributes");
	            $scope.$parent.patient = config['patient'];
	        }
	        if (config && config['appointment']) { 
	            console.log("loaded appointment attributes");

	            $scope.$parent.clinic = config['appointment']['clinic'];
	            $scope.$parent.patient = config['appointment']['patient'];
	            $scope.$parent.vaccinator = config['appointment']['vaccinator'];
	            $scope.$parent.appointment = config['appointment'];
	        }
	        if (config && config['treatments']) {
	            console.log('load treatments...');
	            $scope.$parent.treatments = config['treatments'];

	        }
	        if (config && config['protectionMap']) {
	            $scope.$parent.protectionMap  = config['protectionMap'];
	            console.log('load protection map: ' + JSON.stringify($scope.protectionMap));

	        }
	        if (config && config['schedule']) {
	            $scope.$parent.schedule  = config['schedule'];
	            console.log('load schedule: ' + JSON.stringify($scope.schedule));
	        }
	        if (config && config['schedule']) {
	            $scope.$parent.schedule  = config['schedule'];
	            console.log('load schedule: ' + JSON.stringify($scope.schedule));
	        }
	 
	 
	        if (config && config['clinic'] && config['clinic']['appointments']) {
	            console.log("Start with " + $scope.items.length);
	            $scope.$parent.items = config['clinic']['appointments'];
	            console.log("loaded " + $scope.items.length + " clinic appointments");
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

	        $scope.$parent.ac_options = JSON.stringify($scope.Autocomplete);

	        $scope.$parent.manualSet = []; /* 'Request_Notes'];  /* manually reset */
	    }

    }
]);
