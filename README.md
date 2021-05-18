# Web Engineering 2020-2021 Project - Group 24
The Markdown File contains all the necessary information about the design, implementation and the demonstration of the Web App to be developed on the Complete IMDB Movies Dataset available at Kaggle with the goal of delivering a number of features based on the dataset.

Our project is now divided into 3 main sections and in further subsections:

* API: Contains the js API code
    * webapp: Our front end website
* Database Files: Everything you need to get the database running and the files and scripts used to make tables and such

## API
### API Documentation
To access the browsable API Documentation, you first need to install redoc-cli via npm:

```
npm install -g redoc-cli
```

Then, you need to navigate into the project directory inside a terminal and type the command:

```
redoc-cli bundle -o swagger.html swagger.json
```

There is now a swagger.html file which you can open with your browser and use the interactive API Documentation.

### API Design
Our API implementation is divided into 6 subcategories. The first one is a collection of helper functions that will be used on the endpoints. Some of these helper functions include the conversion from JSON responses to CSV and functions that help with the pagination of results. In the remaining 5 subcategories, we implement the API endpoints. Therefore, our endpoints are sorted by /movies, /actors, /genres, /statistics and /omdb. This last one is an endpoint that makes use of an external API. We include a link to the movie data on the OMDB for every movie response given by our API endpoints that return a movie. Moreover, we also created the button "Movie Awards & Box Office" on the front end, that shows the awards and box office for a movie that OMDB finds (it may be a different one than the one you were actually searching for, due to how OMDB processes the request).

We decided to separate actors from movies, due to the fact that we have a table 'actors' in our database and another one 'movie_actors' with the relationship between the movie's IDs and the actor's IDs. However, when searching for movies where someone participated in (and do not know the role (actor or director)), we use the endpoint /movies/people. We also intended in having a separate table for directors (and dividing this endpoint into two endpoints), but that proved unnecessarily complex for the desired final product.

Moreover, although we could just send all results at once, we decided to cap the amount of results by 50 on most endpoints. This was mostly done to improve the performance of the front end and the response time of the endpoint. For this reason, we also needed to include pagination. The pagination implementation was made in a way that we would only request 50 results from the database. This was done to avoid getting the full amount of results and displaying only 50, which has a higher impact on the response time of the endpoint.

All our API endpoints support both CSV and JSON requests, being JSON the default. This is especially useful for building the front end, since we can use JSON for complex queries and CSV for when the user wants to get all results, which typically leads to huge result sets and CSV is a better file format for that information (e.g.: Downloading all the movies (or actors) data from the database). The only exception to this is the endpoint that makes use of the OMDB external API, which only returns JSON responses. This happens because their endpoint only supports JSON and XML responses and we had issues converting the response to CSV.

## Architecture, Technology Selection & API Implementation
The technologies used for the development of the Web App are Node.js, MySQL, Javascript and HTML/CSS.
Node.js is used for the implementation of the Web Server.
Javascript and HTML/CSS is used for the implementation of the front-end of the application.
MySQL is used for the implementation of the database as it ensures the persistence of the application.

### MySQL
#### Data abnormalities
While importing the data to the database and working with it we discovered many abnormalities with the data. These abnormalities might impact some results on queries, although these are extreme cases.

For example, it was very hard to work with the inconsistent manner of how the names are saved in the database. There are names with different types of quotes that are also saved using other types of quotes (e.g. 'Daniel Napolitano""DNap""' or "William 'Bill' Connor"). The name Bill proved to be a terrible exception. The queries we used would check for names between quotes to get the actors' names. However, "Bill" also matched an independent actor name. This means that if we search for movies where the actor Bill participates, the movies of, for example, William 'Bill' Connor will also be included in the result. This is, however, very uncommon, since that for this to happen there needs to be an actor, whose full name matches the part of the name between quotes of another actor. Getting the movies for William 'Bill' Connor works normally, only the movies for Bill are impacted. Other weirdness with the data that did not affect the queries was found. A good example of this is the tagline of the movie "Poison Sweethearts", which is composed of a sentence followed by around 280 spaces and the character '»' at the end.

#### Database Creation Process
This section is meant to explain the process of generating the database. This is not relevant information to run or build the project, but instead to understand how we got the data we are working with. A short description of each one of the files under Project/Database Files/Other will be given. The files are:

* actors_list.csv
* ConvertActors.c
* c_output.txt
* insert_movie_actors.sql

##### actors_list.csv
This is the csv file obtained after exporting the actors column from the table movies.movies.
It contains the list of the actors and it's meant to be processed by ConvertActors.c. A slight
modification to this file is needed so that the ConvertActors.c works properly - delete the
first line ("actors").

##### ConvertActors.c
This is a C program that outputs a file where each line contains the name of 1 actor.
This program basically parses actors_list.csv (after deleting the first line) and gives us
the c_output.txt file which contains double entries!!

##### c_output.txt
The output of the C program. This contains the names of the actors with 1 name per line.
This file contains double entries that can easily be ignored while importing it to an SQL table.

##### insert_movie_actors.sql
This scrip creates the many-to-many relationship table between actors and movies. This new table
is called movie_actors and it allows us to easily trace which actors participated in which movie.
Due to the huge mess of the data in the database, it was nearly impossible for me to create an
efficient query (also because of our lack of experience with SQL). This query took 16h and 12 min
to complete. The intention was to use this relationship table in more complex queries but we never got the time to work on those, as of now.

### Javascript
Javascript was used to implement all endpoints in the backend of the application. It was chosen because it is lightweight and simple. It was used with the environment NodeJS and was used further by the p5 implementation.

### NodeJS
For the back end of the application we decided to use Node.js. Node is a program that uses asynchronous methods, which means that it can handle multiple requests at the same time. Apart from that, Node is a well-documented, easy-to-use and widely available program, making it the perfect foundation of our API. We further expand the abilities of Node with the Express framework, a system that allowed for a simple implementation of a RESTful API. By using Express, getting all our endpoints was no issue.

### p5.js
To connect to the server side of the web application. We decided to use the "p5.js" library. Using p5 allows for easy connection to the back-end through its httpDo and httpGet methods. This removes the hassle of opening and closing the http connection since these methods will do that for you.

### HTML/CSS
For the front end of the application we use HTML and CSS. HTML provides the structure of the page, CSS the visual layout. We connect these two via a link in the HTML file to the CSS stylesheet. We connect to the API by running the script "sketch.js". In this .js file we define the buttons by setting the routes for the corresponding API calls. And by doing so we basically connect the front end to the back end.
    In the body part of the HTML we have a link to the homepage and our names. Below this we split the page into to parts, we create a right-side and a left-side class. We use the left side to give a detailed description on how a corresponding button works, and on the right side we have the buttons themselves.
    In the header we have a "logo" class, where we create the link for the homepage, and another class called "members" where we make our names appear as individual list elements. The right-side and left-side classes both contain unordered lists, where the list elements are on one side the button descriptions and the other side the buttons with the links.
    In the CSS file we design the web app. Note that we can also change here how the returned elements of the buttons will look like. The CSS contains information for each class about where their position is, sets the background color and includes information for the HTML about how a given element is supposed to look like.

## Web App Implementation
### How to Set Up the Web App
#### To Run the Back-End
##### Building the Database
**Having a locally operational database with a functional connection is a requirement** to run this project. The database can be built using the file movies_v2.sql located under Project/Database Files/DB Build Scripts. You should be able to get the database up and running following these steps:

* Download MySQL (405.2M) from: https://dev.mysql.com/downloads/installer/
* Chose the Default installation options
* On setup, create a root account with password "root" **(this is mandatory!)**
* Uncheck "Start MySQL Server at startup" if desired (you will need to start up the SQL server manually)

Once you have set up MySQL correctly, you should have a program called MySQL Workbench. Execute it. Connect to the database using the previously created authentication (user: root; password: root). After establishing the connection you will see "File" on the top bar menu at the most left. Click on it and select "Run SQL Script...". Now select the file on Project/Database Files/DB Build Scripts/movies_v2.sql. **After the import completes successfully, you should have a working database that the API can access.** It is also needed to run `npm install --save mysql2` on your CMD **under the path Project/API**.

##### Installing Node JS & Express
Our API relies on Node JS. In order to use it, you will need to install the LTS version of Node from: https://nodejs.org/en/download/

In order to run the API on Windows, first **be sure to have the required database properly set up (see above)**. After that, navigate to Project/API. There you find the file index.js. Open Windows CMD and navigate to this folder using the 'cd' command. When you are on the API folder simply type `node index.js`. This should start up the API without any errors. Furthermore, we use Express dependencies. Please type the following command on your CMD **under the path Project/API** `npm install --save express` to install express and `npm install --save express-hateoas-links` to install hateoas linking.

#### To Run the Front-End
In order to open the front-end, the User needs to start hosting a local server. In the terminal type "node index.js" and it gives the response "Listening on port 3000...". After doing so, the User needs to open an Internet Browser and go to the address of "localhost:3000" to access the application. The back-end of the application needs to be running to access the application before the action is made.

### How to Use the Web App
After successfully starting the back-end and the front-end (see more about these above) the User can choose an action they would like to do, which opens up a box to type the required information and click search.

### Frontend Design
Our frontend consists of various buttons for different endpoints. When on the front page and click one of those buttons, we are redirected to the HTML file of that specific button.
For result sets of more than 1 movie, we decided to include pagination buttons. The movie results are displayed below the buttons as a list with a maximum amount of 50 movies. The 'Previous Page' and 'Next Page' buttons use the reference links that are provided in the response from the API endpoint (e.g.: 'next' for next page, 'prev' for the previous page, etc.).

We have also included two other buttons that allow us to download all the information on the database tables. This is the equivalent of "Get all movies" or "Get all actors". In the front end, this is only available as a CSV file and a download window pops-up when these buttons are pressed.

Moreover, for queries that include a calculated number, such as 'statistics', we have decided to round the number to the second decimal place. This was done to offer a better user experience. The API endpoint still return an accurate value with many decimal places.

## Team Effort
We believe that tasks were evenly distributed and that we all put the same amount of effort in the project. We all worked together developing different materials at once and keeping each other updated. All members participated on each topic, but each member had a special focus on a certain topic, as listed below:

* André: MySQL Database
* Daniël: API Endpoints
* Hande: API Documentation
* Hessel: API Frontend
* Viktor: API Frontend
