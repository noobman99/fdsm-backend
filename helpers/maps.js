const Deliverer = require("../models/Deliverer");

const API_KEY = "";

exports.findDeliveryAgent = async (location) => {
  let deliverer = await Deliverer.find({ workingStatus: 1 });

  if (deliverer.length === 0) {
    console.log("No delivery agent available");
    return null;
  }

  let nearestDeliverer = deliverer[0];
  let { distance: minDist, time: minTime } = await this.getDistTime(
    location,
    nearestDeliverer.location
  );
  let dist, time;

  for (let i = 1; i < deliverer.length; i++) {
    ({ distance: dist, time } = await this.getDistTime(
      location,
      deliverer[i].location
    ));
    if (dist < minDist) {
      minDist = dist;
      minTime = time;
      nearestDeliverer = deliverer[i];
    }
  }

  return { deliverer: nearestDeliverer, distance: minDist, time: minTime };
};

exports.getDistTime = async (location1, location2) => {
  const key = process.env.TOMTOM_API_KEY;

  let url = `https://api.tomtom.com/routing/1/calculateRoute/${location1.lat},${location1.lon}:${location2.lat},${location2.lon}/json?&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=motorcycle&vehicleMaxSpeed=35&vehicleCommercial=false&vehicleEngineType=combustion&key=${key}`;
  console.log(url);

  try {
    let res = await fetch(url);
    let data = await res.json();

    const distance = data["routes"][0]["summary"]["lengthInMeters"];
    const time = data["routes"][0]["summary"]["travelTimeInSeconds"];

    return { distance, time };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);

    return { distance: 0, time: 0 };
  }
};

exports.geoCode = async (address) => {
  try {
    const response = await fetch(
      "https://api.tomtom.com/search/2/geocode/" +
        address +
        ".json?key=" +
        API_KEY
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data);
    return data["results"][0]["position"];
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
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