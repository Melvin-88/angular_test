'use strict';

var app = angular.module('app', [
    'ui.bootstrap',
    'ngAnimate',
    'infinite-scroll',
    'ngFileUpload',
    'ngRoute'
]);
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "../template/main.html"
        })
        .when("/collection", {
            templateUrl : "../template/collection.html"
        })
});
app.directive('userImg', function(){
    return{
        restrict: 'E',
        templateUrl: '../template/images.html'
    }
});
app.directive('tagsInput', function(){
    return{
        restrict: 'E',
        templateUrl: '../template/tags-input.html'
    }
});
app.directive('modal', function(){
    return{
        restrict: 'E',
        templateUrl: '../template/modal.html'
    }
});

app.controller('UserController', UserImages);

UserImages.$inject = ['$scope', '$log', '$http','Images','Upload'];
function UserImages ($scope, $log, $http, Images, Upload){
    var that  = this;
    var images  = new Images();
    that.newFile = {
        file: null,
        image_url: null,
        tags: null
    };

    that.images   = images;

    that.search   = function (query) {
        console.log(query.length)
        if(query.length>=3){
            images.search(query);
            that.images = images;
        }
        if(query.length){
            images.search(query);
            that.images = images;
        }
    };

    that.getMyCollection = function () {
        images.myCollection();
    };
    that.getMyCollection();

    that.addFavorite = function (id) {
        var list;
        if(localStorage.favorite){
            list = JSON.parse(localStorage.favorite);
        }else{
            list = []
        }
        var newArr = list.filter((e)=>{
            return e == id;
        });
        if(newArr.length>0){
            return false
        }else{
            list.push(id);
        }
        localStorage.setItem('favorite', JSON.stringify(list));
        images.myCollection();
    };

    that.open = function (id) {
        images.getOneById(id, function (url) {
            $('.img-modal').attr('src', url);
            $('#myModal').modal('show');
        }.bind(this));
    };

    that.uploadFiles = function () {
        var tags;
        if ((!that.newFile.file && !that.newFile.source_image_url)) return;
        if(that.newFile.tags){
            tags = that.newFile.tags.map(function (elem) {
                return elem.text;
            }).join(",");
        }else{
            that.newFile.tags = '';
        }
        var url = 'http://upload.giphy.com/v1/gifs';
        var data = {
            username: 'Melvin',
            api_key: 'dc6zaTOxFJmzC',
            file: that.newFile.file,
            source_image_url: that.newFile.image_url,
            tags: tags
        };

        return Upload.upload({
            url: url,
            data: data
        }).then(function(response){
            $('.add_img').text('Your image added...');
            if(response){
                var id = response.data.data.id;
                that.addFavorite(id);
            }
        });
    };
}

app.factory('Images', function($http, $log) {
    var Images = function () {
        this.apiKey = 'api_key=dc6zaTOxFJmzC';
        this.items = [];
        this.collection = [];
        this.offset = 0;
        this.limit = 30;
        this.busy = false;
        this.action = 'trending';
        this.queryString = '';
        this.itemData = {};
    }

    Images.prototype.makeUrl = function () {
        var url = 'http://api.giphy.com/v1/gifs/';
        var apiKeyStr = this.apiKey;

        switch (this.action) {
            case 'search':
                url = url + this.action + '?' + apiKeyStr + '&q=' + this.queryString;
                break;
            default:
                url = url + this.action + '?' + apiKeyStr
        }

        return url + "&limit=" + this.limit + "&offset=" + this.offset;
    }

    Images.prototype.search = function (query) {
        if (!query) {
            this.items = [];
            this.offset = 0;
            this.action = 'trending';
            this.nextPage();
        }
        this.items = [];
        this.offset = 0;
        this.action = 'search';
        this.queryString = query;
        this.nextPage();
    }

    Images.prototype.myCollection = function () {
        this.collection = [];
        let localId = JSON.parse(localStorage.favorite);
        let ids = localId.join(',');
        var search = {
            ids: ids,
            api_key: 'dc6zaTOxFJmzC'
        };
        $http({
            method: 'GET',
            url: 'http://api.giphy.com/v1/gifs',
            params: search
        }).then(function(response) {
            var items = response.data.data;
            for (var i = 0; i < items.length; i++) {
                this.collection.push(items[i]);
                this.offset++;
            }
        }.bind(this));
        console.log(this.collection)
    };

    Images.prototype.nextPage = function() {
        var that = this;

        if (this.busy) return;
        this.busy = true;

        var url = this.makeUrl();
        $log.debug('url:' + url);
        $http.get(url).then(function(response) {
            var items = response.data.data;
            for (var i = 0; i < items.length; i++) {
                this.items.push(items[i]);
                this.offset++;
            }
        }.bind(this));
        setTimeout(function(){
            that.busy = false;
        }, 100);
    };

    Images.prototype.getOneById =  function (id, cb) {
        $http.get('http://api.giphy.com/v1/gifs/'+ id + '?' + this.apiKey).then(function(response) {
            cb(response.data.data.images.original.url);
        }.bind(this));
        return this;
    }
    return Images;
})







