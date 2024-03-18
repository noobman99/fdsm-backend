// const Deliverer = require("../models/Deliverer");

const API_KEY = "YOUR_API_KEY";

// async function findDeliveryAgent(location) {
//   let deliverer = await Deliverer.find({ isWorking: true });

//   let minDistance = 999999999;
//   let nearestDeliverer = deliverer[0];
//   // code to find the nearest delivery agent

//   return nearestDeliverer;
// }

async function fetchData(address) {
  try {
    const response = await fetch('https://api.tomtom.com/search/2/geocode/' + address + '.json?key=' + API_KEY);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data["results"][0]["position"];
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}


  const route = async () => {
  const key = API_KEY;

  const originalString = "IIT Kharagpur";
  const address = encodeURIComponent(originalString);

  let geoloc = await fetchData(address);

  const locations = [{latitude: geoloc.lat, longitude: geoloc.lon}, {"latitude": 23.39245, "longitude": 87.88406}]

  console.log("route called")
  console.log(locations);
  
  let lat1 = locations[0].latitude;
  let lon1 = locations[0].longitude;
  let lat2 = locations[1].latitude;
  let lon2 = locations[1].longitude;

  let url = `https://api.tomtom.com/routing/1/calculateRoute/${lat1},${lon1}:${lat2},${lon2}/json?&vehicleHeading=30&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=motorcycle&vehicleMaxSpeed=60&vehicleCommercial=false&vehicleEngineType=combustion&key=${key}`;
  console.log(url);


  fetch(url).then(async response => {
    // if (!response.ok) {
      // throw new Error('Network response was not ok');
    // }
   return response.json();
  //  console.log(jso);
  })
  .then(data => {
    console.log(data["routes"][0]["summary"]["travelTimeInSeconds"]);
    console.log(data["routes"][0]["summary"]["lengthInMeters"]);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });


  /*calculateRoute({
    key : API_KEY,
    locations,
    travelMode: "motorcycle",
  });*/
};

  calculateRoute = async (routeOptions) => {
    try {
      const response = await services.calculateRoute(routeOptions);
      const geojson = response.toGeoJson();

      console.log(geojson);
      
    } catch (error) {
      console.error(error);
    }
  };

// module.exports = findDeliveryAgent;
module.exports = route;
