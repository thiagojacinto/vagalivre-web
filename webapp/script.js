// CONSTANTS AND VARIABLES
var foundAll = [];
var keyDataPoints = [];
// Info gathared from 'keyDataPoints' and displayed to user
const interestingInfo = 2;
const notFoundAlert = 'Desculpe. Nenhum estacionamento encontrado por perto :(';

https://www.google.com/maps/dir/?api=1&destination=

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
// Using Direction API (Service and Display)
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

    return getData('https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-8.060726,-34.891307&rankby=distance&type=parking&keyword=estacionamento&key=YOUR_KEY_HERE', organizeFoundPlaces);

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

// Function to show hidden selection div
function selectionHandler(selection) {
  if (selection.style.display === '') {
    selection.classList.replace('hidden-panel','showing-panel');
  }
}

// Return 'data-label' attribute to every row in table
function selectDataLabel(key) {
  switch (key) {
    case 0:
      return 'Nome';
    case 1:
      return 'Aberto agora?';
    case 2:
      return 'Vagas';
    case 3: 
      return 'Iniciar trajeto'; 
    default:
      '';
      break;
  }
}

// Animate 'Procurar' bar
function animateBar(bar) {
  let firstDiv = document.createElement("DIV");
  firstDiv.classList.add('lds-ripple');
  let newDiv = document.createElement("DIV");
  let anotherDiv = document.createElement("DIV");
  // Append two divs like newDiv
  firstDiv.appendChild(newDiv);
  firstDiv.appendChild(anotherDiv);
  bar.appendChild(firstDiv);
  console.log("ANIMATION OK!"); // Verify
  
}

/* Deal with data after places were found:
  -> The results will be displayed as a table
  -> Create a table row with info from every 'foundAll' array`s item
*/
function organizeFoundPlaces(listOfPlaces) {

  // Show selection 'panel' 
  const selection = document.querySelector('#selection');
  selectionHandler(selection);

  // Animate the 'Procurar vaga' bar:
  const putAnimatedLoading = document.querySelector('.getParkingLot');
  // Then, change button name AND put animation
  putAnimatedLoading.textContent = 'PROCURANDO ';
  // and add the animations to it
  animateBar(putAnimatedLoading);
    

  // Only creates if there are valid results (NOT null)
  //  OBS: array will be at postion 0 of foundAll
  if (listOfPlaces.length != 0) {

    // Header of the table
    locationsDiv.innerHTML = `
    <table class="locationsTable">
      <tbody class="responses"> 
      <tr class="table-head">
        <th>Nome</th>
        <th>Aberto agora?</th>
        <th>Vagas</th>
        <th>Iniciar trajeto</th>
      </tr>
      </tbody>
    </table>
    `;
    // REMOVED: <th>Enderenço</th> <th>Nota</th>

    // Get the newly created HTML element 'table'
    const locationsTable = document.querySelector('.responses');

    // Analize every item in 'foundPlaces' array
    for (let i = 0; i < listOfPlaces.length; i++) {
      // Create a <tr> node
      let row = document.createElement("TR");

      // Important data from 'foundAll' elements:
      keyDataPoints[i] = [
        listOfPlaces[i].name,
        // listOfPlaces[i].vicinity,
        // listOfPlaces[i].rating,
        listOfPlaces[i].opening_hours != undefined ? (listOfPlaces[i].opening_hours ? 'Aberto' : 'Fechado') : 'N.I.',
        calculateVacancy(), // spaceholder to free parking spaces counting
        listOfPlaces[i].geometry.location,
        listOfPlaces[i].place_id,
        listOfPlaces[i].vicinity
      ];

      // Verify quantity of FREE PARKING SPACES
      // -> Only show options with free spaces > 0:
      if (keyDataPoints[i][2] > 0) {

        // Populate columns with info from the points
        for (let j = 0; j <= interestingInfo; j++) { // Final will be 'interestingInfo', keeping 'keyDataPoints's order: name, address, userRating, opennow
          // TABLE ORDER
          // Then, create a <th>  
          var column = document.createElement("TD");
          // create 'data-label' attribute
          column.setAttribute('data-label', selectDataLabel(j));
          
          // Create a text node
          var insideContent = document.createTextNode(`${keyDataPoints[i][j]}`);
          // Append the text to <li>
          column.appendChild(insideContent);
          // Insert a column inside a row element. 
          row.appendChild(column)
        }

        // Direction links
        // Creates a links column data, using the same logic:
        var linksColumn = document.createElement("TD");
        linksColumn.setAttribute('data-label', selectDataLabel(3));
        // for Google Maps:
        var googleMapsLink = document.createElement("A");
        // set 'href' attribute of new <a> created
        googleMapsLink.setAttribute('href', `https://www.google.com/maps/dir/?api=1&destination=${keyDataPoints[i][3].lat},${keyDataPoints[i][3].lng}`);
        // // name of the link:
        // var insideGoogleMapsName = document.createTextNode("Google Maps");
        // add a image/icon
        var googleMapsIcon = document.createElement("IMG");
        googleMapsIcon.setAttribute('src', 'img/googleMaps.png');
        googleMapsIcon.setAttribute('alt', 'Google Maps Icon');
        googleMapsIcon.setAttribute('class', 'app-icon');

        googleMapsLink.appendChild(googleMapsIcon);

        // then add it to the column
        linksColumn.appendChild(googleMapsLink);

        // for Waze Maps:
        var wazeLink = document.createElement("A");
        // set 'href' attribute of new <a> created
        wazeLink.setAttribute('href', `https://www.waze.com/ul?ll=${keyDataPoints[i][3].lat}%2C${keyDataPoints[i][3].lng}&navigate=yes&zoom=17`);
      
        // add a image/icon
        var wazeIcon = document.createElement("IMG");
        wazeIcon.setAttribute('src', 'img/waze.png');
        wazeIcon.setAttribute('alt', 'Waze Icon');
        wazeIcon.setAttribute('class', 'app-icon');

        wazeLink.appendChild(wazeIcon);

        // then add it to the column
        linksColumn.appendChild(wazeLink);

        // for Apple Maps:
        var appleMapsLink = document.createElement("A");
        appleMapsLink.setAttribute('href', `http://maps.apple.com/?daddr=${keyDataPoints[i][3].lat},${keyDataPoints[i][3].lng}&dirflg=d&t=h`);
        
        // add a image/icon
        var appleMapsIcon = document.createElement("IMG");
        appleMapsIcon.setAttribute('src', 'img/appleMaps.png');
        appleMapsIcon.setAttribute('alt', 'Apple Maps Icon');
        appleMapsIcon.setAttribute('class', 'app-icon');

        appleMapsLink.appendChild(appleMapsIcon);
        linksColumn.appendChild(appleMapsLink);

        // Adds to the row
        row.appendChild(linksColumn);

        // Then append it to a locationsDiv
        locationsTable.appendChild(row)

        // SELECT, OPTION
        let selection = document.querySelector('#end');
        // Create an <option> 
        var option = document.createElement("OPTION");
        // Set the value with the address
        option.setAttribute('value', `${keyDataPoints[i][5]}`);
        // Create a text node for it, with the name of the place
        var insideOptionContent = document.createTextNode(`${keyDataPoints[i][0]}`);
        option.appendChild(insideOptionContent);
        selection.appendChild(option);
      }
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