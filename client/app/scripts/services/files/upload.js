'use strict';

/**
 * @ngdoc service
 * @name phrPrototypeApp.files/upload
 * @description
 * # files/upload
 * Service in the phrPrototypeApp.
 */
angular
    .module('phrPrototypeApp')
    .service('upload', upload);

upload.$inject = ['$http', 'dataservice', 'history'];

function upload($http, dataservice, history) {
    /* jshint validthis: true */
    this.uploadRecord = function (file, check, callback) {
        var uploadUrl = "/api/v1/storage";
        var fd = new FormData();
        //TODO: replace hardcoded reference to file input id
        var ff = document.getElementById('uploadFile').files[0];
        fd.append('file', ff);
        fd.append('check', check);
        console.log("fd", fd);
        $http.put(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .success(function (data) {
                dataservice.forceRefresh();
                history.forceRefresh();
                callback(null, data);
            })
            .error(function (data) {
                callback(data);
            });

    };
}
