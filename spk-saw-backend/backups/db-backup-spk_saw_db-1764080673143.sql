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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alternatifs`
--

LOCK TABLES `alternatifs` WRITE;
/*!40000 ALTER TABLE `alternatifs` DISABLE KEYS */;
INSERT INTO `alternatifs` VALUES (31,'A1','Januari','2025','2025-11-22 19:54:35'),(32,'A2','Februari ','2025','2025-11-22 19:54:55'),(33,'A3','Maret','2025','2025-11-22 19:55:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriterias`
--

LOCK TABLES `kriterias` WRITE;
/*!40000 ALTER TABLE `kriterias` DISABLE KEYS */;
INSERT INTO `kriterias` VALUES (19,'A1','Kas',5,'Benefit'),(20,'A2','Piutang',5,'Benefit'),(21,'A3','Laba',5,'Benefit'),(22,'A4','Cash Flow',5,'Benefit'),(25,'A5','Persediaan Stok',5,'Cost'),(26,'A6','Perputaran Stok',5,'Benefit'),(27,'A7','Hutang',5,'Cost');
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
) ENGINE=InnoDB AUTO_INCREMENT=795 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penilaians`
--

LOCK TABLES `penilaians` WRITE;
/*!40000 ALTER TABLE `penilaians` DISABLE KEYS */;
INSERT INTO `penilaians` VALUES (774,33,19,'',4),(775,33,20,'',3),(776,33,21,'',4),(777,33,22,'',4),(778,33,25,'',4),(779,33,26,'',4),(780,33,27,'',3),(781,32,19,'',4),(782,32,20,'',4),(783,32,21,'',3),(784,32,22,'',4),(785,32,25,'',4),(786,32,26,'',4),(787,32,27,'',1),(788,31,19,'',5),(789,31,20,'',2),(790,31,21,'',4),(791,31,22,'',4),(792,31,25,'',4),(793,31,26,'',4),(794,31,27,'',4);
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
INSERT INTO `settings` VALUES (1,'fatimah lopyu','background-1764080625139-338208445.png','logo-1764080625137-385931312.PNG','2025-11-25 14:23:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_kriterias`
--

LOCK TABLES `sub_kriterias` WRITE;
/*!40000 ALTER TABLE `sub_kriterias` DISABLE KEYS */;
INSERT INTO `sub_kriterias` VALUES (23,22,'Negatif / Defisit',1,'2025-10-28 21:57:32','2025-11-08 11:17:40',NULL),(24,22,'Rendah (Impas)',2,'2025-10-28 21:57:45','2025-11-08 11:19:10',NULL),(25,22,'Cukup',3,'2025-10-28 21:57:52','2025-11-08 11:19:39',NULL),(26,22,'Sehat',4,'2025-10-28 21:57:56','2025-11-08 11:20:05',NULL),(28,22,'Sangat Sehat',5,'2025-10-28 21:58:13','2025-11-08 11:20:32',NULL),(29,25,'Menumpuk / Stok Mati',1,'2025-10-28 21:58:26','2025-11-08 11:21:07',NULL),(30,25,'Lambat Terjual',2,'2025-10-28 21:58:32','2025-11-08 11:21:31',NULL),(31,25,'Wajar',3,'2025-10-28 21:58:40','2025-11-08 11:22:02',NULL),(32,25,'Cepat Terjual',4,'2025-10-28 21:58:51','2025-11-08 11:22:32',NULL),(33,25,'Sangat Cepat Terjual',5,'2025-10-28 21:58:57','2025-11-08 11:23:01',NULL),(34,26,'Sangat Lambat',1,'2025-10-28 21:59:11','2025-11-08 11:23:32',NULL),(35,26,'Lambat',2,'2025-10-28 21:59:18','2025-11-08 11:24:09',NULL),(36,26,'Cukup',3,'2025-10-28 21:59:25','2025-11-08 11:24:27',NULL),(37,26,'Cepat',4,'2025-10-28 21:59:33','2025-11-08 11:24:51',NULL),(38,26,'Sangat Cepat',5,'2025-10-28 21:59:39','2025-11-08 11:25:22',NULL),(39,27,'Sangat Tinggi (Berbahaya)',1,'2025-10-28 21:59:55','2025-11-08 11:25:56',NULL),(40,27,'Tinggi (Berisiko)',2,'2025-10-28 22:00:03','2025-11-08 11:27:47',NULL),(41,27,'Wajar (Terkendali)',3,'2025-10-28 22:00:13','2025-11-08 11:27:20',NULL),(42,27,'Rendah',4,'2025-10-28 22:00:18','2025-11-08 11:28:35',NULL),(43,27,'Sangat Rendah',5,'2025-10-28 22:00:24','2025-11-08 11:28:58',NULL),(45,19,'SANGAT KURANG',1,'2025-11-08 11:09:09','2025-11-10 14:23:18','dsdsd'),(46,19,'KURANG',2,'2025-11-08 11:10:03','2025-11-18 16:14:24','ddvd'),(47,19,'CUKUP',3,'2025-11-08 11:10:37','2025-11-08 11:10:37',NULL),(48,19,'BAIK',4,'2025-11-08 11:10:56','2025-11-08 11:10:56',NULL),(49,19,'SANGAT BAIK',5,'2025-11-08 11:11:16','2025-11-08 11:11:16',NULL),(50,20,'Sangat Lama Tertagih',1,'2025-11-08 11:12:02','2025-11-08 11:12:02',NULL),(51,20,'Lama Tertagih',2,'2025-11-08 11:12:38','2025-11-08 11:12:38',NULL),(52,20,'Cukup Cepat',3,'2025-11-08 11:13:07','2025-11-08 11:13:07',NULL),(53,20,'Cepat Tertagih',4,'2025-11-08 11:13:45','2025-11-08 11:13:45',NULL),(54,20,'Sangat Cepat Tertagih',5,'2025-11-08 11:14:06','2025-11-08 11:14:06',NULL),(55,21,'Rugi / Sangat Rendah',1,'2025-11-08 11:15:14','2025-11-08 11:15:14',NULL),(56,21,'Rendah',2,'2025-11-08 11:15:36','2025-11-08 11:15:36',NULL),(57,21,'Cukup',3,'2025-11-08 11:15:59','2025-11-08 11:15:59',NULL),(58,21,'Tinggi',4,'2025-11-08 11:16:17','2025-11-08 11:16:17',NULL),(59,21,'Sangat Tinggi',5,'2025-11-08 11:16:45','2025-11-08 11:16:45',NULL);
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

-- Dump completed on 2025-11-25 21:24:35
