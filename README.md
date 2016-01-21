# People's Park

This web App enables users to see a live map of open parking spots in their neighborhood of New York. While this is best suited to a mobile App, I can't build a mobile App, so here we are. To solve this problem, I hope to implement the Twillio API so that users can text the App either "spot", "taken", or "spotted" to inquire about available spots, notify that a spot is taken, and add a vacant spot to the map. The map will come from the Google API and spots will show up as markers with specified latitudes and longitudes. 

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

#Wireframes - red marks post-MVP
![Imgur](http://i.imgur.com/cM5ewig.jpg)
![Imgur](http://i.imgur.com/POOnZ6p.jpg)
![Imgur](http://i.imgur.com/vbF92qp.jpg)
![Imgur](http://i.imgur.com/ra6S8Ow.jpg)
![Imgur](http://i.imgur.com/uk11VV9.jpg)
![Imgur](http://i.imgur.com/RvRXyMM.jpg)


