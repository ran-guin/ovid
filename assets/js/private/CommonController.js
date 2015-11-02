var app = angular.module('myApp');

app.controller('CommonController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'CommonFactory', 
    function ($scope, $q, $rootScope, $http, $location, CommonFactory) {
        console.log('loaded Common Controller');


        $scope.initialize = function( config ) {
        	console.log('common init');
        	$q.when ( $scope.$parent.initialize(config) )
        	.then ( function (res) {

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
		            //$scope.$parent.patient = config['appointment']['patient'];
		            $scope.$parent.vaccinator = config['appointment']['vaccinator'];
		            $scope.$parent.appointment = config['appointment'];

		            var age = moment().diff(moment($scope.patient.birthdate), 'years');
		            console.log('Age: ' + age);
		           	$scope.$parent.patient.age = age;


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
		            $scope.$parent.include = {};
		            $scope.$parent.include.appointment = config['clinic']['appointments'];
		            console.log("loaded " + $scope.clinic.appointments.length + " clinic appointments");
		            console.log("equals " + $scope.include.appointment.length + " clinic appointments");
		        }   

		        if (config && config.token) {
		        	console.log('saved token to angular scope');
		        	$scope.$parent.token = config.token;
		        } 
		 
		        $scope.setup(config);
		    });
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
	        $scope.$parent.travel = travel;
	    }
}]);
