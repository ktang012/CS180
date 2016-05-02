BEGIN

if( select exists (select * from Tasks t, User u where u.username = t.username)) THEN

	insert into Tasks
	(
        username,
		deadline,
		description
	)
	values
	(
        p_username,
		p_deadline,
		p_description
		
	);
	
ELSE
	insert into Tasks
	(
        username,
        taskid,
		deadline,
		description
	)
	values
	(
        p_username,
        1,
		p_deadline,
		p_description
		
	);


END IF;
END
