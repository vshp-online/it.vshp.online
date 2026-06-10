-- MySQL dump 10.13  Distrib 8.0.19, for osx10.14 (x86_64)
--
-- Host: 127.0.0.1    Database: employee
-- ------------------------------------------------------
-- Server version	8.0.19-debug

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @old_autocommit=@@autocommit;

--
-- Current Database: `employee`
--

/*!40000 DROP DATABASE IF EXISTS `employee`*/;

CREATE DATABASE `employee` DEFAULT CHARACTER SET utf8mb4;

USE `employee`;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL DEFAULT '',
  `Location` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--
-- ORDER BY:  `ID`

set autocommit=0;
INSERT INTO `department` VALUES (1,'Engineering','New York');
INSERT INTO `department` VALUES (2,'Marketing','San Francisco');
INSERT INTO `department` VALUES (3,'Human Resources','Chicago');
INSERT INTO `department` VALUES (4,'Finance','Boston');
INSERT INTO `department` VALUES (5,'Sales','Los Angeles');
INSERT INTO `department` VALUES (6,'IT Support','Seattle');
INSERT INTO `department` VALUES (7,'Research & Development','Austin');
INSERT INTO `department` VALUES (8,'Legal','Washington DC');
INSERT INTO `department` VALUES (9,'Operations','Denver');
INSERT INTO `department` VALUES (10,'Customer Service','Miami');
commit;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(100) NOT NULL DEFAULT '',
  `MinSalary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `MaxSalary` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--
-- ORDER BY:  `ID`

set autocommit=0;
INSERT INTO `position` VALUES (1,'Junior Developer',40000.00,65000.00);
INSERT INTO `position` VALUES (2,'Senior Developer',70000.00,120000.00);
INSERT INTO `position` VALUES (3,'Team Lead',100000.00,150000.00);
INSERT INTO `position` VALUES (4,'Marketing Specialist',45000.00,70000.00);
INSERT INTO `position` VALUES (5,'Marketing Manager',75000.00,110000.00);
INSERT INTO `position` VALUES (6,'HR Coordinator',40000.00,60000.00);
INSERT INTO `position` VALUES (7,'HR Manager',65000.00,95000.00);
INSERT INTO `position` VALUES (8,'Financial Analyst',55000.00,85000.00);
INSERT INTO `position` VALUES (9,'Accountant',45000.00,70000.00);
INSERT INTO `position` VALUES (10,'Sales Representative',35000.00,60000.00);
INSERT INTO `position` VALUES (11,'Sales Manager',70000.00,110000.00);
INSERT INTO `position` VALUES (12,'IT Support Specialist',40000.00,65000.00);
INSERT INTO `position` VALUES (13,'DevOps Engineer',80000.00,130000.00);
INSERT INTO `position` VALUES (14,'Data Scientist',90000.00,140000.00);
INSERT INTO `position` VALUES (15,'Legal Counsel',80000.00,130000.00);
INSERT INTO `position` VALUES (16,'Operations Manager',70000.00,105000.00);
INSERT INTO `position` VALUES (17,'Customer Support Agent',30000.00,50000.00);
INSERT INTO `position` VALUES (18,'QA Engineer',50000.00,80000.00);
INSERT INTO `position` VALUES (19,'Product Manager',90000.00,140000.00);
INSERT INTO `position` VALUES (20,'UX Designer',60000.00,95000.00);
commit;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL DEFAULT '',
  `LastName` varchar(50) NOT NULL DEFAULT '',
  `Email` varchar(100) NOT NULL DEFAULT '',
  `Phone` varchar(20) NOT NULL DEFAULT '',
  `HireDate` date NOT NULL,
  `Salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `DepartmentID` int NOT NULL DEFAULT '0',
  `PositionID` int NOT NULL DEFAULT '0',
  `ManagerID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `DepartmentID` (`DepartmentID`),
  KEY `PositionID` (`PositionID`),
  KEY `ManagerID` (`ManagerID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`ID`),
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`PositionID`) REFERENCES `position` (`ID`),
  CONSTRAINT `employee_ibfk_3` FOREIGN KEY (`ManagerID`) REFERENCES `employee` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--
-- ORDER BY:  `ID`

set autocommit=0;
INSERT INTO `employee` VALUES (1,'John','Smith','john.smith@company.com','+1-212-555-0101','2018-03-15',145000.00,1,3,NULL);
INSERT INTO `employee` VALUES (2,'Emily','Johnson','emily.johnson@company.com','+1-212-555-0102','2019-06-01',95000.00,1,2,1);
INSERT INTO `employee` VALUES (3,'Michael','Williams','michael.williams@company.com','+1-212-555-0103','2020-01-10',82000.00,1,2,1);
INSERT INTO `employee` VALUES (4,'Sarah','Brown','sarah.brown@company.com','+1-212-555-0104','2021-09-20',55000.00,1,1,2);
INSERT INTO `employee` VALUES (5,'David','Jones','david.jones@company.com','+1-212-555-0105','2022-04-05',48000.00,1,1,3);
INSERT INTO `employee` VALUES (6,'Jessica','Garcia','jessica.garcia@company.com','+1-415-555-0201','2017-11-01',105000.00,2,5,NULL);
INSERT INTO `employee` VALUES (7,'Daniel','Martinez','daniel.martinez@company.com','+1-415-555-0202','2019-02-14',65000.00,2,4,6);
INSERT INTO `employee` VALUES (8,'Ashley','Rodriguez','ashley.rodriguez@company.com','+1-415-555-0203','2020-07-22',58000.00,2,4,6);
INSERT INTO `employee` VALUES (9,'Christopher','Lee','christopher.lee@company.com','+1-312-555-0301','2016-05-10',90000.00,3,7,NULL);
INSERT INTO `employee` VALUES (10,'Amanda','Walker','amanda.walker@company.com','+1-312-555-0302','2018-08-19',52000.00,3,6,9);
INSERT INTO `employee` VALUES (11,'Matthew','Hall','matthew.hall@company.com','+1-312-555-0303','2021-12-01',45000.00,3,6,9);
INSERT INTO `employee` VALUES (12,'Jennifer','Allen','jennifer.allen@company.com','+1-617-555-0401','2019-04-15',80000.00,4,8,NULL);
INSERT INTO `employee` VALUES (13,'Joshua','Young','joshua.young@company.com','+1-617-555-0402','2020-10-30',62000.00,4,9,12);
INSERT INTO `employee` VALUES (14,'Megan','King','megan.king@company.com','+1-213-555-0501','2017-07-05',105000.00,5,11,NULL);
INSERT INTO `employee` VALUES (15,'Ryan','Wright','ryan.wright@company.com','+1-213-555-0502','2019-11-11',55000.00,5,10,14);
INSERT INTO `employee` VALUES (16,'Lauren','Lopez','lauren.lopez@company.com','+1-213-555-0503','2021-03-22',50000.00,5,10,14);
INSERT INTO `employee` VALUES (17,'Andrew','Hill','andrew.hill@company.com','+1-206-555-0601','2020-06-15',60000.00,6,12,1);
INSERT INTO `employee` VALUES (18,'Stephanie','Scott','stephanie.scott@company.com','+1-206-555-0602','2021-01-10',115000.00,6,13,1);
INSERT INTO `employee` VALUES (19,'Nicholas','Green','nicholas.green@company.com','+1-512-555-0701','2019-08-20',120000.00,7,14,1);
INSERT INTO `employee` VALUES (20,'Rachel','Adams','rachel.adams@company.com','+1-512-555-0702','2022-02-28',95000.00,7,19,1);
INSERT INTO `employee` VALUES (21,'Tyler','Baker','tyler.baker@company.com','+1-202-555-0801','2018-12-01',110000.00,8,15,NULL);
INSERT INTO `employee` VALUES (22,'Hannah','Nelson','hannah.nelson@company.com','+1-303-555-0901','2016-09-10',98000.00,9,16,NULL);
INSERT INTO `employee` VALUES (23,'Brandon','Carter','brandon.carter@company.com','+1-303-555-0902','2020-05-05',72000.00,9,18,1);
INSERT INTO `employee` VALUES (24,'Victoria','Mitchell','victoria.mitchell@company.com','+1-305-555-1001','2021-07-19',42000.00,10,17,22);
INSERT INTO `employee` VALUES (25,'Kevin','Roberts','kevin.roberts@company.com','+1-305-555-1002','2022-09-12',38000.00,10,17,22);
commit;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(150) NOT NULL DEFAULT '',
  `StartDate` date NOT NULL,
  `EndDate` date DEFAULT NULL,
  `Budget` decimal(12,2) NOT NULL DEFAULT '0.00',
  `DepartmentID` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--
-- ORDER BY:  `ID`

set autocommit=0;
INSERT INTO `project` VALUES (1,'Cloud Migration','2023-01-15','2023-08-30',500000.00,1);
INSERT INTO `project` VALUES (2,'Mobile App v2','2023-03-01','2023-12-15',350000.00,1);
INSERT INTO `project` VALUES (3,'Brand Refresh','2023-02-10','2023-06-30',120000.00,2);
INSERT INTO `project` VALUES (4,'Benefits System Upgrade','2023-04-01',NULL,80000.00,3);
INSERT INTO `project` VALUES (5,'Q4 Financial Audit','2023-10-01','2024-01-31',60000.00,4);
INSERT INTO `project` VALUES (6,'European Market Expansion','2023-05-15','2024-03-31',750000.00,5);
INSERT INTO `project` VALUES (7,'Data Analytics Platform','2023-06-01','2024-02-28',450000.00,7);
INSERT INTO `project` VALUES (8,'Office Relocation','2023-09-01','2023-11-30',200000.00,9);
commit;

--
-- Table structure for table `employee_project`
--

DROP TABLE IF EXISTS `employee_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_project` (
  `EmployeeID` int NOT NULL DEFAULT '0',
  `ProjectID` int NOT NULL DEFAULT '0',
  `Role` varchar(100) NOT NULL DEFAULT '',
  `HoursAllocated` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`EmployeeID`,`ProjectID`),
  KEY `ProjectID` (`ProjectID`),
  CONSTRAINT `employee_project_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`ID`),
  CONSTRAINT `employee_project_ibfk_2` FOREIGN KEY (`ProjectID`) REFERENCES `project` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_project`
--
-- ORDER BY:  `EmployeeID`, `ProjectID`

set autocommit=0;
INSERT INTO `employee_project` VALUES (1,1,'Project Sponsor',40);
INSERT INTO `employee_project` VALUES (1,2,'Technical Advisor',20);
INSERT INTO `employee_project` VALUES (2,1,'Lead Developer',160);
INSERT INTO `employee_project` VALUES (3,2,'Lead Developer',160);
INSERT INTO `employee_project` VALUES (4,1,'Developer',160);
INSERT INTO `employee_project` VALUES (5,2,'Developer',160);
INSERT INTO `employee_project` VALUES (6,3,'Marketing Lead',120);
INSERT INTO `employee_project` VALUES (7,3,'Marketing Specialist',160);
INSERT INTO `employee_project` VALUES (8,3,'Content Creator',160);
INSERT INTO `employee_project` VALUES (9,4,'Project Manager',80);
INSERT INTO `employee_project` VALUES (10,4,'HR Coordinator',160);
INSERT INTO `employee_project` VALUES (12,5,'Lead Auditor',160);
INSERT INTO `employee_project` VALUES (13,5,'Accountant',160);
INSERT INTO `employee_project` VALUES (14,6,'Sales Director',100);
INSERT INTO `employee_project` VALUES (15,6,'Sales Representative',160);
INSERT INTO `employee_project` VALUES (16,6,'Sales Representative',160);
INSERT INTO `employee_project` VALUES (19,7,'Data Science Lead',160);
INSERT INTO `employee_project` VALUES (20,7,'Product Manager',120);
INSERT INTO `employee_project` VALUES (22,8,'Operations Lead',160);
INSERT INTO `employee_project` VALUES (23,8,'QA Engineer',80);
INSERT INTO `employee_project` VALUES (24,8,'Support Coordinator',40);
commit;

/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
/*!40000 ALTER TABLE `employee_project` ENABLE KEYS */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 10:18:50