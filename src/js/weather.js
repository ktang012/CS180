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
            setWeather(); // load default
        }
    });
}

function setWeather() {
    var data = { metric: ''};
    var unit = '';
    if ($('#weather_onoff').prop('checked')) {
        data.metric = 'fahrenheit';
        unit = 'f';
    }
    else if (!($('#weather_onoff').prop('checked'))) {
        data.metric = 'celsius';
        unit = 'c';
    }
    chrome.storage.sync.set(data, function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            loadWeather(position.coords.latitude+','+position.coords.longitude, null, unit);
        });
    });
}

function loadWeather(location, woeid, unit) {
  $.simpleWeather({
    location: location,
    woeid: woeid,
    unit: unit,
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

function setLocation() {


}
