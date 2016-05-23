function displayQuote() {

	dateVar = new Date();
	day = dateVar.getDay();

	if ( day == 1)
	{
		document.write("If each day is a gift, I would like to know where I can return Mondays.");
	}
	if ( day == 2)
	{
		document.write("Tuesday is better than Monday.");
	}
	if ( day == 3)
	{
		document.write("It's Wednesday, we're halfway there!");
	}
	if ( day == 4)
	{
		document.write("Throwback Thursdays!");
	}
	if ( day == 5)
	{
		document.write("TGIF.");
	}
	if ( day == 6)
	{
		document.write("Dear Saturday, I love you.");
	}
	if ( day == 0)
	{
		document.write("Sunday Funday!");
	}
	
}

displayQuote();
