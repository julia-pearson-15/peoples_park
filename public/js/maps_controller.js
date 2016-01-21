angular.module('ParkApp').controller('MapsController', MapsController);

// What should be in controllers?
// Is it OK to split into two pages?
// Should I be using angular or ajax?
// How to I get my additions to load into the database?
// Need to take down this marker.

var map;
var carImage = '/images/car-marker.png';

// reusable marker maker
var addMarker = function(location){
  // makes marker
  location.location.lat = parseFloat(location.location.lat);
  location.location.lng = parseFloat(location.location.lng);
  // if(location.current){
  //   carImage = '/images/car-marker-current.png';
  // }else{
  //   carImage = '/images/car-marker.png';
  // };
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

  // !!!! reactivate when I make a separate add spot page
  // puts all locations on the map
  var addAllMarkers = function(markers){
    markers.forEach(addMarker);
  } 
  // // Gets all seeded locations
  $.ajax({
    url: '/spots',
    type: 'GET',
    dataType: 'json'
  }).done(addAllMarkers);

  //to add spot onto the map
  map.addListener('click', function(event) {
    // {location: {lat: event.latLng.lat(), lng: event.latLng.lng()}}
    var latitude = event.latLng.lat();
    var longitude = event.latLng.lng();
    var pickedLocation = {location: {lat: latitude, lng: longitude}}
    console.log(pickedLocation);
    $.ajax({
      url: '/spots',
      type: 'POST',
      dataType: 'json',
      // AM NOT GETTING THIS
      data: {spot: pickedLocation}
    }).done(function(response){console.log(response)});
    addMarker(pickedLocation);
  });
};

// MapsController.$inject = ['$http'];

// function MapsController($http) {
//   var maps = this;
//   maps.add = function(){
//     var newSpot = {lat: maps.address, lng: maps.city};
//     $http.post('/spots', newSpot).then(initMap);
//   };
// };


