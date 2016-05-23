-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 22, 2016 at 08:17 PM
-- Server version: 5.5.47-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `extension`
--
CREATE DATABASE IF NOT EXISTS `extension` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `extension`;

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `add_task`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_task`(IN `p_username` VARCHAR(50), IN `p_deadline` DATE, IN `p_description` TEXT)
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
END$$

DROP PROCEDURE IF EXISTS `check_task`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `check_task`(IN `p_taskid` INT, IN `p_status` BOOLEAN)
BEGIN

if(p_status = 0) THEN
UPDATE Tasks set status = 1 WHERE taskid = p_taskid;
ELSE
UPDATE Tasks set status = 0 WHERE taskid = p_taskid;

END IF;

END$$

DROP PROCEDURE IF EXISTS `createCalendarEvent`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createCalendarEvent`(IN `_username` VARCHAR(50), IN `_date` DATE, IN `_description` TEXT)
    MODIFIES SQL DATA
BEGIN

insert into Event
(
    username,
    date,
    description
)

values
(
    _username,
    _date,
    _description
);


END$$

DROP PROCEDURE IF EXISTS `createIdleTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createIdleTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    MODIFIES SQL DATA
BEGIN
if ( select exists (select 1 from User where username = _username) ) THEN

INSERT INTO IdleTimeHistory
(
    owner,
    domainName
)
values
(
    _username,
    _domainName
);

ELSE
SELECT 'Username does not exist!!';
END IF;
END$$

DROP PROCEDURE IF EXISTS `createListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createListedSite`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50), IN ` _isBlocked` INT(1), IN `_timeCap` INT(20))
    MODIFIES SQL DATA
BEGIN
IF ( SELECT EXISTS (SELECT 1 FROM User where username = _username) ) THEN

	IF (_timeCap = 0) THEN
        
		INSERT INTO ListedSite 
		(
    		owner,
    		domainName,
    		isBlocked,
    		timeCap
		)
		values
		(
    		_username,
    		_domainName,
    		0,
    		_timeCap
		);

	ELSE
		INSERT INTO ListedSite 
		(
    		owner,
    		domainName,
    		isBlocked,
    		timeCap
		)
		values
		(
    		_username,
    		_domainName,
    		1,
    		_timeCap
		);

	END IF;

ELSE

	Select 'Username does exists !!';

END IF;


END$$

DROP PROCEDURE IF EXISTS `createSiteTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createSiteTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    MODIFIES SQL DATA
BEGIN
if ( select exists (select 1 from User where username = _username) ) THEN

INSERT INTO SiteTimeHistory
(
    owner,
    domainName
)
values
(
    _username,
    _domainName
);

ELSE
SELECT 'Username does not exist!!';
END IF;
END$$

DROP PROCEDURE IF EXISTS `createUser`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createUser`(IN `p_username` VARCHAR(50))
BEGIN
if ( select exists (select 1 from User where username = p_username) ) THEN

    select 'Username Exists !!';

ELSE

insert into User
(
    username
)

values
(
    p_username
);

END IF;
END$$

DROP PROCEDURE IF EXISTS `deleteCalendarEvent`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteCalendarEvent`(IN `_event_id` INT)
    MODIFIES SQL DATA
BEGIN

DELETE FROM Event
WHERE event_id = _event_id;

END$$

DROP PROCEDURE IF EXISTS `deleteIdleTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteIdleTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    MODIFIES SQL DATA
BEGIN

DELETE FROM IdleTimeHistory 
WHERE owner = _username AND domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `deleteListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteListedSite`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    MODIFIES SQL DATA
BEGIN

DELETE FROM ListedSite WHERE owner = _username AND domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `deleteSiteTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteSiteTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    MODIFIES SQL DATA
BEGIN

DELETE FROM SiteTimeHistory WHERE owner = _username AND domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `delete_task`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_task`(IN `p_taskid` INT)
BEGIN

DELETE FROM Tasks WHERE taskid = p_taskid;

END$$

DROP PROCEDURE IF EXISTS `getAListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getAListedSite`(IN `p_username` VARCHAR(50), IN `p_domainName` VARCHAR(50))
BEGIN

SELECT owner, domainName, dailyTime, blockedTime, 
	   isBlocked, timeCap, idleTime
FROM ListedSite L, User U
WHERE L.owner = p_username AND U.username = p_username AND L.domainName = p_domainName;

END$$

DROP PROCEDURE IF EXISTS `getEvents`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getEvents`(IN `_username` VARCHAR(50))
BEGIN

SELECT event_id, date, description
FROM Event 
WHERE username = _username
ORDER BY date ASC;

END$$

DROP PROCEDURE IF EXISTS `getIdleTimeHistories`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getIdleTimeHistories`(IN `_username` VARCHAR(50))
    READS SQL DATA
BEGIN 

SELECT *
FROM IdleTimeHistory 
WHERE owner = _username;

END$$

DROP PROCEDURE IF EXISTS `getIdleTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getIdleTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
    READS SQL DATA
BEGIN 

SELECT * FROM IdleTimeHistory 
WHERE owner = _username AND domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `getListedSites`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getListedSites`(IN `_username` VARCHAR(50))
    NO SQL
BEGIN

SELECT owner, domainName, dailyTime, blockedTime, isBlocked, timeCap,
	   idleTime
FROM ListedSite L, User U
WHERE L.owner = _username AND U.username = _username;

END$$

DROP PROCEDURE IF EXISTS `getSiteTimeHistories`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getSiteTimeHistories`(IN `_username` VARCHAR(50))
    NO SQL
BEGIN 

SELECT *
FROM SiteTimeHistory 
WHERE owner = _username;

END$$

DROP PROCEDURE IF EXISTS `getSiteTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getSiteTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
BEGIN 

SELECT * FROM SiteTimeHistory WHERE owner = _username AND domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `getSpecialEvents`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getSpecialEvents`(IN `_username` VARCHAR(50))
BEGIN

SELECT date FROM Event WHERE username = _username;

END$$

DROP PROCEDURE IF EXISTS `get_all_tasks`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_tasks`(IN `p_username` VARCHAR(50))
    DETERMINISTIC
BEGIN

SELECT taskid, deadline, description, status FROM Tasks t, User u WHERE t.username = p_username AND u.username = p_username ORDER BY deadline ASC;



END$$

DROP PROCEDURE IF EXISTS `incrementABlockedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `incrementABlockedSite`(IN `p_username` VARCHAR(50), IN `p_domainName` VARCHAR(50), IN `p_dailyTime` BIGINT, IN `p_blockedTime` BIGINT)
    MODIFIES SQL DATA
BEGIN

UPDATE ListedSite L
SET L.dailyTime = L.dailyTime + 1, L.blockedTime = L.blockedTime + 1
WHERE L.owner = p_username AND L.domainName = p_domainName 
	  AND L.blockedTime < L.timeCap AND L.isBlocked = 1;

END$$

DROP PROCEDURE IF EXISTS `incrementAListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `incrementAListedSite`(IN `p_username` VARCHAR(50), IN `p_domainName` VARCHAR(50), IN `p_dailyTime` BIGINT)
    MODIFIES SQL DATA
    DETERMINISTIC
BEGIN

UPDATE ListedSite L
SET L.dailyTime = L.dailyTime + 1
WHERE L.owner = p_username AND L.domainName = p_domainName 
	  AND L.isBlocked = 0;

END$$

DROP PROCEDURE IF EXISTS `testUpdate`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `testUpdate`()
    MODIFIES SQL DATA
BEGIN

UPDATE SiteTimeHistory S, ListedSite L
SET S.dailyTime_6 = S.dailyTime_5,
	S.dailyTime_5 = S.dailyTime_4,
	S.dailyTime_4 = S.dailyTime_3,
	S.dailyTime_3 = S.dailyTime_2,
	S.dailyTime_2 = S.dailyTime_1,
	S.dailyTime_1 = S.dailyTime_0,
	S.dailyTime_0 = L.dailyTime,

	L.dailyTime = 0,
	L.blockedTime = 0
WHERE L.owner = S.owner AND L.domainName = S.domainName;

END$$

DROP PROCEDURE IF EXISTS `updateIdleTime`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateIdleTime`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50), IN `_idleTime` BIGINT)
    MODIFIES SQL DATA
BEGIN

UPDATE ListedSite L
SET L.idleTime = _idleTime
WHERE L.owner = _username AND L.domainName = _domainName;

END$$

DROP PROCEDURE IF EXISTS `updateListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateListedSite`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50), IN `_isBlocked` TINYINT, IN `_timeCap` BIGINT)
    MODIFIES SQL DATA
BEGIN

UPDATE ListedSite 
SET isBlocked = _isBlocked, timeCap = _timeCap 
WHERE owner = _username AND domainName = _domainName;


END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
CREATE TABLE IF NOT EXISTS `Event` (
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=66 ;

-- --------------------------------------------------------

--
-- Table structure for table `IdleTimeHistory`
--

DROP TABLE IF EXISTS `IdleTimeHistory`;
CREATE TABLE IF NOT EXISTS `IdleTimeHistory` (
  `owner` varchar(50) NOT NULL,
  `domainName` varchar(50) NOT NULL,
  `idleTime_0` bigint(20) NOT NULL,
  `idleTime_1` bigint(20) NOT NULL,
  `idleTime_2` bigint(20) NOT NULL,
  `idleTime_3` bigint(20) NOT NULL,
  `idleTime_4` bigint(20) NOT NULL,
  `idleTime_5` bigint(20) NOT NULL,
  `idleTime_6` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `ListedSite`
--

DROP TABLE IF EXISTS `ListedSite`;
CREATE TABLE IF NOT EXISTS `ListedSite` (
  `domainName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dailyTime` bigint(20) NOT NULL DEFAULT '0',
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `owner` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeCap` bigint(20) DEFAULT '3600',
  `blockedTime` bigint(20) NOT NULL DEFAULT '0',
  `idleTime` bigint(20) NOT NULL,
  PRIMARY KEY (`domainName`,`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `SiteTimeHistory`
--

DROP TABLE IF EXISTS `SiteTimeHistory`;
CREATE TABLE IF NOT EXISTS `SiteTimeHistory` (
  `owner` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domainName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dailyTime_0` bigint(11) NOT NULL,
  `dailyTime_1` bigint(11) NOT NULL,
  `dailyTime_2` bigint(11) NOT NULL,
  `dailyTime_3` bigint(11) NOT NULL,
  `dailyTime_4` bigint(11) NOT NULL,
  `dailyTime_5` bigint(11) NOT NULL,
  `dailyTime_6` bigint(11) NOT NULL,
  PRIMARY KEY (`owner`,`domainName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Tasks`
--

DROP TABLE IF EXISTS `Tasks`;
CREATE TABLE IF NOT EXISTS `Tasks` (
  `taskid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` date NOT NULL,
  `description` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`taskid`,`username`),
  KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=344 ;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`username`),
  KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DELIMITER $$
--
-- Events
--
DROP EVENT `updateListedSiteTime_2`$$
CREATE DEFINER=`root`@`localhost` EVENT `updateListedSiteTime_2` ON SCHEDULE EVERY 1 DAY STARTS '2016-05-01 00:00:00' ENDS '2016-06-30 00:00:00' ON COMPLETION PRESERVE ENABLE COMMENT 'Updates SiteTimeHistory and clears ListedSite.dailyTime' DO BEGIN

UPDATE SiteTimeHistory S, IdleTimeHistory I, 
	   ListedSite L
SET S.dailyTime_6 = S.dailyTime_5,
	S.dailyTime_5 = S.dailyTime_4,
	S.dailyTime_4 = S.dailyTime_3,
	S.dailyTime_3 = S.dailyTime_2,
	S.dailyTime_2 = S.dailyTime_1,
	S.dailyTime_1 = S.dailyTime_0,
	S.dailyTime_0 = L.dailyTime,

	I.idleTime_6 = I.idleTime_5,
	I.idleTime_5 = I.idleTime_4,
	I.idleTime_4 = I.idleTime_3,
	I.idleTime_3 = I.idleTime_2,
	I.idleTime_2 = I.idleTime_1,
	I.idleTime_1 = I.idleTime_0,
	I.idleTime_0 = L.activeTime,

	L.dailyTime = 0,
	L.blockedTime = 0
WHERE L.owner = S.owner AND L.domainName = S.domainName AND
	  L.owner = I.owner AND L.domainName = I.domainName;

END$$

DROP EVENT `updateListedSiteTime`$$
CREATE DEFINER=`root`@`localhost` EVENT `updateListedSiteTime` ON SCHEDULE EVERY 1 DAY STARTS '2016-05-01 00:00:00' ENDS '2016-09-30 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

UPDATE SiteTimeHistory S, ListedSite L
SET S.dailyTime_6 = S.dailyTime_5,
	S.dailyTime_5 = S.dailyTime_4,
	S.dailyTime_4 = S.dailyTime_3,
	S.dailyTime_3 = S.dailyTime_2,
	S.dailyTime_2 = S.dailyTime_1,
	S.dailyTime_1 = S.dailyTime_0,
	S.dailyTime_0 = L.dailyTime,

	L.dailyTime = 0,
	L.blockedTime = 0
WHERE L.owner = S.owner AND L.domainName = S.domainName;

END$$

DELIMITER ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
