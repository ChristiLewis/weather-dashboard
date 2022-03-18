//DECLARE VAR TO STORE THE USER INPUT REQUEST TO SEARCH FOR A CITY
var city = "";

//GLOBAL VARIABLE DECLARATIONS FROM API DOCS
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];

//FUNCTION AND FOR LOOP TO FIND THE CITY FROM STORAGE
function find(c) {
    for (var i = 0; i <sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

//USE NEW KEY
var APIKey = "25fd11c6f04d54621baa8fc4ccb2362f";

//DISPLAY CURRENT AND FUTURE WEATHER
function displayWeather(event) {
    event,preventDefault();
    if (searchCity.val().trim() !=="") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
//AJAX CALL
function currentWeather(city) {
    console.log(city)
    //URL FROM OPEN WEATHER
    var queryURL =  "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax(
        {
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            //PRINT
            console.log(response);

            //FROM SERVER
            var weathericon = response.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

            //DATE FROM BLER-KARLTUN REFERENCING MDN DOCS GLOBAL OBJECTS
            var date = new Date(response.dt * 1000).toLocaleDateString();

            //COMBINE OR CONCATENATE- DAISY CHAIN- CITY - DATE AND TIME
            $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");

            //CONVERT CELSIUS TO FAHRENHEIT
            var tempF = (response.main.temp - 273.15) * 1.80 + 32;
            $(currentTemperature).html((tempF).toFixed(2) + "&#8457");

            //HUMIDITY DISPLAY
            $(currentHumidty).html(response.main.humidity + "%");

            //WIND TO MPH
            var ws = response.wind.speed;
            var windsmph = (ws * 2.237).toFixed(1);
            $(currentWSpeed).html(windsmph + "MPH");

            //UV INDEX
            UVIndex(response.coord.lon, response.coord.lat);
            forecast(response.id);
            if (response.cod == 200) {
                sCity = JSON.parse(localStorage.getItem("cityname"));
                console.log(sCity);
                if (sCity == null) {
                    sCity = [];
                    sCity.push(city.toUpperCase()
                    );
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
                else {
                    if (find(city) > 0) {
                        sCity.push(city.toUpperCase());
                        localStorage.setItem("cityname", JSON.stringify(sCity));
                        addToList(city);
                    }
                }
            }
        });
}
// FUNCTIONS TO RETURN THE RESPONSE
//UV RESPONSE
function UVIndex(ln, lt) {
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// 5 DAY FORECAST
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }

    });
}

//AUTO ADD TO SEARCH HISTORY
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}

//DISPLAY STORED SEARCH BACK TO USER UPON RETURN
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

//RENDER 
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

//CLEAR
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}

//CLICK EVENTS
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);