# People's Park

Peoples' Park is a mobile-friendly, single-page, JavaScript web application that allows users to find street parking in NYC. I worked closely with the Google Maps API but utilized my own user-driven database, which continually updates with AJAX calls. All spots are archived 20 minutes after they opened up (because in NYC no spot is around that long), so users can go to 'spot trends' and get a better sense of when spots open up in their neighborhood. Because of the archiving, the map will probably be empty when you load it. Add some spots to get a sense for the functionality!

-username: jane
-password: frank

![Imgur](http://i.imgur.com/yWBpT7f.png)

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




