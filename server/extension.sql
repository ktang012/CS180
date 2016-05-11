-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 11, 2016 at 04:42 AM
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

SELECT owner, domainName, dailyTime, blockedTime, isBlocked, timeCap
FROM ListedSite L, User U
WHERE L.owner = p_username AND U.username = p_username AND L.domainName = p_domainName;

END$$

DROP PROCEDURE IF EXISTS `getListedSites`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getListedSites`(IN `_username` VARCHAR(50))
    NO SQL
BEGIN

SELECT owner, domainName, dailyTime, blockedTime, isBlocked, timeCap
FROM ListedSite L, User U
WHERE L.owner = _username AND U.username = _username;

END$$

DROP PROCEDURE IF EXISTS `getSiteTimeHistory`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getSiteTimeHistory`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50))
BEGIN 

SELECT * FROM SiteTimeHistory WHERE owner = _username AND domainName = _domainName;

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
	  AND L.blockedTime < L.timeCap AND L.dailyTime = p_dailyTime
	  AND L.blockedTime = p_blockedTime AND L.isBlocked = 1;

END$$

DROP PROCEDURE IF EXISTS `incrementAListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `incrementAListedSite`(IN `p_username` VARCHAR(50), IN `p_domainName` VARCHAR(50), IN `p_dailyTime` BIGINT)
    MODIFIES SQL DATA
    DETERMINISTIC
BEGIN

UPDATE ListedSite L
SET L.dailyTime = L.dailyTime + 1
WHERE L.owner = p_username AND L.domainName = p_domainName 
	  AND L.dailyTime = p_dailyTime AND L.isBlocked = 0;

END$$

DROP PROCEDURE IF EXISTS `updateListedSite`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateListedSite`(IN `_username` VARCHAR(50), IN `_domainName` VARCHAR(50), IN `_isBlocked` TINYINT, IN `_timeCap` BIGINT)
    MODIFIES SQL DATA
BEGIN
if(_isBlocked = 0) THEN
UPDATE ListedSite SET isBlocked = 1, timeCap = _timeCap WHERE owner = _username AND domainName = _domainName;
ELSE
UPDATE ListedSite SET isBlocked = 0, timeCap = _timeCap WHERE owner = _username AND domainName = _domainName;

END IF;
END$$

DELIMITER ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=174 ;

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
DROP EVENT `updateListedSiteTime`$$
CREATE DEFINER=`root`@`localhost` EVENT `updateListedSiteTime` ON SCHEDULE EVERY 1 DAY STARTS '2016-05-01 00:00:00' ENDS '2016-06-30 00:00:00' ON COMPLETION PRESERVE ENABLE COMMENT 'Updates SiteTimeHistory and clears ListedSite.dailyTime' DO BEGIN

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
