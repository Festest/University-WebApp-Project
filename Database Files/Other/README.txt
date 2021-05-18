The following files are in this path:

- c_output.txt
- ConvertActors.c
- actors_list.csv
- insert_movie_actors.sql

A short description of each one will be givien.

# actors_list.csv

This is the csv file obtained after exporting the actors column from the table movies.movies.
It contains the list of the actors and its meant to be processed by ConvertActors.c. A slight
modification to this file is needed so that the ConvertActors.c works properly - delete the
first line ("actors").



# ConvertActors.c

This is a C program that outputs a file where each line contains the name of 1 actor.
This program basically parses actors_list.csv (after deleting the first line) and gives us
the c_output.txt file which contains double entries!!



# c_output.txt

The output of the C program. This contains the names of the actors with 1 name per line.
This file contains double entries that can easily be ignored while importing it to a SQL table.



# insert_movie_actors.sql

This scrip creates the many-to-many relationship table between actors and movies. This new table
is called movie_actors and it allows us to easily trace which actors participated in which movie.
Due to the huge mess of the data in the database, it was nearly impossible for me to create an
efficient query (also because of our lack of experience with SQL). This query took 16h and 12 min
to complete.