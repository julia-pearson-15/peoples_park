# People's Park

Peoples' Park is a mobile-friendly, single-page, JavaScript web application that allows users to find street parking in NYC. I worked closely with the Google Maps API but utilized my own user-driven database, which continually updates with AJAX calls. All spots are archived 20 minutes after they opened up (because in NYC no spot is around that long), so users can go to 'spot trends' and get a better sense of when spots open up in their neighborhood. Because of the archiving, the map will probably be empty when you load it. Add some spots to get a sense for the functionality!

##User Stories

####MVP:
- A functioning map with event listeners on markers to remove open spots
- Interaction with DB that keeps parking spots and their day of the week (hold onto parking spots for longterm data-analysis of where there tend to be open spots)
- A form to enter an Address, which is converted to lat/long and placed on the map, using AJAX
- Automatically take spots down after 20 minutes, or at least mark them as grey

####For the Win:
- Can log in and see points accumulated from interaction (i.e. marking open or taken spots)
- Can access site via text commands
- Filter data by cleaning day
- Can see calendar of holidays when parking is suspended or forcast is more than x inches of snow

#ERD
```
[{ 
  //This is set by the user who inputs the spot, designated by the click
  "location":{"lat": "40.6701091", "lng": "-73.9900451"},
  
  //Day of cleaning for this spot
  "day":"Tueday",
  
  //This is either set tp current time if the user is leaving spot now, or to a designated time, if the user if leaving the spot soon
  "leaving":"2016-01-30T18:11:24+00:00",
  
  //This can be current (user entered this, "leaving" is set to current time), soon (user chose, they are leaving at time "leaving"), or chosen (user took spot, they can see as outlined and larger)
  "status": "soon",
  
  //this is the username of the user who marked the spot, set when user adds spot
  "leaver": "username",
  
  /this is the username of the user who has selected the spot, set when user takes spot
  "taker": "username"
  }
]
```

#Wireframes - red marks post-MVP
!([Imgur](http://i.imgur.com/yWBpT7f.png))


