// make websocket connection outside of ajax to the database


var map;
var $menuModal;
var carImage = "/images/car-available.png";
var latitude;
var longitude;

var getImage = function(status){
  if(status == 'current'){
    return '/images/car-available.png';
  }else if(status == 'soon'){
    return '/images/car-soon.png';
  }else if(status == 'taken'){
    return '/images/my-car.png';
  }else if(status == 'archived'){
    return '/images/car-expired.png';
  }
};

var getContent = function(spot){
  var infoStart = '<div id="content">'+'<div id="siteNotice">'+'</div>'+'<h1 id="firstHeading" class="firstHeading">'+ spot.day +'</h1>'+'<div id="bodyContent">'; 
  var middle;

  // change stringified date into date object
  var fullDate = new Date(spot.leaving);
  var minutes = fullDate.getMinutes();
  // handling minuts < 10 which would otherwise show up as 7:5 PM
  if (fullDate.getMinutes()<10) {
    minutes = 0+minutes;
  };
  if(fullDate.getHours() > 12){
    var time = (fullDate.getHours()-12) + ":" + minutes+" PM";
  }else{
    var time = fullDate.getHours() + ":" + fullDate.getMinutes()+" AM";
  }
  // logic that sets info timing
  if(spot.status == 'soon'){
    middle = '<p>Leaving Spot at ' + time;
  }else if(spot.status == 'current'){
    middle = '<p>Left Spot at ' + time;
  }else if(spot.status == 'taken'){
    middle = '<p>Get to Spot by ' + time;
  };

  var contentStringEnd = '</p>'+'<a id="take-spot" href="/false">'+'Take Spot</a>'+'</div>'+'</div>';
  var contentString = infoStart+middle+contentStringEnd;
  return contentString;
}

var addMarker = function(spot){
  // Turns the stringified location data back into num
  spot.location.lat = parseFloat(spot.location.lat);
  spot.location.lng = parseFloat(spot.location.lng);

  // logic that sets car marker
  carImage = getImage(spot.status);

  contentString = getContent(spot);

  //make action for taking spot away
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  // creating marker with all ^ information
  var marker = new google.maps.Marker({
    position: spot.location,
    map: map,
    id: spot._id,
    icon: carImage
  });
  marker.addListener('click', function(event) {
    infowindow.open(map, marker);
    console.log('Click \'take spot\' to reserve that spot and take it off other users\' maps');
    $('#take-spot').on('click', function(event){
      //stop link in info box from workign
      event.preventDefault();
      $.ajax({
        url: '/taken',
        type: 'POST',
        dataType: 'json',
        data: {spot: spot}
      }).done(function(response){
        // marker.icon = getImage('taken')
        infowindow.close(map, marker);
        makeMap();
        // console.log('You can only take one spot at a time, click another to change reservation')
      });
    });
  });
};


// runs through markers and adds them to map
var addAllMarkers = function(markers){
  // calls addMarker for each spot
  markers.forEach(addMarker);
} 


// makes empty map - is called directly in index.ejs script tag
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    // TODO replact lat and long with the browser location
    center: {lat: +40.6706031, lng: -73.9901245},
    zoom: 16
  });
};

var makeMap = function(){
  initMap();
  $.ajax({
    url: '/spots',
    type: 'GET',
    dataType: 'json'
  }).done(addAllMarkers);
};
var makeMapAll = function(){
  initMap();
  $.ajax({
    url: '/spots/all',
    type: 'GET',
    dataType: 'json'
  }).done(addAllMarkers);
};

$(document).ready(function(){
  // opens the welcome modal with options to add or see spots
  var currentUser = $('#user').val();
  var $loginModal = $(".login-modal-container");
  $menuModal = $(".menu-modal-container");
  var parkPointsText = $('#park-points');

  if(currentUser){
    $menuModal.toggle();
  }else{
    $loginModal.toggle();
  };

  $('#logout').on('click',function(event){
    event.preventDefault();
    $.ajax({
      url: '/logout',
      type: 'GET',
      dataType: 'json'
    }).done(function(response){
      currentUser = null;
      parkPointsText.text('');
      $menuModal.toggle()
      $loginModal.toggle();
    });   
  });
  $('#login').on('click',function(event){
    event.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();
    var userInfo = {username: username, password: password};
    $.ajax({
      url: '/login',
      type: 'POST',
      dataType: 'json',
      data: userInfo
    }).done(function(response){
      currentUser = response;
      parkPoints = currentUser.points;
      parkPointsText.text('Park Points : '+parkPoints);
      $loginModal.toggle();
      $menuModal.toggle();
    });   
  });
  $('#signup').on('click',function(event){
    event.preventDefault();
    var username = $('#new-username').val();
    var password = $('#new-password').val();
    var userInfo = {username: username, password: password};
    $.ajax({
      url: '/signup',
      type: 'POST',
      dataType: 'json',
      data: userInfo
    }).done(function(response){
      currentUser = response;
      parkPoints = currentUser.points;
      parkPointsText.text('Park Points : '+parkPoints);
      $loginModal.toggle();
      $menuModal.toggle();
    });   
  });
  $('#see-spots').on('click',function(event){
    // close opening modal
    $menuModal.toggle();
    // requests all unarchived spots and then calls addAllMarkers on the result
    makeMap();
    console.log('Click a car to see the spot details\nGreen = available now\nBlue = available soon')
  });
  $('#spot-data').on('click',function(event){
    $menuModal.toggle();
    makeMapAll();
  });
  var $formModal = $('.form-modal-container');
  $('#add-spot').on('click',function(event){
    $menuModal.toggle();
    initMap();
    //to add spot onto the map
    map.addListener('click', function(event) {
      //grab the form modal and show it
      $formModal.toggle();
      //get latitude and longitude from click
      latitude = event.latLng.lat();
      longitude = event.latLng.lng();
    });
  });
  $('#error-button').on('click',function(event){
    event.preventDefault();
    $formModal.toggle();
  });
  $('#new-spot-button').on('click',function(event){
    event.preventDefault();
    var thisDay = $('#day-input').val();
    // will either be now or 5-20 minutes
    var thisStatus = $('#status-input').val(); 
    var thisTime = new Date();
    if(thisStatus == 'now'){
      thisStatus = "current";
    } else {
      var minuteDelay = thisTime.getMinutes()+parseInt(thisStatus);
      thisTime.setMinutes(minuteDelay); 
      thisStatus = "soon";
    }
    var pickedLocation = {location: {lat: latitude, lng: longitude}, leaving: thisTime, day: thisDay, status: thisStatus};
    $.ajax({
      url: '/spots',
      type: 'POST',
      dataType: 'json',
      data: {spot: pickedLocation}
    }).done(function(){
      parkPoints = parkPoints+1;
      parkPointsText.text('Park Points : '+parkPoints);
      $formModal.toggle();
      $menuModal.toggle();
    });
  });
  var $refresh = $('#map-refresh');
  $refresh.on('click',makeMap);
  $('#menu-bubbles').on('click',function(event){
    $menuModal.toggle();
  });
});



