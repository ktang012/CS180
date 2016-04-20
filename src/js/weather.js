$(document).ready(function () {
    verifyGeolocation();  
    loadSettings();
    
    var weatherInterval = setInterval(setWeather, 600000);
    $('#weather_onoff').change(function() {
        setWeather();
    });
});

function verifyGeolocation() {
    if ("geolocation" in navigator) {
        $('#weather').show();
    }
    else {
        $('#weather').hide();
    }
}


/* Call initial setWeather() here due to asynchronicity of storage functions */
function loadSettings() {
    chrome.storage.sync.get('metric', function(result) {
        current_metric = result.metric;
        if (current_metric === 'fahrenheit') {
            $('#weather_onoff').prop('checked', true);
            setWeather();
        }
        else if (current_metric === 'celsius') {
            $('#weather_onoff').prop('checked', false);
            setWeather();
        }
        else {
            console.log("Error fetching weather metrics");     
        }
    });
}

function setWeather() {
    var data = { metric: ''};
    if ($('#weather_onoff').prop('checked')) {
        data.metric = 'fahrenheit';
        chrome.storage.sync.set(data, function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                loadFahrenheit(position.coords.latitude+','+position.coords.longitude);
            });
        });
    }
    else if (!($('#weather_onoff').prop('checked'))) {
        data.metric = 'celsius';
        chrome.storage.sync.set(data, function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                loadCelsius(position.coords.latitude+','+position.coords.longitude);
            });
        });
    }
}

function loadFahrenheit(location, woeid) {
  $.simpleWeather({
    location: location,
    woeid: woeid,
    unit: 'f',
    success: function(weather) {
        var html = '<h2>' + weather.temp + '&deg;' + weather.units.temp;
        html += '<img src="' + weather.thumbnail + '"></img></h2>';
        $('#weather_display').html(html);
    },
    error: function(error) {
      console.log("Failed to load weather");
      $('#weather').html('<p>'+error+'</p>');
    }
  });
}

function loadCelsius(location, woeid) {
  $.simpleWeather({
    location: location,
    woeid: woeid,
    unit: 'c',
    success: function(weather) {
        var html = '<h2>' + weather.temp + '&deg;' + weather.units.temp;
        html += '<img src="' + weather.thumbnail + '"></img></h2>';
        $('#weather_display').html(html);
    },
    error: function(error) {
      console.log("Failed to load weather");
      $('#weather').html('<p>'+error+'</p>');
    }
  });
}
