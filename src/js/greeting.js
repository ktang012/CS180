function greeting() {

	var currentTime = new Date();
	var h = currentTime.getHours();
	
	if (h < 12)
		{
			document.write("Good morning");
		}
	
	if (h >= 12)
	{
		if ( h < 20)
		{
			document.write("Good evening");
		}
		
		if( h >= 20)
		{
			document.write("Good night");
		}
	}
	
}

greeting();
