function greeting() {

	var currentTime = new Date();
	var h = currentTime.getHours();
	
	if (h < 12)
		{
			document.write("Good morning");
		}
	
	else if (h >= 12)
	{
		if ( h < 18 )
		{
			document.write("Good Afternoon");
		}
		else if ( h > 18)
		{
			document.write("Good evening");
		}
		
		else if( h >= 22)
		{
			document.write("Good night");
		}
	}
	
}

greeting();
