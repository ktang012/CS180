$(document).ready(function() {


var header = $('body');

var backgrounds = new Array(
    'url(img/img1.jpg)'
  , 'url(img/img2.jpg)'
  , 'url(img/img3.jpg)'
  , 'url(img/img4.jpg)'
  , 'url(img/img5.jpg)'
  , 'url(img/img6.jpg)'
  , 'url(img/img7.jpg)'
);

var current = 0;

function nextBackground() {
    current++;
    current = current % backgrounds.length;
    header.css('background-image', backgrounds[current]);
	header.css('background-size', '100% 1590%');
	header.css('background-repeat', 'no-repeat');
	
	
	
}


setInterval(nextBackground, 180000);

header.css('background-image', backgrounds[current]);	
header.css('background-size', '100% 1590%');
header.css('background-repeat', 'no-repeat');

});
