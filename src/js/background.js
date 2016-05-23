$(document).ready(function() {
    var header = $('body');

    var backgrounds = new Array(
        'url(img/img1.jpg)',
        'url(img/img2.jpg)',
        'url(img/img3.jpg)',
        'url(img/img4.jpg)',
        'url(img/img5.jpg)',
        'url(img/img6.jpg)',
        'url(img/img7.jpg)'
    );

    var current = Math.floor(Math.random() * 100);
    current = current % backgrounds.length;
    function nextBackground() {
        current = Math.floor(Math.random() * 100);
        current = current % backgrounds.length;
        header.css('background-image', backgrounds[current]);
	    header.css('background-size', '100% 1600%');
	    header.css('background-repeat', 'repeat');
	    header.css('background-repeat', 'repeat');
	}


    setInterval(nextBackground, 180000);

    header.css('background-image', backgrounds[current]);	
    header.css('background-size', '100% 1600%');
    header.css('background-repeat', 'repeat');
});
