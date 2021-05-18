#Setting up SQL:
Installer Documentation: https://dev.mysql.com/doc/refman/8.0/en/mysql-installer.html
Download: https://dev.mysql.com/downloads/installer/

-On setup, create a root account with password "root"
-Uncheck "Start MySQL Server at startup" :)

#OPENING THE DATABASE
-Run MySQL Workbench
-On the menu, go to "File" > "Run SQL Script..."
-Select the file on path\2020-Group24\Database Files\DB Build Scripts\movies_v2.sql

If this does not work, look at the alternative on the next step.

#Importing the movies table from CSV:
First off, a few things to note:
-Create a copy of the CSV file
-On the copied file delete the first row (which contains the column names) so that we have only useful data
-Make sure that you replace the path with the correct path to the modified file
-Warnings are normal during the import since most movies are missing one of the fields, like a tagline
-If you have an error with permissions while executing the last SQL Query, try the following:
    This restriction can be removed from MySQL Workbench 8.0 in the following way. Edit the connection, on the Connection tab, go to the 'Advanced' sub-tab, and in the 'Others:' box add the line 'OPT_LOCAL_INFILE=1'.
    This should allow a client using the Workbench to run LOAD DATA INFILE as usual.

>SQL Code
CREATE DATABASE movies;

SET GLOBAL local_infile=1;

CREATE TABLE `movies`.`movies` (
  `title` LONGTEXT NOT NULL,
  `rating` LONGTEXT NULL,
  `year` INT NOT NULL,
  `users_rating` LONGTEXT NULL,
  `votes` LONGTEXT NULL,
  `metascore` LONGTEXT NULL,
  `img_url` LONGTEXT NULL,
  `countries` LONGTEXT NULL,
  `languages` LONGTEXT NULL,
  `actors` LONGTEXT NULL,
  `genre` LONGTEXT NULL,
  `tagline` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `directors` LONGTEXT NULL,
  `runtime` LONGTEXT NULL,
  `imdb_url` LONGTEXT NOT NULL,
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
);

LOAD DATA LOCAL INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\movie.csv' INTO TABLE `movies`.`movies` CHARACTER SET 'utf8' FIELDS ESCAPED BY '\\' TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\r\n' (`title`, `rating`, `year`, `users_rating`, `votes`, `metascore`, `img_url`, `countries`, `languages`, `actors`, `genre`, `tagline`, `description`, `directors`, `runtime`, `imdb_url`, `id`)