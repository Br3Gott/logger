# logger
Nodejs based nginx accesslog parser with socket.io, express and server-side geoip lookups. Client-side data presented with OpenStreetMap.

## Screenshot
![Screenshot](https://github.com/Br3Gott/logger/raw/main/screenshots/screenshot20211-12-18.jpeg)

~~Live Demo: logger.havre.gq~~

## To run
 1. Configure nginx to produce logs parseable by the app (See example.conf). 
 2. Specify path to **access.log** in app.js.
 3. Start with *npm run* or *node app.js*.
 4. Server will start on port specified in app.js (Default is: 3000).
