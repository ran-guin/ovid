var app = angular.module('myApp');

app.controller('CommonController', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'CommonFactory', 
    function ($scope, $q, $rootScope, $http, $location, CommonFactory) {
        console.log('loaded Common Controller');


	    var start = new Date();
	    $scope.timestamp = start.toISOString().slice(0, 19).replace('T', ' '); 
	        
	    $scope.lastMonth = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000 ).toISOString();
	    $scope.nextMonth = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000 ).toISOString();

	    /** timer with date + hours + minutes - automatically updates  **/
	    var update_seconds = 1;
	    setInterval (function() {
	        var now = new Date();
	        $scope.now = now;

	        $scope.timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
	        $scope.created = now.toISOString().slice(0, 19).replace('T', ' ');

	        $scope.$apply();
	    }, update_seconds*1000);

        $scope.setup = function( config ) {
        	console.log('common setup');
        	$scope.$parent.setup(config);

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
		        	console.log('saved token to angular scope ' + config.token);
		        	$scope.$parent.token = config.token;
		        } 
		        /*
		        if (config && config.payload) {
		        	console.log('saved payload ' + config.payload);
		        	$scope.$parent.payload = config.payload;
		        } 
*/
		 
		        
		    });
	    }

	    $scope.loadTravel = function (patient_id) {
	        console.log("load travel plans for patient #" + patient_id);
	        
	        var url = '/travel/recommendations?patient=' + patient_id;

	        return $http( {
	            method: 'GET',
	            url : url,
	            headers : { authorization : "Bearer " + $scope.token}
	            }
	        )
	        .then ( function (response) {
	        	if (response.data) {
	        		console.log("Travel response: " + JSON.stringify(response.data));
	            	$scope.$parent.travel = response.data;
	        	}
	        },
	        function (err) { 
	        	console.log("Error getting travel details: " + err);
	        },
	        function (update) {
	        	console.log("update: " + update)
	        });

	    }

}]);
