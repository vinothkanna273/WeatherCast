//Declare a variable to store the searched
var city = "";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history"); //
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var currentTime = $("#current-time");
var currentDate = $("#current-date");
var currentimage = $("#image");
var weatherApp = document.getElementById("weather-app");
var btn = document.querySelector('.submit');
var sCity = [];
// searches the city to see if it exists in the entries from the storage
function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey = "a0aca8a89948154a4182dcecc780b513";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city) {
    // Here we build the URL so we can get a data from server side.
    var queryURL =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&APPID=" +
        APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        // parse the response to display the current weather including the City name. the Date and the weather icon.
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon = response.weather[0].icon;
        var iconurl =
            "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name);

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        var formattedTime = hours + ":" + (minutes < 10 ? "0" : "") + minutes;
        $(currentTime).html(formattedTime);
        var options = { weekday: 'long', month: 'short', day: 'numeric' };
        var formattedDate = now.toLocaleDateString(undefined, options);
        $(currentDate).html(formattedDate);

        var weathericon = document.getElementById("weather-icon");
        weathericon.src = iconurl;

        //to display image -----vk
        //$(currentimage).html("<img src="+iconurl+">"); //------vk
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        //var tempF = (response.main.temp - 273.15) * 1.80 + 32;  // fahrenheit
        var tempF = response.main.temp - 273.15; //celsius
        $(currentTemperature).html(tempF.toFixed(0));
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity + "%");
        //Display Wind speed and convert to MPH
        var ws = response.wind.speed;
        var windsmph = (ws * 2.237).toFixed(1);
        $(currentWSpeed).html(windsmph + "MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
// This function returns the UVIindex response.
function UVIndex(ln, lt) {
    //lets build the url for uvindex.
    var uvqURL =
        "https://api.openweathermap.org/data/2.5/uvi?appid=" +
        APIKey +
        "&lat=" +
        lt +
        "&lon=" +
        ln;
    $.ajax({
        url: uvqURL,
        method: "GET",
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
  var dayover= false;
  var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
  $.ajax({
      url:queryforcastURL,
      method:"GET"
  }).then(function(response){
      
      for (i=0;i<5;i++){
          var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
          var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
          var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
          var tempK= response.list[((i+1)*8)-1].main.temp;
          var tempF=(tempK-273.5).toFixed(2);
          var humidity= response.list[((i+1)*8)-1].main.humidity;
      
          $("#fDate"+i).html(date);
          $("#fImg"+i).html("<img src="+iconurl+">");
          $("#fTemp"+i).html(tempF+"&#8451");
          $("#fHumidity"+i).html(humidity+"%");
      }
      
  });
}

//Dynamically add the passed city on the search history
function addToList(c) {
    var listEl = $("<li>" + c.charAt(0).toUpperCase() + c.slice(1) + "</li>");
    $(listEl).attr("class", "city");
    $(listEl).attr("data-value", c.charAt(0).toUpperCase() + c.slice(1));
    $(".cities").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// render function
function loadlastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }
}
//Clear the search history from the page
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}

function weatherBackground() {
    const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        var formattedTime = hours + ":" + (minutes < 10 ? "0" : "") + minutes;
        $(currentTime).html(formattedTime);
        var options = { weekday: 'long', month: 'short', day: 'numeric' };
        var formattedDate = now.toLocaleDateString(undefined, options);
        $(currentDate).html(formattedDate);
        
    // Here we build the URL so we can get a data from server side.
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&APPID=" +
      APIKey;
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      console.log("hello vk");
      var weathericon = response.weather[0].icon;
      var timeOfDay = 'day';
      if (weathericon.charAt(weathericon.length - 1) == "n") {
        timeOfDay = 'night';
      }

      //background is clear
      if (weathericon == "01d") {
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/clear.jpg) center';
        btn.style.background = "#e5ba92";
      }
      else if (weathericon == "01n") {
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/clear.jpg) center';
        btn.style.background = "#181e27";
      }
      //cloudy weather
      else if(weathericon == "02d" || weathericon == "03d" || weathericon == "04d"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/cloudy.jpg) center';
        btn.style.background = "#fa6d1b";
      }
      else if(weathericon == "02n" || weathericon == "03n" || weathericon == "04n"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/cloudy.jpg) center';
        btn.style.background = "#181e27";
      }
      //rainy weather
      else if(weathericon == "09d" || weathericon == "10d" || weathericon == "11d"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/rainy.jpg) center';
        btn.style.background = "#647d75";
      }
      else if(weathericon == "09n" || weathericon == "10n" || weathericon == "11n"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/rainy.jpg) center';
        btn.style.background = "#325c80";
      }
      //snow weather
      else if(weathericon == "13d"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/snowy.jpg) center';
        btn.style.background = "#4d72aa";
      }
      else if(weathericon == "13n"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/snowy.jpg) center';
        btn.style.background = "#1b1b1b";
      }
      //mist weather
      else if(weathericon == "50d"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/mist.jpg) center';
        btn.style.background = "#9d7578";
      }
      else if(weathericon == "50n"){
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/mist.jpg) center';
        btn.style.background = "#005f7c";
      }
      else{
        weatherApp.style.background = ' no-repeat url(image/'+timeOfDay+'/clear.jpg) center';
        btn.style.background = "#e5ba92";
      }
      weatherApp.style.backgroundSize = 'cover';

    });
  }
  
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$(window).on("load", weatherBackground);
$("#clear-history").on("click", clearHistory);
