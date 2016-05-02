BEGIN

SELECT taskid, deadline, description, status FROM Tasks t, User u WHERE t.username = p_username AND u.username = p_username ORDER BY deadline ASC;

END
