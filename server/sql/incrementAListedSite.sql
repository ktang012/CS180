BEGIN

UPDATE ListedSite L
SET L.dailyTime = L.dailyTime + 1
WHERE L.owner = p_username AND L.domainName = p_domainName 
	  AND L.dailyTime < L.timeCap AND L.dailyTime = p_dailyTime;

END
