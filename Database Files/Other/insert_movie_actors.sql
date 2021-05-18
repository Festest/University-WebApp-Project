DELIMITER //

CREATE PROCEDURE insert_movie_actors ()

BEGIN
   DECLARE actor_id_numb INT DEFAULT 1;
   DECLARE temp INT UNSIGNED;
   DECLARE ending INT UNSIGNED;
   DECLARE size INT UNSIGNED;
   SET size = (SELECT COUNT(*) FROM actors);
   
   CREATE TABLE IF NOT EXISTS `movies`.`temp_table` ( `movie_title` LONGTEXT, `movie_id` INT );

   WHILE actor_id_numb <= size DO
      SET temp = 0;
      TRUNCATE TABLE temp_table;
      INSERT INTO temp_table SELECT title,id FROM movies.movies WHERE actors LIKE CONCAT("%'",(SELECT NAME FROM movies.actors WHERE id = actor_id_numb),"'%") OR actors LIKE CONCAT('%"',(SELECT NAME FROM movies.actors WHERE id = actor_id_numb),'"%');
      
      SET ending = (SELECT COUNT(*) FROM temp_table);

      WHILE temp < ending DO
         INSERT INTO movies.`movie_actors` (actor_id, movie_id, movie_title)
	 VALUES (actor_id_numb, (SELECT movie_id FROM movies.temp_table ORDER BY movie_id ASC LIMIT temp,1), (SELECT movie_title FROM movies.temp_table ORDER BY movie_id ASC LIMIT temp,1));
         SET temp = temp + 1;
      END WHILE;
      SET actor_id_numb = actor_id_numb + 1;
   END WHILE;
END; //

DELIMITER ;

CALL insert_movie_actors();
DROP PROCEDURE insert_movie_actors;