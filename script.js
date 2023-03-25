//get current lat and lon and send it to getCity Function 
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else { 
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function showPosition(position) {
    let l = position.coords.latitude
    let lo = position.coords.longitude
    getCity(null, l,lo)
  }
  
  function showError(error) {
    // Set the default city as london
    let l = 51.507351
    let lo = -0.127758
    getCity(null, l,lo)
  }

  // ! fetch the cities arrays NEW WAY !
let cityNamesList = [];
let cityLngList = [];
let cityLatList = [];
let lowerCaseNames = []
let filterdList = []
async function getCitiesArrays() {
    fetch('./cityList.json', {
        "method": "GET"
    })
    .then(response => {
        return response.json()
    })
    .then(data => {
        cityNamesList =  data['Names']
        cityLatList =  data['Latitude']
        cityLngList =  data['Longitude']
        for (let i in cityNamesList) {
            lowerCaseNames.push(cityNamesList[i].toLowerCase())
        }
        filterdList = lowerCaseNames
        document.querySelector('.loading-screen').style.display = "none"
        getLocation()
    })
    .catch(err => alert(err))
}

getCitiesArrays()

// function when key searched
let expectUl = document.querySelector('.expectUl')
function searchBtn(event) {
    expectUl.innerHTML = ``
    let inputCity = document.getElementById('searchBar').value.toLowerCase()
    if (event.keyCode > 90 ||event.keyCode < 65 ) {
        lowerCaseNames = filterdList
        for (let i in inputCity) {
        lowerCaseNames =  lowerCaseNames.filter(c => {
            return (c[i] == inputCity[i])
        })
        }
        for (let i in lowerCaseNames) {
            if (i <= 3) {
                expectUl.innerHTML += `
                <li onclick="getCity(${filterdList.indexOf(lowerCaseNames[i])})" class="expectLi">${cityNamesList[filterdList.indexOf(lowerCaseNames[i])]}</li>
                `
            }
        }
    } else {
        
        lowerCaseNames = filterdList
        for (let i in inputCity) {
        lowerCaseNames =  lowerCaseNames.filter(c => {
            return (c[i] == inputCity[i])
        })
        }
        for (let i in lowerCaseNames) {
            if (i <= 3) {
                expectUl.innerHTML += `
                <li onclick="getCity(${filterdList.indexOf(lowerCaseNames[i])})" class="expectLi">${cityNamesList[filterdList.indexOf(lowerCaseNames[i])]}</li>
                `
            }
        }
    }
}


let cityNameEl = document.querySelector('.cityName')
let tempMainEl = document.querySelector('.tempMain')
let tempDegreeEl = document.querySelector('.tempDegree')
let feelLikeEl = document.querySelector('.feelLike')
let cloudsEl = document.querySelector('.clouds')
let sunsetEl = document.querySelector('.sunset')
let sunriseEl = document.querySelector('.sunrise')
let clockTimeEl = document.querySelector('.clock-time')
let clockDateEl = document.querySelector('.clock-date')

let fellsTempInC;
let fellsTempInF;

let tempInC;
let tempInF;


let tempUnit = 'c'

let clockInterval;
async function getCity(index, latit, longit) {
    clearInterval(clockInterval)
    cityNameEl.innerHTML = 'Loading...'
    tempMainEl.innerHTML = 'Loading...'
    tempDegreeEl.innerHTML = 'Loading...'
    feelLikeEl.innerHTML = 'Loading...'
    cloudsEl.innerHTML = 'Loading...'
    clockTimeEl.innerHTML = 'Loading...'
    clockDateEl.innerHTML = ''
    let lat;
    let lon;
    if (latit && longit && index == null) {
        lat = latit
        lon = longit
    } else {
        lat = cityLatList[index]
        lon = cityLngList[index]
    }
    let api_key = '24b85d3674228337882df68cd32a9745'
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`
    let res = await fetch(url)
    let json = await res.json()
    tempInC = (Math.round(json['main']['temp'] - 273))
    tempInF = (Math.round((json['main']['temp'] - 273.15) * 9/5 + 32))
    fellsTempInC = (Math.round(json['main']['feels_like'] - 273))
    fellsTempInF = (Math.round((json['main']['feels_like'] - 273.15) * 9/5 + 32))
    let weatherMain = json['weather'][0]['main']
    let clouds = json['clouds']['all']
    // put in html elements
    tempMainEl.innerHTML = weatherMain
    if (tempUnit == 'c') {
        tempDegreeEl.innerHTML = tempInC + " c°"
        feelLikeEl.innerHTML = 'feels Like : ' + fellsTempInC + ' c°'
    } else {
        tempDegreeEl.innerHTML = tempInF + ' f°'
        feelLikeEl.innerHTML = 'feels Like : ' + fellsTempInF + ' f°'
    }
    cloudsEl.innerHTML = 'Clouds : ' +  clouds + "%"

    //* Put City Name
    if (latit && longit && index == null) cityNameEl.innerHTML = json["name"]
    else cityNameEl.innerHTML = cityNamesList[index]
    getTime(lat, lon)
    clockInterval = setInterval(()=>{
        getTime(lat, lon)
    }, 60000)

}

function changeTemp(unit) {
    if (unit == tempUnit) {
        console.log(unit)
    } else {
        tempUnit = unit
        if (unit == 'c') {
            document.querySelector('.feh').classList.remove('activeTemp')
            document.querySelector('.feh').classList.remove('fehActive')
            document.querySelector('.cel').classList.add('activeTemp')
            document.querySelector('.cel').classList.add('celActive')
            tempDegreeEl.innerHTML = tempInC + " c°"
            feelLikeEl.innerHTML = 'feels Like : ' + fellsTempInC + ' c°'
        } else {
            tempDegreeEl.innerHTML = tempInF + ' f°'
            document.querySelector('.cel').classList.remove('activeTemp')
            document.querySelector('.cel').classList.remove('celActive')
            document.querySelector('.feh').classList.add('activeTemp')
            document.querySelector('.feh').classList.add('fehActive')
            feelLikeEl.innerHTML = 'feels Like : ' + fellsTempInF + ' f°'
        }
    }
}


async function getTime(lat, lon) { 

    try {
        let response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=e78ee3c1459742be8caee1caf1c941d6`)
        let json = await response.json()
        let localTimeZone = (json['features'][0]['properties']['timezone'])
        let time = (new Date().toLocaleString("en-US", {timeZone: localTimeZone['name']}))
        let timeArray = time.split(', ')
        clockTimeEl.innerHTML = timeArray[1]
        clockDateEl.innerHTML = timeArray[0]
        if (timeArray[1].indexOf('A') == -1) {// Night
            (document.querySelector('.bodyTag')).style = 'background-image: url("images/bg/night.jpg")'
        } else {// morning 
            (document.querySelector('.bodyTag')).style = 'background-image: url("images/bg/morning.jpg")'
        }
    } catch {
        clockTimeEl.innerHTML = "Error"
        clockDateEl.innerHTML = "" 
    }

}




  // ! fetch the cities arrays OLD WAY !

  /* 
const url = `http://api.geonames.org/search?featureClass=P&orderby=population&maxRows=1000&username=HaidarKhalid`;

let filterdList;
    fetch(url)
    .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
        } else {
        return response.text();
        }
    })
    .then(data => {
        if (typeof data === 'string') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        const cities = xml.getElementsByTagName('geoname');
        for (let i = 0; i < cities.length; i++) {
            const name = cities[i].getElementsByTagName('name')[0].textContent;
            const lat = cities[i].getElementsByTagName('lat')[0].textContent;
            const lng = cities[i].getElementsByTagName('lng')[0].textContent;
            cityNamesList.push(name);
            cityLngList.push(lng);
            cityLatList.push(lat);
            x.push(name.toLowerCase());
        }
        } else {
        const cities = data.geonames;
        const cityList = cities.map(city => {
            const { name, lat, lng } = city;
            return { name, lat, lng };
        });
        }
        filterdList = []
        cityNamesList.forEach(c => filterdList.push(c.toLowerCase()));
        document.querySelector('.loading-screen').style.display = "none"
        getLocation()
    })
    .catch(error => alert(error));

 */
