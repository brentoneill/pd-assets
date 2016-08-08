'use strict';

/**
 * @ngdoc overview
 * @name pdImageCrop
 *
 * @description
 * Directives for cropping and uploading image files.
 */

angular.module('pdFontUpload', [
        'ngFileUpload'
    ])
    /**
     * @ngdoc directive
     * @name pdImageCrop
     *
     * @description
     * Adds an image uploader and cropper, and allows upload after image has been prepared.
     * Attributes/scope variables:
     *   imgData: json containing image urls and other relevant information
     *
     * @attr ngFileUpload github: https://github.com/danialfarid/ng-file-upload
     *
     * @example
     * <div pd-font-upload
     *      file-data="data.primary_font"
     *      end-point="$api/files"
     *      on-delete-file="onFontDelete"
     *      after-upload="afterFontUpload"
     *      on-upload-error="fontUploadError"
     *      class="row text-center mbl"></div>
     */
    .directive('pdFontUpload', function (Upload) {
        return {
            templateUrl: 'pd-font-upload/pd-font-upload.html',
            scope: {
                endPoint: '@',
                fileData: '=',
                onDeleteFile: '=',
                afterUpload: '=',
                onUploadError: '='
            },
            controller: function ($scope) {
                $scope.uploading = false;

                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                };

                /**
                 * Removes font from uploader
                 */
                $scope.promptDeleteFile = function () {
                    $scope.showDetails = false;
                    $scope.uploading = false;
                    $scope.onDeleteFile && $scope.onDeleteFile();
                };

                $scope.uploadFile = function () {
                    // while upload is in progress
                    var uploadProgress = function (evt) {
                        // console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        $scope.uploading = true;
                    };

                    // when upload is in successful
                    var uploadSuccess = function (res) {
                        // file is uploaded successfully
                        $scope.fileData = res.data;
                        $scope.uploading = false;
                        $scope.afterUpload && $scope.afterUpload(res);
                    };

                    // when upload produces an error
                    var uploadError = function (res) {
                        $scope.uploading = false;
                        $scope.onUploadError && $scope.onUploadError(res);
                    };

                    $scope.upload = Upload.upload({
                            url: $scope.endPoint + '?template=app_font',
                            method: 'POST',
                            data: {},
                            file: $scope.file
                        })
                        .progress(uploadProgress)
                        .success(uploadSuccess)
                        .error(uploadError);
                };
            },
            link: function (scope, element) {
            }
        }
    });
