angular.module('SignupModule').controller('SignupController', ['$scope', '$http', 'toastr', function($scope, $http, toastr) {

        // set-up loading state
        $scope.status = {
                loading: false
        }

        Sscope.signup = function () {
        	alert("SIGNING UP");
        }

}]);
