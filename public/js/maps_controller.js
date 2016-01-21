angular.module('ParkApp').controller('MapsController', MapsController);

var map;
var carImage = '/images/car-marker.png';

// reusable marker maker
var addMarker = function(location){
  // makes marker
  location.location.lat = parseFloat(location.location.lat);
  location.location.lng = parseFloat(location.location.lng);
  var marker = new google.maps.Marker({
    // set the positon to the latitude and longitude
    position: location.location,
    // the map I defined
    map: map,
    // makes icon my car image
    icon: carImage
  });
};

//make map with markers
function initMap() {
  // makes map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: +40.6706031, lng: -73.9901245},
    zoom: 15
  });
  //to be used
  var addAllMarkers = function(markers){
    markers.forEach(addMarker);
  }
  // makes markers for each item that's seeded
  $.ajax({
    url: '/spots',
    type: 'GET',
    dataType: 'json'
  }).done(addAllMarkers);
};

MapsController.$inject = ['$http'];

function MapsController($http) {
  var maps = this;
  maps.add = function(){
    var newSpot = {lat: maps.address, lng: maps.city};
    console.log(newSpot);
    $http.post('/spots', newSpot).then(initMap);
  };
};

//will call ajax to add spot
// var updateSpots = function(event){
//   event.preventDefault();
//   $.ajax({
//     url: '/spots',
//     type: 'POST',
//     dataType: 'json',
//     data: {lat: 40.6701091, lng: -73.9900451}
//   }).done(function(){console.log('got here')});
// }

// $(document).ready(function(){
//   var addSpot = $('#new-spot');
//   addSpot.on('click', updateSpots);
// });

