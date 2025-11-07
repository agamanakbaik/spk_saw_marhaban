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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alternatifs`
--

LOCK TABLES `alternatifs` WRITE;
/*!40000 ALTER TABLE `alternatifs` DISABLE KEYS */;
INSERT INTO `alternatifs` VALUES (17,'A3','Januari','','2025-10-13 14:05:59'),(18,'A2','Februari','','2025-10-13 14:06:10'),(19,'A1','Maret','','2025-10-13 14:06:25'),(20,'A4','April',NULL,'2025-11-03 11:04:55'),(21,'A5','Mei',NULL,'2025-11-03 11:05:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriterias`
--

LOCK TABLES `kriterias` WRITE;
/*!40000 ALTER TABLE `kriterias` DISABLE KEYS */;
INSERT INTO `kriterias` VALUES (19,'A1','Kas',100,'Benefit'),(20,'A2','Piutang',5,'Benefit'),(21,'A3','Laba',5,'Benefit'),(22,'A4','Cash Flow',5,'Benefit'),(25,'A5','Persediaan Stok',5,'Cost'),(26,'A6','Perputaran Stok',5,'Benefit'),(27,'A7','Hutang',5,'Cost');
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
) ENGINE=InnoDB AUTO_INCREMENT=688 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penilaians`
--

LOCK TABLES `penilaians` WRITE;
/*!40000 ALTER TABLE `penilaians` DISABLE KEYS */;
INSERT INTO `penilaians` VALUES (42,19,19,'',2),(43,19,20,'',1),(44,19,21,'',3),(45,19,22,'',4),(46,19,25,'',2),(47,19,26,'',2),(48,19,27,'',1),(49,18,19,'',3),(50,18,20,'',4),(51,18,21,'',3),(52,18,22,'',1),(53,18,25,'',5),(54,18,26,'',3),(55,18,27,'',3),(56,17,19,'',1),(57,17,20,'',3),(58,17,21,'',3),(59,17,22,'',3),(60,17,25,'',3),(61,17,26,'',3),(62,17,27,'',2),(484,21,19,'',5),(485,21,20,'',3),(486,20,19,'',1),(487,20,21,'',4),(660,21,22,'',1);
/*!40000 ALTER TABLE `penilaians` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_kriterias`
--

LOCK TABLES `sub_kriterias` WRITE;
/*!40000 ALTER TABLE `sub_kriterias` DISABLE KEYS */;
INSERT INTO `sub_kriterias` VALUES (6,19,'Tidak Prioritas',1,'2025-10-28 21:52:35','2025-10-28 21:52:35',NULL),(7,19,'Kurang Prioritas',2,'2025-10-28 21:52:50','2025-10-28 21:52:50',NULL),(8,19,'Cukup Prioritas',3,'2025-10-28 21:53:04','2025-10-28 21:53:04',NULL),(9,19,'Pioritas',4,'2025-10-28 21:53:26','2025-10-28 21:53:26',NULL),(10,19,'Sangat Baik',5,'2025-10-28 21:53:46','2025-11-04 16:16:50',NULL),(11,20,'Tidak Prioritas',1,'2025-10-28 21:54:04','2025-10-28 21:54:04',NULL),(12,20,'Kurang Prioritas',2,'2025-10-28 21:54:15','2025-10-28 21:54:15',NULL),(13,20,'Cukup Prioritas',3,'2025-10-28 21:54:25','2025-10-28 21:54:25',NULL),(14,20,'Pioritas',4,'2025-10-28 21:54:32','2025-10-28 21:54:32',NULL),(15,20,'Sangat Pritoritas',5,'2025-10-28 21:54:39','2025-10-28 21:54:39',NULL),(16,21,'Tidak Prioritas',1,'2025-10-28 21:54:56','2025-10-28 21:56:22',NULL),(17,21,'Kurang Prioritas',2,'2025-10-28 21:55:03','2025-10-28 21:55:03',NULL),(18,21,'Cukup Prioritas',3,'2025-10-28 21:55:10','2025-10-28 21:56:34',NULL),(21,21,'Prioritas',4,'2025-10-28 21:57:04','2025-10-28 21:57:04',NULL),(22,21,'Sangat Pritoritas',5,'2025-10-28 21:57:13','2025-10-28 21:57:13',NULL),(23,22,'Tidak Prioritas',1,'2025-10-28 21:57:32','2025-10-28 21:57:32',NULL),(24,22,'Kurang Prioritas',2,'2025-10-28 21:57:45','2025-10-28 21:57:45',NULL),(25,22,'Cukup Prioritas',3,'2025-10-28 21:57:52','2025-10-28 21:57:52',NULL),(26,22,'Prioritas',4,'2025-10-28 21:57:56','2025-10-28 21:57:56',NULL),(28,22,'Sangat Pritoritas',5,'2025-10-28 21:58:13','2025-10-28 21:58:13',NULL),(29,25,'Tidak Prioritas',1,'2025-10-28 21:58:26','2025-10-28 21:58:26',NULL),(30,25,'Kurang Prioritas',2,'2025-10-28 21:58:32','2025-10-28 21:58:32',NULL),(31,25,'Cukup Prioritas',3,'2025-10-28 21:58:40','2025-10-28 21:58:40',NULL),(32,25,'Prioritas',4,'2025-10-28 21:58:51','2025-10-28 21:58:51',NULL),(33,25,'Sangat Pritoritas',5,'2025-10-28 21:58:57','2025-10-28 21:58:57',NULL),(34,26,'Tidak Prioritas',1,'2025-10-28 21:59:11','2025-10-28 21:59:11',NULL),(35,26,'Kurang Prioritas',2,'2025-10-28 21:59:18','2025-10-28 21:59:18',NULL),(36,26,'Cukup Prioritas',3,'2025-10-28 21:59:25','2025-10-28 21:59:25',NULL),(37,26,'Pioritas',4,'2025-10-28 21:59:33','2025-10-28 21:59:33',NULL),(38,26,'Sangat Pritoritas',5,'2025-10-28 21:59:39','2025-10-28 21:59:39',NULL),(39,27,'Tidak Prioritas',1,'2025-10-28 21:59:55','2025-10-28 21:59:55',NULL),(40,27,'Kurang Prioritas',2,'2025-10-28 22:00:03','2025-10-28 22:00:03',NULL),(41,27,'Cukup Prioritas',3,'2025-10-28 22:00:13','2025-10-28 22:00:13',NULL),(42,27,'Prioritas',4,'2025-10-28 22:00:18','2025-10-28 22:00:18',NULL),(43,27,'Sangat Pritoritas',5,'2025-10-28 22:00:24','2025-10-28 22:00:24',NULL);
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

-- Dump completed on 2025-11-05  0:41:33
