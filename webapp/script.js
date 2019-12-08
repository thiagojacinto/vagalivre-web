// CONSTANTS AND VARIABLES
var foundAll = [];
var keyDataPoints = [];

const notFoundAlert = 'Desculpe. Nenhum estacionamento encontrado por perto :('

// Initiliaze Map API
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    // center: {lat: 41.85, lng: -87.65}
    center: { lat: -8.060726, lng: -34.891307 }
  });
  directionsDisplay.setMap(map);

  // Origin will be UNIT PE
  const unit = new google.maps.Marker({
    position: { lat: -8.060726, lng: -34.891307 },
    map: map,
    icon: 'http://maps.google.com/mapfiles/kml/paddle/grn-stars.png'
  })

  var onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  };
  // document.getElementById('start').addEventListener('change', onChangeHandler);  // O início vai ser fixo = UNIT
  document.getElementById('end').addEventListener('change', onChangeHandler);
}

// Icon to parking
const parkingIcon = 'http://maps.google.com/mapfiles/kml/shapes/cabs.png';

function calculateAndDisplayRoute(directionsService, directionsDisplay) {

  directionsService.route({
    origin: new google.maps.LatLng({ lat: -8.060726, lng: -34.891307 }),
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING'
  }, function (response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Requisição de direção falhou. Erro: ' + status);
    }
  });
}

// * * * * PLACES API Handling * * * * * 

// ERROR verifying function in HTTP Methods
async function CheckError(response) {
  if (response.status >= 200 && response.status <= 299) {
    return response.json();
  } else {
    throw Error(response.statusText);
  }
}

// GET Method function
async function getData(url = '', callback) { //, data = {}) {
  // Default options are marked with *
  const response = fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //mode: 'cors', // no-cors, *cors, same-origin
    //cache: 'default',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response =>
      CheckError(response)
        .then(result => {
          // console.log(JSON.stringify(result));
          return result;
        })
    );
  // return null;
  response
    .then(data => {
      // copying data and pushing it into 'foundAll' array
      data.results.forEach(element => {
        foundAll.push(element);
      });
      // after 'foundAll' is complete, callback the function
      callback && callback(foundAll);
    });
  
}

// Auxiliary to Use GET Method promise
function tryToFindAll() {
  // Tries GET
  try {

    // SUPPORTED TYPES for Place API 'Nearby': https://developers.google.com/places/web-service/supported_types

    return getData('https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-8.060726,-34.891307&rankby=distance&type=parking&keyword=estacionamento&key=AIzaSyAvPpbww4ey3M2FgjKXM0-s913upcp_klU', organizeFoundPlaces);  

  } catch (error) {
    console.error(error);
  }
}

// Select the UL on HTML
const locationsDiv = document.querySelector('.locationsFound');

// 'Vagas' Simulator
function calculateVacancy() {
  // Return a random number of [0, 10]
  return Math.floor(Math.random() * 10);
}

/* Deal with data after places were found:
  -> The results will be displayed as a table
  -> Create a table row with info from every 'foundAll' array`s item
*/
function organizeFoundPlaces(listOfPlaces) {

  // Only creates if there are valid results (NOT null)
  //  OBS: array will be at postion 0 of foundAll
  if (listOfPlaces.length != 0) {

    // Header of the table
    locationsDiv.innerHTML = `
    <table class="locationsTable">
      <tr>
        <th>Nome</th>
        <th>Enderenço</th>
        <th>Nota</th>
        <th>Aberto agora?</th>
        <th>Vagas</th>
      </tr>
    </table>
    `;

    // Get the newly created HTML element 'table'
    const locationsTable = document.querySelector('.locationsTable');

    // Analize every item in 'foundPlaces' array
    for (let i = 0; i < listOfPlaces.length; i++) {
      // Create a <tr> node
      let row = document.createElement("TR");

      // Important data from 'foundAll' elements:
      keyDataPoints[i] = [
        listOfPlaces[i].name,
        listOfPlaces[i].vicinity,
        listOfPlaces[i].rating,
        listOfPlaces[i].opening_hours != undefined ? (listOfPlaces[i].opening_hours ? 'Aberto' : 'Fechado') : 'N.I.',
        calculateVacancy(), // spaceholder to free parking spaces counting
        listOfPlaces[i].geometry.location,
        listOfPlaces[i].place_id
      ];

      // columns info
      for (let j = 0; j < 5; j++) { // Final will be 5, keeping 'keyDataPoints's order: name, address, rating, opennow
      // TABLE ORDER
        // Then, create a <th>  
        var column = document.createElement("TD");
        // Create a text node
        var insideContent = document.createTextNode(`${keyDataPoints[i][j]}`);
        // Append the text to <li>
        column.appendChild(insideContent);
        // Insert a column inside a row element. 
        row.appendChild(column)
    }
    // Then append it to a locationsDiv
    locationsTable.appendChild(row)

      // SELECT, OPTION
      let selection = document.querySelector('#end');
      // Create an <option> 
      var option = document.createElement("OPTION");
      // Set the displayed name
      option.setAttribute('textContent', `${keyDataPoints[i][0]}`);
      // Create a text node for it
      var insideOptionContent = document.createTextNode(`${keyDataPoints[i][1]}`);
      option.appendChild(insideOptionContent);
      selection.appendChild(option);
  }

  } else {
    // list of places is null
    locationsDiv.innerHTML = `<span class=locationsTable>${notFoundAlert}</span>`;
  }
}

// Get element from html
const getButton = document.querySelector('.getParkingLot');

// Event listener
getButton.addEventListener('click', (e) => {
  // console.log(e);  // Verify event
  e.preventDefault();
  tryToFindAll();
});