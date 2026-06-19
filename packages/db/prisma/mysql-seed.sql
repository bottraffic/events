-- SIMCHA OS — demo data. Run AFTER mysql-init.sql:
--   mysql -u USER -p simcha < mysql-seed.sql
-- Login: admin@demo.simcha.io / Demo1234!  (tenant slug: demo)
SET NAMES utf8mb4;
USE `simcha`;

INSERT INTO `Tenant` (`id`,`name`,`slug`,`subdomain`,`plan`,`status`,`createdAt`,`updatedAt`)
VALUES ('t-demo','אולמי דמו','demo','demo','PRO','ACTIVE',NOW(3),NOW(3));

INSERT INTO `Role` (`id`,`tenantId`,`name`,`level`,`isSystem`)
VALUES ('r-admin','t-demo','מנהל','ADMIN',1);

INSERT INTO `User` (`id`,`tenantId`,`name`,`email`,`passwordHash`,`status`,`createdAt`,`updatedAt`)
VALUES ('u-admin','t-demo','דני מנהל','admin@demo.simcha.io','$2b$10$OFS/SoWyqKIz7UqYTXehcOozcf.aPsbl9u4QvyxSX53T.ljBPPJZ2','active',NOW(3),NOW(3));

INSERT INTO `UserRole` (`userId`,`roleId`) VALUES ('u-admin','r-admin');

INSERT INTO `PipelineStage` (`id`,`tenantId`,`name`,`order`,`color`,`type`) VALUES
 ('s1','t-demo','ליד חדש',1,'#6366f1','OPEN'),
 ('s2','t-demo','תיאום פגישה',2,'#8b5cf6','OPEN'),
 ('s3','t-demo','פגישה בוצעה',3,'#0ea5e9','OPEN'),
 ('s4','t-demo','הצעת מחיר',4,'#f59e0b','OPEN'),
 ('s5','t-demo','מו"מ',5,'#f97316','OPEN'),
 ('s6','t-demo','נסגר',6,'#10b981','WON'),
 ('s7','t-demo','הפסד',7,'#ef4444','LOST');

INSERT INTO `Lead` (`id`,`tenantId`,`name`,`phone`,`source`,`stageId`,`score`,`estimatedValue`,`assignedToId`,`createdAt`,`updatedAt`) VALUES
 ('ld1','t-demo','יוסי כהן','050-1111111','FACEBOOK','s1',88,90000,'u-admin',NOW(3),NOW(3)),
 ('ld2','t-demo','רינה לוי','050-2222222','INSTAGRAM','s2',64,75000,'u-admin',NOW(3),NOW(3)),
 ('ld3','t-demo','דנה ברק','050-3333333','GOOGLE_ADS','s3',71,85000,'u-admin',NOW(3),NOW(3)),
 ('ld4','t-demo','משה צור','050-4444444','WHATSAPP','s4',55,60000,'u-admin',NOW(3),NOW(3)),
 ('ld5','t-demo','אבי רוזן','050-5555555','REFERRAL','s5',79,92000,'u-admin',NOW(3),NOW(3)),
 ('ld6','t-demo','גל מזרחי','050-6666666','WEBSITE','s6',91,78000,'u-admin',NOW(3),NOW(3));

INSERT INTO `Customer` (`id`,`tenantId`,`name`,`partnerName`,`phone`,`createdAt`,`updatedAt`) VALUES
 ('c1','t-demo','גל','מאיה','050-6666666',NOW(3),NOW(3)),
 ('c2','t-demo','דניאל','שירה','050-7777777',NOW(3),NOW(3));

INSERT INTO `Event` (`id`,`tenantId`,`customerId`,`type`,`eventDate`,`guestsCount`,`status`,`totalPrice`,`createdAt`,`updatedAt`) VALUES
 ('ev1','t-demo','c1','חתונה','2026-07-12 19:00:00',350,'BOOKED',92000,NOW(3),NOW(3)),
 ('ev2','t-demo','c2','חתונה','2026-09-21 20:00:00',420,'INQUIRY',0,NOW(3),NOW(3));
