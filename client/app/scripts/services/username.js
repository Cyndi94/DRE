'use strict';

/**
 * @ngdoc service
 * @name phrPrototypeApp.username
 * @description
 * # check if username and email already exist
 * Service in the phrPrototypeApp.
 */
angular.module('phrPrototypeApp')
    .service('username', function username($location, $http) {

        // this.checkLogin = function (inputlogin, callback) {
        // 	$http.get('api/v1/users', {
        // 		username: inputlogin
        // 	})
        // 	.success(function(data) {
        // 		var userInfo = data;
        // 		console.log('searching for username:', inputlogin, userInfo);
        // 		callback(null, data);
        // 	})
        // 	.error(function(data) {
        // 		console.log('error finding username');
        // 	});

        // };

        this.checkLogin = function (callback) {
            $http.get('api/v1/users')
                .success(function (data) {
                    var userInfo = data;
                    // console.log('searching for username:', userInfo);
                    callback(null, userInfo);
                })
                .error(function (data) {
                    console.log('error finding username');
                });

        };

    });
