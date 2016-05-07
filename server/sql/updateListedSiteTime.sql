UPDATE SiteTimeHistory S, ListedSite L
SET S.dailyTime_6 = S.dailyTime_5,
	S.dailyTime_5 = S.dailyTime_4,
	S.dailyTime_4 = S.dailyTime_3,
	S.dailyTime_3 = S.dailyTime_2,
	S.dailyTime_2 = S.dailyTime_1,
	S.dailyTime_1 = S.dailyTime_0,
	S.dailyTime_0 = L.dailyTime,
	L.dailyTime = 0
WHERE L.owner = S.owner AND L.domainName = S.domainName;

END
