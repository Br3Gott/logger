// TODO:
// Client-side:
//  -update stats fields on every new connection.
//  -setup login form and adjust socket connection to allow authentication.
//  -implement charts to display stats
// Server-side:
//  -setup authentication.
const fs = require('fs');

const readLastLines = require('read-last-lines');

let local_data = JSON.parse(fs.readFileSync("db.json"));

// let local_data = {
//     host: [],
//     user_agent: [],
//     protocol: [],
//     resource: [],
//     coords: [],
// };

//Save data to json file every 10min.
setInterval(() => {
  fs.writeFile("db.json", local_data, (err) => {
    if (err) throw err;
  });
}, 600000);

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
  Server
} = require("socket.io");
const io = new Server(server);
const port = 3000;

const fetch = require("node-fetch");

app.use('/src', express.static(__dirname + '/src'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.emit("catchup", local_data);
});

server.listen(port, () => {
  console.log('Started: server and socket listening on port ' + port);
});

let path = "/home/dawe/web_dev/logs/access.log";

fs.watchFile(path, (eventType, filename) => {

  readLastLines.read(path, 1)
    .then((line) => {
      let split = line.split(":.:");
      local_data.host.push(split[1]);
      local_data.user_agent.push(split[2]);
      local_data.protocol.push(split[3]);
      local_data.resource.push(split[4]);
      console.log(split[0]);
      console.log({
        host: split[1],
        user_agent: split[2],
        protocol: split[3],
        resource: split[4],
      });
      io.emit("log", {
        host: split[1],
        user_agent: split[2],
        protocol: split[3],
        resource: split[4],
      });

      fetch('http://ip-api.com/json/' + split[0])
        .then(response => response.json())
        .then(data => {
          if (data.lat != null) {
            local_data.coords.push(data);
            io.emit("coords", {
              "lat": (parseFloat(data.lat)),
              "lon": (parseFloat(data.lon))
            });
            io.emit("geoip", data);
          }
        })
        .catch(err => console.error(err));
    });

});