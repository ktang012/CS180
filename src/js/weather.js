/*
    Plugin used: http://simpleweatherjs.com/
    Notes: DO NOT USE 'location'
*/

$(document).ready(function () {
    verifyGeolocation();
    loadSettings();
    $('#weather_switch').hide();
    $('#weather_input_location').hide();
    
    $('#weather_location').hover(function() {
        $('#weather_input_location').show();
        $('#weather_switch').show();
    });
    
    $('#weather_input_location').mouseout(function() {
        $('#weather_input_location').hide();
        $('#weather_switch').hide();
    });
    
    
    $('#weather_onoff').change(function() {
        chrome.storage.sync.get('set_location', function(data) {
            var result = data.set_location;
            setWeather(result);
        });
    });
    $('#weather_input_location').keypress(function(pressedKey) {
        if (pressedKey.which === 13) {
            var data = $('#weather_input_location').val();
            if (data.toUpperCase() === 'DEFAULT') {
                setWeather(null);
                var data = { set_location: null};
                chrome.storage.sync.set(data);
            }
            else if (data !== '' && isValidLocation(data)) {
                setWeather(data);
            }
        }
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
    chrome.storage.sync.get('metric', function(metricSetting) {
        currentMetric = metricSetting.metric;
        chrome.storage.sync.get('set_location', function(locationSetting) {
            setLocation = locationSetting.set_location;
            if (currentMetric === 'fahrenheit') {
                $('#weather_onoff').prop('checked', true);
            }
            else if (currentMetric === 'celsius') {
                $('#weather_onoff').prop('checked', false);
            }
            else {
                console.log("Cannot load metric settings.");
            }
            setWeather(setLocation);
        });
    });
}

function setWeather(setLocation) {
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

    if (setLocation === undefined || setLocation === null) {
        chrome.storage.sync.set(data, function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                loadWeather(position.coords.latitude+','+position.coords.longitude, null, unit);
            });
        });
    }
    else {
        chrome.storage.sync.set(data, function() {
            loadWeather(setLocation, null, unit);
        });
    }
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
            html = '<h5>' + weather.city + ', ' + weather.region + ' - ' + weather.country + '</h5>';
            $('#weather_location').html(html);
        },
        error: function(error) {
            console.log("Failed to load weather");
        }
    });
}

/* Verifies if valid location before actually changing weather; think of a better way if you can */
function isValidLocation(location) {
    return $.simpleWeather({
        location: location,
        woeid: null,
        unit: 'f',
        success: function(weather) {
            var data = { set_location: weather.city + ', ' + weather.region };
            return chrome.storage.sync.set(data, function() {
                return true;
            });
        },
        error: function(error) {
            return false;
        }
    });
}

