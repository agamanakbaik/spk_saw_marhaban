-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: spk_saw_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin','admin') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (4,'agam','superadmin','$2b$10$B3FcDQPuMTYVmTi1hQdbN.RvWhMES2QfOvTnSLZatQV4ZwBNph7kW','superadmin','2025-09-28 16:25:58'),(5,'','admin','$2b$10$u6rneLlW2ABkI3FwOsEC/e2iPVMMUQkRcJC78PuplwK9Fbtf4rbLW','admin','2025-10-12 12:54:43');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alternatifs`
--

DROP TABLE IF EXISTS `alternatifs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alternatifs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_alternatif` varchar(10) NOT NULL,
  `nama_periode` varchar(100) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode_alternatif`),
  UNIQUE KEY `kode_alternatif` (`kode_alternatif`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alternatifs`
--

LOCK TABLES `alternatifs` WRITE;
/*!40000 ALTER TABLE `alternatifs` DISABLE KEYS */;
INSERT INTO `alternatifs` VALUES (35,'A1','Januari','2025','2025-11-26 14:16:48'),(36,'A2','Februari','2025','2025-11-26 14:16:57'),(37,'A3','Maret','2025','2025-11-26 14:17:07'),(38,'A4','April','2025','2025-11-26 14:17:18'),(39,'A5','Mei','2025','2025-11-26 14:17:29');
/*!40000 ALTER TABLE `alternatifs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keputusans`
--

DROP TABLE IF EXISTS `keputusans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keputusans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periode` varchar(20) NOT NULL,
  `alternatif_id` int(11) NOT NULL,
  `skor_terbaik` decimal(10,4) NOT NULL,
  `tanggal_keputusan` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `periode` (`periode`),
  KEY `alternatif_id` (`alternatif_id`),
  CONSTRAINT `keputusans_ibfk_1` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatifs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keputusans`
--

LOCK TABLES `keputusans` WRITE;
/*!40000 ALTER TABLE `keputusans` DISABLE KEYS */;
/*!40000 ALTER TABLE `keputusans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kriterias`
--

DROP TABLE IF EXISTS `kriterias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kriterias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `bobot` float NOT NULL,
  `tipe` enum('Benefit','Cost') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriterias`
--

LOCK TABLES `kriterias` WRITE;
/*!40000 ALTER TABLE `kriterias` DISABLE KEYS */;
INSERT INTO `kriterias` VALUES (32,'K1','Kas',5,'Benefit'),(33,'K2','Piutang',5,'Benefit'),(34,'K3','Laba',5,'Benefit'),(35,'K4','Cash Flow',5,'Benefit'),(36,'K5','Persediaan Stok',5,'Cost'),(37,'K6','Hutang',5,'Cost');
/*!40000 ALTER TABLE `kriterias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penilaians`
--

DROP TABLE IF EXISTS `penilaians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `penilaians` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alternatif_id` int(11) NOT NULL,
  `kriteria_id` int(11) NOT NULL,
  `periode` varchar(20) NOT NULL,
  `nilai` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alternatif_id` (`alternatif_id`,`kriteria_id`,`periode`),
  UNIQUE KEY `idx_alternatif_kriteria` (`alternatif_id`,`kriteria_id`),
  KEY `kriteria_id` (`kriteria_id`),
  CONSTRAINT `penilaians_ibfk_1` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatifs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `penilaians_ibfk_2` FOREIGN KEY (`kriteria_id`) REFERENCES `kriterias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1703 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penilaians`
--

LOCK TABLES `penilaians` WRITE;
/*!40000 ALTER TABLE `penilaians` DISABLE KEYS */;
INSERT INTO `penilaians` VALUES (1522,35,32,'',3),(1523,35,33,'',2),(1524,35,34,'',1),(1525,35,35,'',4),(1526,35,36,'',4),(1527,35,37,'',4),(1528,36,32,'',2),(1529,36,33,'',2),(1530,36,34,'',3),(1531,36,35,'',4),(1532,36,36,'',4),(1533,36,37,'',5),(1534,37,32,'',4),(1535,37,33,'',2),(1536,37,34,'',4),(1537,37,35,'',5),(1538,37,36,'',4),(1539,37,37,'',3),(1540,38,32,'',4),(1541,38,33,'',5),(1542,38,34,'',5),(1543,38,35,'',4),(1544,38,36,'',4),(1545,38,37,'',3),(1546,39,32,'',4),(1547,39,33,'',3),(1548,39,34,'',3),(1549,39,35,'',2),(1550,39,36,'',3),(1551,39,37,'',4);
/*!40000 ALTER TABLE `penilaians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_name` varchar(255) NOT NULL,
  `background_url` text DEFAULT NULL,
  `logo_url` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'AGAM MATEO','background-1764282186648-530287878.png','logo-1764282186607-3032725.jpg','2025-11-27 22:23:06');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_kriterias`
--

DROP TABLE IF EXISTS `sub_kriterias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sub_kriterias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kriteria_id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nilai` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `keterangan` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subkriteria` (`kriteria_id`,`nama`),
  UNIQUE KEY `uk_nilai_subkriteria` (`kriteria_id`,`nilai`),
  CONSTRAINT `sub_kriterias_ibfk_1` FOREIGN KEY (`kriteria_id`) REFERENCES `kriterias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_kriterias`
--

LOCK TABLES `sub_kriterias` WRITE;
/*!40000 ALTER TABLE `sub_kriterias` DISABLE KEYS */;
INSERT INTO `sub_kriterias` VALUES (61,32,'Sangat baik',5,'2025-11-26 14:21:59','2025-11-26 14:33:33','> 150 juta'),(63,32,'Baik',4,'2025-11-26 14:34:37','2025-11-26 14:34:37','100 – 150 juta'),(64,32,'Cukup',3,'2025-11-26 14:36:28','2025-11-26 14:36:28','50 – 100 juta'),(65,32,'Kurang',2,'2025-11-26 14:37:00','2025-11-26 14:37:00','20 – 50 juta'),(66,32,'Buruk',1,'2025-11-26 14:37:20','2025-11-26 14:37:20','< 20 juta'),(67,33,'Sangat Baik',5,'2025-11-26 14:38:33','2025-11-26 14:38:33','> 120 juta'),(68,33,'Baik',4,'2025-11-26 14:40:07','2025-11-26 14:40:07','80 – 120 juta'),(69,33,'Cukup',3,'2025-11-26 14:40:54','2025-11-26 14:40:54','40 – 80 juta'),(70,33,'Kurang',2,'2025-11-26 14:41:20','2025-11-26 14:41:20','10 – 40 juta'),(71,33,'Buruk',1,'2025-11-26 14:41:40','2025-11-26 14:41:40','< 10 juta'),(72,34,'Sangat Baik',5,'2025-11-26 15:09:47','2025-11-26 15:09:47','> 70 juta'),(73,34,'Baik',4,'2025-11-26 15:10:07','2025-11-26 15:10:07','50 – 70 juta'),(74,34,'Cukup',3,'2025-11-26 15:10:35','2025-11-26 15:10:35','30 – 50 juta'),(75,34,'Kurang',2,'2025-11-26 15:11:03','2025-11-26 15:11:03','10 – 30 juta'),(76,34,'Buruk',1,'2025-11-26 15:11:16','2025-11-26 15:11:16','< 10 juta'),(77,35,'Sangat Baik',5,'2025-11-26 15:12:17','2025-11-26 15:12:17','> 100 juta'),(78,35,'Baik',4,'2025-11-26 15:12:30','2025-11-26 15:12:30','70 – 100 juta'),(79,35,'Cukup',3,'2025-11-26 15:12:49','2025-11-26 15:12:49','40 – 70 juta'),(80,35,'Kurang',2,'2025-11-26 15:13:01','2025-11-26 15:13:01','10 – 40 juta'),(81,35,'Buruk',1,'2025-11-26 15:13:20','2025-11-26 15:13:20','< 10 juta'),(82,36,'Sangat Baik (stok ideal)',5,'2025-11-26 15:14:22','2025-11-26 15:14:22','< 20 juta'),(83,36,'Baik',4,'2025-11-26 15:14:36','2025-11-26 15:14:36','20 – 40 juta'),(84,36,'Cukup',3,'2025-11-26 15:14:49','2025-11-26 15:14:49','40 – 70 juta'),(85,36,'Kurang',2,'2025-11-26 15:15:04','2025-11-26 15:15:04','70 – 120 juta'),(86,36,'Buruk (overstock)',1,'2025-11-26 15:15:25','2025-11-26 15:15:25','> 120 juta'),(87,37,'0 (tanpa hutang)',5,'2025-11-26 15:16:30','2025-11-26 15:16:30','Sangat Baik'),(88,37,'Baik',4,'2025-11-26 15:16:45','2025-11-26 15:16:45','< 50 juta'),(89,37,'Cukup',3,'2025-11-26 15:16:57','2025-11-26 15:16:57','50 – 150 juta'),(90,37,'Kurang',2,'2025-11-26 15:17:13','2025-11-26 15:17:13','150 – 300 juta'),(91,37,'Buruk',1,'2025-11-26 15:17:27','2025-11-26 15:17:27','> 300 juta');
/*!40000 ALTER TABLE `sub_kriterias` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-28  5:46:36
