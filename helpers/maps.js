const Deliverer = require("../models/Deliverer");

const API_KEY = "";

exports.findDeliveryAgent = async (location) => {
  let deliverer = await Deliverer.find({ workingStatus: 1 });

  if (deliverer.length === 0) {
    const error = new Error("No deliverer available");
    error.name = "NoDelivererError";
    throw error;
  }

  let nearestDeliverer, minDist, minTime;
  minDist = 500000;
  let dist, time;

  for (let i = 0; i < deliverer.length; i++) {
    try {
      ({ distance: dist, time } = await this.getDistTime(
        location,
        deliverer[i].location
      ));
      if (dist < minDist) {
        minDist = dist;
        minTime = time;
        nearestDeliverer = deliverer[i];
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (!nearestDeliverer) {
    const error = new Error(
      "Cannot deliver to you from this location right now"
    );
    error.name = "NoDelivererError";
    throw error;
  }

  console.log(minTime, minDist);

  return { deliverer: nearestDeliverer, distance: minDist, time: minTime };
};

exports.getDistTime = async (location1, location2) => {
  const key = process.env.TOMTOM_API_KEY;

  let url = `https://api.tomtom.com/routing/1/calculateRoute/${location1.lat},${location1.lon}:${location2.lat},${location2.lon}/json?&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=motorcycle&vehicleMaxSpeed=30&vehicleCommercial=false&vehicleEngineType=combustion&key=${key}`;
  console.log(url);

  let res = await fetch(url);
  let data = await res.json();

  if (!res.ok) {
    console.log(res);
    throw new Error("Network response was not ok");
  }

  const distance = data["routes"][0]["summary"]["lengthInMeters"];
  const time = data["routes"][0]["summary"]["travelTimeInSeconds"];

  return { distance, time };
};

exports.geoCode = async (address) => {
  const key = process.env.TOMTOM_API_KEY;

  const res = await fetch(
    "https://api.tomtom.com/search/2/geocode/" + address + ".json?key=" + key
  );

  if (!res.ok) {
    console.log(res);
    throw new Error("Network response was not ok");
  }

  const data = await res.json();
  // console.log(data["results"][0]);
  return data["results"][0]["position"];
};

const route = async () => {
  const key = API_KEY;

  const originalString = "IIT Kharagpur";
  const address = encodeURIComponent(originalString);

  let geoloc = await fetchData(address);

  const locations = [
    { latitude: geoloc.lat, longitude: geoloc.lon },
    { latitude: 23.39245, longitude: 87.88406 },
  ];

  console.log("route called");
  console.log(locations);

  let lat1 = locations[0].latitude;
  let lon1 = locations[0].longitude;
  let lat2 = locations[1].latitude;
  let lon2 = locations[1].longitude;

  let url = `https://api.tomtom.com/routing/1/calculateRoute/${lat1},${lon1}:${lat2},${lon2}/json?&vehicleHeading=30&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=motorcycle&vehicleMaxSpeed=60&vehicleCommercial=false&vehicleEngineType=combustion&key=${key}`;
  console.log(url);

  fetch(url)
    .then(async (response) => {
      // if (!response.ok) {
      // throw new Error('Network response was not ok');
      // }
      return response.json();
      //  console.log(jso);
    })
    .then((data) => {
      console.log(data["routes"][0]["summary"]["travelTimeInSeconds"]);
      console.log(data["routes"][0]["summary"]["lengthInMeters"]);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  /*calculateRoute({
    key : API_KEY,
    locations,
    travelMode: "motorcycle",
  });*/
};

// module.exports = findDeliveryAgent;
// module.exports = route;
