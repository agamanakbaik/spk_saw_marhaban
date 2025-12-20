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
  `gate_password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (4,'agam','superadmin','$2b$10$brWJSz48mMC/KHHQhT6A6eIWzYW/M.TZvDbd65rxEDarQKemr8yDq','superadmin','2025-09-28 16:25:58',NULL),(5,'','admin','$2b$10$44QjaLZ9MUzvDTnvDea4f.57tP2xCa4z2iLV4T0tAtkQ6D1K/T6Zy','admin','2025-10-12 12:54:43',NULL),(10,'','agam','$2b$10$9JmaqtJgGiQOiNRBD9dT0uJpzpE4Yq3L.vXw9sjk9JhQlAh7jmFiG','admin','2025-12-18 15:37:28',NULL);
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
  `admin_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode_alternatif`),
  UNIQUE KEY `kode_alternatif` (`kode_alternatif`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alternatifs`
--

LOCK TABLES `alternatifs` WRITE;
/*!40000 ALTER TABLE `alternatifs` DISABLE KEYS */;
INSERT INTO `alternatifs` VALUES (41,'A1','MEI 2025',NULL,'2025-12-08 12:16:58',5),(43,'A2','JUNI 2025',NULL,'2025-12-08 12:17:23',5),(44,'A3','JULI 2025',NULL,'2025-12-08 12:17:38',5),(45,'A4','AGUSTUS 2025',NULL,'2025-12-08 12:17:58',5),(46,'A5','SEPTEMBER 2025',NULL,'2025-12-08 12:18:12',5),(47,'A6','OKTOBER 2025',NULL,'2025-12-08 12:18:26',5);
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
  `admin_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriterias`
--

LOCK TABLES `kriterias` WRITE;
/*!40000 ALTER TABLE `kriterias` DISABLE KEYS */;
INSERT INTO `kriterias` VALUES (38,'K1','PEDAPATAN',25,'Benefit',5),(39,'K2','LABA BERSIH',30,'Benefit',5),(40,'K3','RASIO PROFIT MARGIN',20,'Benefit',5),(41,'K4','RASIO GAJI',10,'Cost',5),(42,'K5','ARUS KAS SISA',15,'Benefit',5);
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
  `admin_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alternatif_id` (`alternatif_id`,`kriteria_id`,`periode`),
  UNIQUE KEY `idx_alternatif_kriteria` (`alternatif_id`,`kriteria_id`),
  KEY `kriteria_id` (`kriteria_id`),
  CONSTRAINT `penilaians_ibfk_1` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatifs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `penilaians_ibfk_2` FOREIGN KEY (`kriteria_id`) REFERENCES `kriterias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1772 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penilaians`
--

LOCK TABLES `penilaians` WRITE;
/*!40000 ALTER TABLE `penilaians` DISABLE KEYS */;
INSERT INTO `penilaians` VALUES (1741,41,38,'',4,5),(1742,41,39,'',3,5),(1743,41,40,'',3,5),(1744,41,41,'',4,5),(1745,41,42,'',4,5),(1746,43,38,'',4,5),(1747,43,39,'',2,5),(1748,43,40,'',1,5),(1749,43,41,'',3,5),(1750,43,42,'',1,5),(1751,44,38,'',5,5),(1752,44,39,'',1,5),(1753,44,40,'',5,5),(1754,44,41,'',3,5),(1755,44,42,'',2,5),(1756,45,38,'',5,5),(1757,45,39,'',2,5),(1758,45,40,'',3,5),(1759,45,41,'',4,5),(1760,45,42,'',3,5),(1761,46,38,'',3,5),(1762,46,39,'',4,5),(1763,46,40,'',4,5),(1764,46,41,'',3,5),(1765,46,42,'',2,5),(1766,47,38,'',1,5),(1767,47,39,'',4,5),(1768,47,40,'',3,5),(1769,47,41,'',3,5),(1770,47,42,'',3,5);
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
INSERT INTO `settings` VALUES (1,'MARHABAN','','logo-1765208922065-901300284.png','2025-12-08 15:48:42');
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
  `admin_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subkriteria` (`kriteria_id`,`nama`),
  UNIQUE KEY `uk_nilai_subkriteria` (`kriteria_id`,`nilai`),
  CONSTRAINT `sub_kriterias_ibfk_1` FOREIGN KEY (`kriteria_id`) REFERENCES `kriterias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_kriterias`
--

LOCK TABLES `sub_kriterias` WRITE;
/*!40000 ALTER TABLE `sub_kriterias` DISABLE KEYS */;
INSERT INTO `sub_kriterias` VALUES (92,38,'< 600 juta',1,'2025-12-08 12:22:08','2025-12-18 16:20:45','',5),(93,38,'600 - 800 juta',2,'2025-12-08 12:22:23','2025-12-18 16:20:45','',5),(95,38,'800 juta - 1 M',3,'2025-12-08 12:23:05','2025-12-18 16:20:45','',5),(96,38,'1 - 1,3 M',4,'2025-12-08 12:23:20','2025-12-18 16:20:45','',5),(97,38,'> 1,3 M',5,'2025-12-08 12:23:52','2025-12-18 16:20:45','',5),(98,39,'< 150 juta',1,'2025-12-08 12:24:16','2025-12-18 16:20:45','',5),(99,39,'150 - 250 juta',2,'2025-12-08 12:24:29','2025-12-18 16:20:45','',5),(100,39,'250 - 350 juta',3,'2025-12-08 12:24:42','2025-12-18 16:20:45','',5),(101,39,'350 - 450 juta',4,'2025-12-08 12:24:54','2025-12-18 16:20:45','',5),(102,39,'> 450 juta',5,'2025-12-08 12:25:03','2025-12-18 16:20:45','',5),(103,40,'< 15%',1,'2025-12-08 12:25:21','2025-12-18 16:20:45','',5),(104,40,'15% - 20%',2,'2025-12-08 12:25:34','2025-12-18 16:20:45','',5),(105,40,'21%- 30%',3,'2025-12-08 12:25:49','2025-12-18 16:20:45','',5),(106,40,'31% - 40%',4,'2025-12-08 12:26:25','2025-12-18 16:20:45','',5),(107,40,'> 40%',5,'2025-12-08 12:27:20','2025-12-18 16:20:45','',5),(108,41,'> 9%',1,'2025-12-08 12:27:51','2025-12-18 16:20:45','',5),(109,41,'8% - 9%',2,'2025-12-08 12:28:05','2025-12-18 16:20:45','',5),(110,41,'6% - 7%',3,'2025-12-08 12:28:20','2025-12-18 16:20:45','',5),(111,41,'4% - 5%',4,'2025-12-08 12:28:35','2025-12-18 16:20:45','',5),(112,41,'< 4 %',5,'2025-12-08 12:28:46','2025-12-18 16:20:45','',5),(113,42,'< 200 juta',1,'2025-12-08 12:29:03','2025-12-18 16:20:45','',5),(114,42,'200 - 400 juta',2,'2025-12-08 12:29:20','2025-12-18 16:20:45','',5),(115,42,'400 - 600 juta',3,'2025-12-08 12:29:32','2025-12-18 16:20:45','',5),(116,42,'600 - 800 juta',4,'2025-12-08 12:29:45','2025-12-18 16:20:45','',5),(117,42,'> 800 juta',5,'2025-12-08 12:29:54','2025-12-18 16:20:45','',5);
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

-- Dump completed on 2025-12-21  0:47:06
