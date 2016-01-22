// What should be in controllers?
// Is it OK to split into two pages?
// Should I be using angular or ajax?
// How to I get my additions to load into the database?
// Need to take down this marker.

var map;
var carImage;
var userAdding = false;

// var canDrag = false;

// reusable marker maker
var addMarker = function(location){
  // makes marker
  location.location.lat = parseFloat(location.location.lat);
  location.location.lng = parseFloat(location.location.lng);
  if(location.status == 'current'){
    carImage = '/images/car-available.png';
  }else if(location.status == 'soon'){
    carImage = '/images/car-soon.png';
  }else if(location.status == 'expired'){
    carImage = '/images/car-expired.png';
  }else if(location.status == 'chosen'){
    carImage = '/images/my-car.png';
  };

  var contentStringStart = '<div id="content">'+'<div id="siteNotice">'+'</div>'+'<h1 id="firstHeading" class="firstHeading">'+ location.day +'</h1>'+'<div id="bodyContent">'; 
  var middle;
  // if(location.status == 'soon'){
    middle = '<p>Leaving Spot at ' + location.leaving;
  // };
  var contentStringEnd = '</p>'+'<a id="take-spot" href="/false">'+'Take Spot</a>'+'</div>'+'</div>';
  var contentString = contentStringStart+middle+contentStringEnd;
  //make action for taking spot away
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  // console.log(location._id);
  var marker = new google.maps.Marker({
    // set the positon to the latitude and longitude
    position: location.location,
    // the map I defined
    map: map,
    id: location._id,
    // draggable: canDrag,
    // makes icon my car image
    icon: carImage
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
    $('#take-spot').on('click', function(event){
      //stop link in info box from workign
      event.preventDefault();
      console.log(location.current);
      $.ajax({
        url: '/spots/delete',
        type: 'POST',
        dataType: 'json',
        data: {spot: location}
      }).done(function(response){console.log(response);});
    });
  });
};
// puts all locations on the map
var addAllMarkers = function(markers){
  markers.forEach(addMarker);
} 
//make map with markers
function initMap() {
  console.log('printing1');
  // makes map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: +40.6706031, lng: -73.9901245},
    zoom: 15
  });
};

$(document).ready(function(){
  var modal = $(".modal-container");
  modal.toggle();
  console.log('printing1');
  $('#see-spots').on('click',function(event){
    modal.toggle();
    // Gets all seeded locations
    $.ajax({
      url: '/spots',
      type: 'GET',
      dataType: 'json'
    }).done(addAllMarkers);
  })
  $('#add-spot').on('click',function(event){
    userAdding = true;
    modal.toggle();
    // canDrag = true;
    //to add spot onto the map
    map.addListener('click', function(event) {
      var latitude = event.latLng.lat();
      var longitude = event.latLng.lng();
      var pickedLocation = {location: {lat: latitude, lng: longitude}}
      $.ajax({
        url: '/spots',
        type: 'POST',
        dataType: 'json',

        data: {spot: pickedLocation}
      }).done(addMarker(pickedLocation));
    });
  })
});