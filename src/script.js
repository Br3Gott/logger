var socket = io();

var map;

var markers = new OpenLayers.Layer.Markers("Markers");

var zoom = 0;

var local_coords = [];
var local_markers = [];

var hostnames = [];
var protocols = [];
var resources = [];
var isps = [];
var countries = [];
var userAgents = [];

var popupCounter = 0;


document.addEventListener("DOMContentLoaded", function () {

    map = new OpenLayers.Map("mapdiv");
    map.addLayer(new OpenLayers.Layer.OSM());

    var lonLat = new OpenLayers.LonLat(0, 0)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
        );

    map.setCenter(lonLat, zoom);

    map.addLayer(markers);

    map.updateSize();

});

socket.on("catchup", (data) => {
    console.log("starting catchup!");
    console.log(data);

    //HOSTNAMES

    data.host.forEach((host) => {
        if (hostnames.findIndex(obj => obj.host == host) != -1) {
            hostnames[hostnames.findIndex(obj => obj.host == host)].count++;
        } else {
            hostnames.push({
                "host": host,
                "count": 1
            });
        }
    });
    sorter(hostnames);
    console.log("processed HOSTS done, found: " + hostnames.length);
    console.log(hostnames);

    let hostsContainer = document.querySelector(".hosts tbody");
    hostsContainer.innerHTML = "";
    hostnames.forEach((host) => {
        hostsContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + host.host + "</td><td>" + host.count + "</td></tr>";
    });

    //PROTOCOL

    data.protocol.forEach((protocol) => {
        if (protocols.findIndex(obj => obj.protocol == protocol) != -1) {
            protocols[protocols.findIndex(obj => obj.protocol == protocol)].count++;
        } else {
            protocols.push({
                "protocol": protocol,
                "count": 1
            });
        }
    });
    sorter(protocols);
    console.log("processed PROTOCOLS done, found: " + protocols.length);
    console.log(protocols);

    let protocolContainer = document.querySelector(".protocol tbody");
    protocolContainer.innerHTML = "";
    protocols.forEach((protocol) => {
        protocolContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + protocol.protocol + "</td><td>" + protocol.count + "</td></tr>";
    });

    //RESOURCES

    data.resource.forEach((resource) => {
        if (resources.findIndex(obj => obj.resource == resource) != -1) {
            resources[resources.findIndex(obj => obj.resource == resource)].count++;
        } else {
            resources.push({
                "resource": resource,
                "count": 1
            });
        }
    });
    sorter(resources);
    console.log("processed RESOURCES done, found: " + resources.length);
    console.log(resources);

    let resourceContainer = document.querySelector(".resource tbody");
    resourceContainer.innerHTML = "";
    resources.forEach((resource) => {
        if (resource.resource.length > 40) {
            resourceContainer.innerHTML += "<tr><td class=\"tablePrimary\" title=\"" + resource.resource + "\">" + resource.resource.substr(0, 40) + "...</td><td>" + resource.count + "</td></tr>";
        } else {
            resourceContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + resource.resource + "</td><td>" + resource.count + "</td></tr>";
        }
    });

    //ISP

    data.coords.forEach((coords) => {
        if (isps.findIndex(obj => obj.isp == coords.isp) != -1) {
            isps[isps.findIndex(obj => obj.isp == coords.isp)].count++;
        } else {
            isps.push({
                "isp": coords.isp,
                "count": 1
            });
        }
    });
    sorter(isps);
    console.log("processed ISPS done, found: " + isps.length);
    console.log(isps);

    let ispsContainer = document.querySelector(".isp tbody");
    ispsContainer.innerHTML = "";
    isps.forEach((isp) => {
        ispsContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + isp.isp + "</td><td>" + isp.count + "</td></tr>";
    });

    //COUNTRY

    data.coords.forEach((coords) => {
        if (countries.findIndex(obj => obj.country == coords.country) != -1) {
            countries[countries.findIndex(obj => obj.country == coords.country)].count++;
        } else {
            countries.push({
                "country": coords.country,
                "count": 1
            });
        }
    });
    sorter(countries);
    console.log("processed COUNTRIES done, found: " + countries.length);
    console.log(countries);

    let countriesContainer = document.querySelector(".country tbody");
    countriesContainer.innerHTML = "";
    countries.forEach((country) => {
        countriesContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + country.country + "</td><td>" + country.count + "</td></tr>";
    });

    //USER AGENT

    data.user_agent.forEach((userAgent) => {
        if (userAgents.findIndex(obj => obj.userAgent == userAgent) != -1) {
            userAgents[userAgents.findIndex(obj => obj.userAgent == userAgent)].count++;
        } else {
            userAgents.push({
                "userAgent": userAgent,
                "count": 1
            });
        }
    });
    sorter(userAgents);
    console.log("processed RESOURCES done, found: " + userAgents.length);
    console.log(userAgents);

    let userAgentsContainer = document.querySelector(".userAgent tbody");
    userAgentsContainer.innerHTML = "";
    userAgents.forEach((userAgent) => {
        if (userAgent.userAgent.length > 40) {
            userAgentsContainer.innerHTML += "<tr><td class=\"tablePrimary\" title=\"" + userAgent.userAgent + "\">" + userAgent.userAgent.substr(0, 40) + "...</td><td>" + userAgent.count + "</td></tr>";
        } else {
            userAgentsContainer.innerHTML += "<tr><td class=\"tablePrimary\">" + userAgent.userAgent + "</td><td>" + userAgent.count + "</td></tr>";
        }

    });

    //MARKERS

    data.coords.forEach((coords) => {

        if (local_coords.findIndex(obj => obj.lat == coords.lat && obj.lon == coords.lon) != -1) {
            local_coords[local_coords.findIndex(obj => obj.lat == coords.lat && obj.lon == coords.lon)].count++;
        } else {
            local_coords.push({
                "lat": coords.lat,
                "lon": coords.lon,
                "count": 1
            });
        }
    })
    sorter(local_coords);
    console.log("catchup done, added: " + local_coords.length + " markers of total: " + data.coords.length + " locations");

    local_coords.forEach((coords) => {
        addMarker(coords.lat, coords.lon, true);
    })


});

socket.on("coords", (data) => {
    addMarker(data.lat, data.lon);
});

socket.on("geoip", (data) => {
    console.log("Geoip data: ");
    console.log(data);

    let popupContainer = document.querySelector(".popupContainer");
    popupContainer.innerHTML += "<div onclick=\"removeMessage(" + ++popupCounter + ")\" id=\"popup" + popupCounter + "\" class=\"popup\"><div class=\"popupIcon\">✔</div><p>Connection from: " + data.country + ", " + data.city + "</p></div>";
});

socket.on("log", (data) => {
    console.log("Log data: ");
    console.log(data);
});

var size = new OpenLayers.Size(35, 35);
var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
// var icon = new OpenLayers.Icon('https://th.bing.com/th/id/R.fbbb4be8493b3ca28dc97fcc5ad65fba?rik=q7%2fLJCWgoMA4qw&pid=ImgRaw&r=0', size, offset);
var iconCommon = new OpenLayers.Icon('/src/pin_common.png', size, offset);
var iconUncommon = new OpenLayers.Icon('/src/pin_uncommon.png', size, offset);
var iconRare = new OpenLayers.Icon('/src/pin_rare.png', size, offset);
var iconEpic = new OpenLayers.Icon('/src/pin_epic.png', size, offset);
var iconLegendary = new OpenLayers.Icon('/src/pin_legendary.png', size, offset);

function addMarker(data_lat, data_lon, catchup = false) {
    var lonLat = new OpenLayers.LonLat(data_lon, data_lat)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
        );

    if (!catchup) {
        if (local_coords.findIndex(obj => obj.lat == data_lat && obj.lon == data_lon) != -1) {
            local_coords[local_coords.findIndex(obj => obj.lat == data_lat && obj.lon == data_lon)].count++;
        } else {
            local_coords.push({
                "lat": data_lat,
                "lon": data_lon,
                "count": 1
            });
        }
    }

    let rarity = local_coords.find(obj => obj.lat == data_lat && obj.lon == data_lon).count;

    if (rarity == 1) {
        local_markers.push(new OpenLayers.Marker(lonLat, iconCommon.clone()));
    } else if (rarity == 2) {
        local_markers.push(new OpenLayers.Marker(lonLat, iconUncommon.clone()));
    } else if (rarity == 3) {
        local_markers.push(new OpenLayers.Marker(lonLat, iconRare.clone()));
    } else if (rarity == 4) {
        local_markers.push(new OpenLayers.Marker(lonLat, iconEpic.clone()));
    } else if (rarity >= 5) {
        local_markers.push(new OpenLayers.Marker(lonLat, iconLegendary.clone()));
    }

    markers.addMarker(local_markers[local_markers.length - 1]);
}

function removeMarker() {
    markers.removeMarker(local_markers.pop());
}

function removeAllMarkers() {

    var amount = local_markers.length;

    for (let i = 0; i < amount; i++) {
        markers.removeMarker(local_markers.pop());
    }

}

function addRandomMarkers(amount = 1) {

    for (let i = 0; i < amount; i++) {
        var lonLat = new OpenLayers.LonLat(Math.random() * 60, Math.random() * 60)
            .transform(
                new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                map.getProjectionObject() // to Spherical Mercator Projection
            );

        local_markers.push(new OpenLayers.Marker(lonLat));

        markers.addMarker(local_markers[local_markers.length - 1]);

    }

}

function sorter(arr) {
    arr.sort((a, b) => {
        return b.count - a.count
    });
}

function removeMessage(id) {
    let currentPopup = document.querySelector("#popup" + id);
    currentPopup.animate([{
            opacity: '1'
        },
        {
            opacity: '0'
        }
    ], {
        duration: 1000,
        iterations: 1,
    });
    setTimeout(() => {
        currentPopup.remove();
    }, 900);
}

function showMap() {
    let stats = document.querySelector(".info");

    if (!stats.classList.contains("hidden")) {

        let mapButton = document.querySelector(".mapbutton");
        mapButton.classList.add("selected");
        let statsButton = document.querySelector(".statsbutton");
        statsButton.classList.remove("selected");
        let stats = document.querySelector(".info");
        stats.animate([{
                transform: "scale(1, 1)"
            },
            {
                transform: "scale(1, 0.002)",
                opacity: 1
            },
            {
                transform: "scale(0.2, 0.002)",
                opacity: 0
            },
            {
                transform: "scale(0.2, 0.002)",
                opacity: 1
            },
            {
                transform: "scale(1, 0.002)"
            },

        ], {
            duration: 550,
            iterations: 1,

        });
        setTimeout(() => {
            stats.classList.add("hidden");
        }, 500);
    }
}

function showStats() {
    let stats = document.querySelector(".info");

    if (stats.classList.contains("hidden")) {
        let statsButton = document.querySelector(".statsbutton");
        statsButton.classList.add("selected");
        let mapButton = document.querySelector(".mapbutton");
        mapButton.classList.remove("selected");

        stats.classList.remove("hidden");
        stats.animate([{
                transform: "scale(1, 0.002)"
            },

            {
                transform: "scale(0.2, 0.002)",
                opacity: 1
            },

            {
                transform: "scale(0.2, 0.002)",
                opacity: 0
            },

            {
                transform: "scale(1, 0.002)",
                opacity: 1
            },

            {
                transform: "scale(1, 1)"
            }
        ], {
            duration: 500,
            iterations: 1
        });
    }

}