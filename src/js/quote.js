function displayQuote() {

	dateVar = new Date();
	day = dateVar.getDay();

	if ( day == 1)
	{
		document.write("Is Monday, go back to work.");
	}
	if ( day == 2)
	{
		document.write("Is Tuesday, you are still at work.");
	}
	if ( day == 3)
	{
		document.write("Is Wednesday, finish half week!");
	}
	if ( day == 4)
	{
		document.write("Is Thursday, one more day to go!");
	}
	if ( day == 5)
	{
		document.write("Is Friday, Friday!");
	}
	if ( day == 6)
	{
		document.write("Is Saturday, dont wake up, go back to sleep...");
	}
	if ( day == 0)
	{
		document.write("Is Sunday, leave me alone, this is my last day.");
	}
	
}

displayQuote();