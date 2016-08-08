'use strict';

/**
 * @ngdoc overview
 * @name pdImageCrop
 *
 * @description
 * Directives for cropping and uploading image files.
 */

angular.module('pdImageCrop', [
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
 *   imgPreviewSize: string of image preview size; one of ['og', 'lg', 'md', 'sm']
 *   imgClasses: string of classes put on the preview image
 *   afterUpload: function that fires after image has successfully been uploaded; param is json result of API call to upload
 *   onError: function that fires when the image has failed to upload
 *   onDeleteImg: function that fires when user is prompted to delete their current image
 *   endPoint: string representing the url of upload endpoint
 *   cropTemplate: string name of the template type to send to the endpoint (e.g., "user_profile_img")
 *   cropHeight: height of the final image to be cropped
 *   cropWidth: width of the final image to be cropped
 *   borderWidth: size of image overflow border to show behind crop preview
 *   circlePreview: whether to show preview with rounded edges
 *
 * @attr ngFileUpload github: https://github.com/danialfarid/ng-file-upload
 *
 * @example
 * <div pd-image-crop
 *      img-data="data.profile_image"
 *      img-preview-size="md"
 *      img-classes="img img-thumbnail consumer-img"
 *      after-upload="afterImgUpload"
 *      on-error="uploadError"
 *      on-delete-img="promptDeleteImg"
 *      crop-template="user_profile_img"
 *      end-point="/your-api-path/files"
 *      crop-height="300"
 *      crop-width="300"
 *      border-width="15"
 *      circle-preview="false"
 *      class="row text-center mbl"></div>
 */
    .directive('pdImageCrop', function (Upload) {
        return {
            templateUrl: 'pd-image-crop/pd-image-crop.html',
            scope: {
                imgData: '=',
                imgPreviewSize: '@',
                imgClasses: '@',
                afterUpload: '=',
                onError: '=',
                onDeleteImg: '=',
                endPoint: '@',
                cropTemplate: '@',
                cropHeight: '=',
                cropWidth: '=',
                borderWidth: '=',
                circlePreview: '=',
                defaultIcon: '@'
            },
            link: function (scope, element) {
                
                scope.getDimensions = function () {
                    var zoom = element.cropit('zoom'),
                        offset = element.cropit('offset'),
                        imageSize = element.cropit('imageSize'),
                        previewSize = element.cropit('previewSize');

                    scope.cropDimensions = {
                        x: Math.round(-(offset.x / zoom)),
                        y: Math.round(-(offset.y / zoom)),
                        width: Math.round(previewSize.width / zoom),
                        height: Math.round(previewSize.height / zoom)
                    };
                };

                // initialize cropit control
                element.cropit({
                    imageBackground: true, // display image beyond preview area
                    imageBackgroundBorderWidth: scope.borderWidth, // how much of image to display beyond preview area
                    height: scope.cropHeight,
                    width: scope.cropWidth,
                    imageState: {src: scope.imgData ? scope.imgData.original_image_url : ''} // pre-loads profile image if available
                });
            },
            controller: function ($scope) {
                $scope.editing = false;
                $scope.uploading = false;

                // defaults
                var validPreviewSizes = ['og', 'lg', 'md', 'sm'];

                // width of image set to center container
                $scope.previewContainerWidth = $scope.cropWidth + $scope.borderWidth * 2;

                // default to medium preview size if no valid preview size is given with directive
                if (!$scope.imgPreviewSize || validPreviewSizes.indexOf($scope.imgPreviewSize) === -1) {
                    $scope.imgPreviewSize = 'md';
                }

                /**
                 * Removes photo from uploader
                 */
                $scope.promptDeleteImage = function () {
                    // $scope.deleteImage = function () {
                    $scope.showDetails = false;
                    $scope.editing = false;
                    $scope.uploading = false;
                    $scope.onDeleteImg && $scope.onDeleteImg();
                };

                $('.image-edit').click(function (event) {
                    event.stopImmediatePropagation();
                    $(this).next().click();
                });

                $scope.onFileSelect = function ($files) {
                    $scope.profileImg = $files[0];
                    $scope.editing = true;
                };

                $scope.cancel = function () {
                    $scope.editing = false;
                    $scope.showDetails = false;
                    $scope.profileImg = null;
                    $('.cropit-image-input').val('');
                };

                $scope.uploadPhoto = function () {
                    $scope.getDimensions();

                    // while upload is in progress
                    var uploadProgress = function (evt) {
                        // console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        $scope.uploading = true;
                    };

                    // when upload is in successful
                    var uploadSuccess = function (res) {
                        // file is uploaded successfully
                        $scope.imgData = res.data;
                        $scope.editing = false;
                        $scope.uploading = false;
                        $scope.afterUpload && $scope.afterUpload(res);
                        $('.cropit-image-input').val('');
                    };

                    // when upload produces an error
                    var uploadError = function (res) {
                        $scope.uploading = false;
                        $scope.editing = false;
                        $scope.uploadError && $scope.uploadError(res);
                    };

                    $scope.upload = Upload.upload({
                            url: $scope.endPoint + '?template=' + $scope.cropTemplate,
                            method: 'POST',
                            data: { crop_dimensions: $scope.cropDimensions },
                            file: $scope.profileImg
                        })
                        .progress(uploadProgress)
                        .success(uploadSuccess)
                        .error(uploadError);
                };
            }
        };
    })

    .directive('pdSlideshowImageCrop', function (Upload) {
        return {
            templateUrl: 'pd-image-crop/pd-slideshow-image-crop.html',
            scope: {
                // the image data
                image: '=',
                // the slide number
                number: '@',
                // the end point to post the image file to
                endPoint: '@',
                // the corp template to use for the image, i.e., slideshow_img
                cropTemplate: '@',
                // crop dimensions, height and width
                cropWidth: '@',
                cropHeight: '@',
                // optional function to fire on error of upload
                onError: '=',
                // optional function to fire after successful upload
                afterUpload: '=',
                // optional function to fire after removal
                onRemoval: '='
            },
            link: function (scope, element) {
                scope.getDimensions = function () {
                    var zoom = element.cropit('zoom'),
                        offset = element.cropit('offset'),
                        previewSize = element.cropit('previewSize');

                    scope.cropDimensions = {
                        x: Math.round(-(offset.x / zoom)),
                        y: Math.round(-(offset.y / zoom)),
                        width: Math.round(previewSize.width / zoom),
                        height: Math.round(previewSize.height / zoom)
                    };
                };
                element.cropit({
                    imageBackground: true,
                    imageBackgroundBorderWidth: 15,
                    imageState: { src: scope.image.original_image_url }
                });
                element.css('background-size', '100%');
            },
            controller: function ($scope) {
                $scope.editing = false;
                $scope.uploading = false;
                $('.image-edit').click(function (event) {
                    event.stopImmediatePropagation();
                    $(this).next().click();
                });
                $('.add-slideshow-image').click(function (event) {
                    event.stopImmediatePropagation();
                    $(this).next().click();
                });

                $scope.removePhoto = function (slideshow_img) {
                    console.log('removing photo');
                    $scope.image.slideshow = _.reject($scope.image.slideshow, function (item) {
                        if (slideshow_img.slideshow_image_url) {
                            return item.slideshow_image_url === slideshow_img.slideshow_image_url;
                        }
                        else {
                            return item.original_image_url === slideshow_img.original_image_url;
                        }
                    });
                    $scope.onDelete && $scope.onDelete(slideshow_img);
                };

                $scope.onFileSelect = function ($files) {
                    $scope.slideshowImg = $files[0];
                    $scope.editing = true;
                };

                $scope.uploadPhoto = function () {
                    $scope.getDimensions();
                    $scope.upload = Upload.upload({
                        url: $scope.endPoint + '?template=' + $scope.cropTemplate,
                        method: 'POST',
                        data: { crop_dimensions: $scope.cropDimensions },
                        file: $scope.slideshowImg
                    }).progress(function () {
                        $scope.uploading = true;
                    }).success(function (data) {
                        // file is uploaded successfully
                        var slideshowArray = {
                            'original_image_url': data.data.original_image_url,
                            'medium_image_url': data.data.medium_image_url,
                            'small_image_url': data.data.small_image_url,
                            'slideshow_image_url': data.data.slideshow_image_url
                        };
                        if (!_.isArray($scope.image.slideshow)) {
                            $scope.image.slideshow = [];
                        }
                        if ($scope.image.slideshow[$scope.number]) {
                            $scope.image.slideshow[$scope.number] = slideshowArray;
                        }
                        else {
                            $scope.image.slideshow.push(slideshowArray);
                        }
                        $scope.editing = false;
                        $scope.uploading = false;
                        $scope.afterUpload && $scope.afterUpload(data);
                    }).error(function (data) {
                        console.log('There was an error uploading the photo:');
                        console.log(data);
                        $scope.onError && $scope.onError(data);
                    });
                };
            }
        };
    });
