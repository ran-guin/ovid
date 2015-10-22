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
	 
	        if (config && config['clinic'] && config['clinic']['appointments']) {
	            console.log("Start with " + $scope.clinic.appointments.length);
	            $scope.$parent.items = config['clinic']['appointments'];
	            console.log("loaded " + $scope.clinic.appointments.length + " clinic appointments");
	        }    
	 
	        $scope.setup(config);

	        $scope.$parent.initialize(config);

	    }

    }
]);
