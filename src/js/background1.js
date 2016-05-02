$(document).ready(function(){

var header = $('body');

var backgrounds = new Array(
    'url(img/img1.jpg)'
  , 'url(img/img2.jpg)'
  , 'url(img/img3.jpg)'
  , 'url(img/img4.png)'
  , 'url(img/img5.jpg)'
  , 'url(img/img6.jpg)'
  , 'url(img/img7.png)'
);


dateVar = new Date();
day = dateVar.getDay();

if ( day == 0)
{
	header.css('background-image', backgrounds[0]);
}
if ( day == 1)
{
	header.css('background-image', backgrounds[1]);
}
if ( day == 2)
{
	header.css('background-image', backgrounds[2]);
}
if ( day == 3)
{
	header.css('background-image', backgrounds[3]);
}
if ( day == 4)
{
	header.css('background-image', backgrounds[4]);
}
if ( day == 5)
{
	header.css('background-image', backgrounds[5]);
}
if ( day == 6)
{
	header.css('background-image', backgrounds[6]);
}

});