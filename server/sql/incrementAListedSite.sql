BEGIN

UPDATE ListedSite L
SET L.dailyTime = L.dailyTime + 1
WHERE L.owner = p_username AND L.domainName = p_domainName 
	  AND L.dailyTime < L.timeCap AND L.dailyTime = p_dailyTime;


SELECT owner, domainName, dailyTime, isBlocked, timeCap
FROM ListedSite L, User U
WHERE L.owner = p_username AND U.username = p_username 
	  AND L.domainName = p_domainName AND L.dailyTime = p_dailyTime + 1;

END
