//include
const express = require('express');
const fs = require('fs');
const path = require('path');
const api = express();
const hateoasLinker = require('express-hateoas-links');

//use
api.use(hateoasLinker);
api.use(express.static('webapp'));


const MOVIE_NR = 62058;
const ACTOR_NR = 309509;

// Create Database Connection
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'movies'
});

try {
    connection.connect();
} catch (e) {
    console.log("Connection with MySQL Database failed");
    console.log(e);
}

// Start Listening
const port = process.env.PORT || 3000;
api.listen(port, () => console.log(`Listening on port ${port}...`));

// API Implementation

/*
    All helping functions
*/

//converts a JSON to a CSV
function csvConverter(data){
    var items = JSON.parse(JSON.stringify(data));
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','), // header row first
      ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    return csv;
}

//add aditional sorting
function queryParser(req) {
    let queryParam = "";
    //sort by year/users_rating/metascore
    if (req.query.sort) {
        queryParam = queryParam + " ORDER BY " + req.query.sort + " DESC"
    }
    return queryParam;
}

//Makes a MYSQL query based on pagination queries
function queryPages(req) {
    let limit;
    let page;
    let offset;

    limit = (req.query.limit ? req.query.limit : 50);
    if (req.query.page) {
        page = parseInt(req.query.page);
        offset = (req.query.page - 1) * limit
    } else if (req.query.offset) {
        offset = req.query.offset;
        page = parseInt(offset / limit) + 1;
    } else {
        page = 1;
    }
    return " LIMIT " + limit + (offset > 0 ? " OFFSET " + offset : "");
}

//Refactors the result of a query in pages
function pagination(req,results,root,path,query1) {
    let limit;
    let page;

    limit = (req.query.limit ? req.query.limit : 50);
    if (req.query.page) {
        page = parseInt(req.query.page);
    } else if (req.query.offset) {
        page = parseInt(offset / limit) + 1;
    } else {
        page = 1;
    }

    results.forEach((item, i) => {
        if (root == "movies") {
            item.links = [
                {rel: "see", method: "GET", href: "/api/" + root + "/id/" + results[i].id},
                {rel: "omdb", method: "GET", href: "/api/" + root + "/omdb/" + results[i].title}
            ];
        } else {
            item.links = [
                {rel: "see", method: "GET", href: "/api/" + root + "/id/" + results[i].id}
            ];
        }

    });
    if (true) {
        resultSet = {
            "links": [
                {rel: "self", method: "GET", href: "/api/" + root + path + "?" + query1 + "limit=" + limit + (page > 1 ? ("&page=" + page) : (""))},
                {rel: "first", method: "GET", href: "/api/" + root + path + "?" + query1 + "limit=" + limit },
                {rel: "prev", method: "GET", href: "/api/" + root + path + "?" + query1 +  "limit=" + limit + (page > 1 ? ("&page=" + (page - 1)) : (""))},
                {rel: "next", method: "GET", href: "/api/" + root + path + "?" + query1 +  "limit=" + limit + "&page=" + (page + 1)},
            ],
            "page": page,
            "results": results
        }
    } else {
        resultSet = results;
    }
    return resultSet;
}

/*
    all endpoints from /movies
*/

//All movies optinally identified by its unique IMDB URL or by its (non-unique) title
api.get('/api/movies', (req, res) => {
    let queryParam = "SELECT * FROM movies";
    let query1 = "";
    if (req.query.title) {
        queryParam = queryParam.concat(" WHERE title LIKE \"%" + req.query.title + "%\"");
        query1 = "title=" + req.query.title + "&";
    } else if (req.query.imdb_url) {
        queryParam = queryParam.concat(" WHERE imdb_url LIKE \"" + req.query.imdb_url + "\"");
        query1 = "imdb_url=" + req.query.imdb_url + "&";
    }
    queryParam = queryParam + queryParser(req);

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        connection.query(queryParam + queryPages(req), (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send({});
            } else {
                let resultSet = pagination(req,results,"movies","",query1);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});

//A specific movie based on id
api.get('/api/movies/id/:id', (req,res) => {
    let queryParam = "SELECT * FROM movies WHERE id = " + req.params.id;
    connection.query(queryParam, (err,results) => {
        if (err) {
            res.status(400).send()
        } else if (results.length <= 0) {
            res.status(204).send();
        } else if (req.query.contentType === "CSV") {
            csv = csvConverter(results);
            res.setHeader('Content-Type', 'text/csv');
            res.status(200).send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            let title = results[0].title;
            res.status(200).json(results[0], [
                    {rel: "self", method: "GET", href: "/api/movies/id/"+ req.params.id},
                    {rel: "omdb", method: "GET", href: "/api/omdb/" + title}
                ],
            );
        }
    });
});

//All movies from a specific genre
api.get('/api/movies/genre/:genre', (req, res) => {
    let queryParam = "SELECT * FROM movies WHERE genre LIKE \"%'" + req.params.genre + "'%\"";
    queryParam = queryParam + queryParser(req);

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        connection.query(queryParam + queryPages(req), (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                let resultSet = pagination(req,results,"movies","/genre/" + req.params.genre, "");
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});

// All movies for a specific actor or director, optionally sorted by year (ascending or descending)
api.get('/api/movies/people/:name', (req, res) => {
    let queryParam = "";
    if (req.query.year){
        queryParam = "SELECT * FROM movies WHERE (actors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR actors LIKE \"%\\\"" + req.params.name + "\\\"%\" OR directors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR directors LIKE \"%\\\"" + req.params.name + "\\\"%\") AND year = " + req.query.year + " ORDER BY year DESC";
    }
    else {
        queryParam = "SELECT * FROM movies WHERE actors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR actors LIKE \"%\\\"" + req.params.name + "\\\"%\" OR directors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR directors LIKE \"%\\\"" + req.params.name + "\\\"%\" ORDER BY year DESC";
    }

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                console.log(err)
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        temp = queryParam + queryPages(req);
        connection.query(temp, (err,results) => {
            if (err) {
                res.status(400).send();
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                let resultSet = pagination(req,results,"movies","/people/" + req.params.name,(req.query.year ? "year=" + req.query.year + "&" : ""));
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});

//An ordering of the movies ranked by their popularity (user rating) from more to less popular, with the possibility to subset this order, e.g. the top 50 movies
api.get('/api/movies/popularity', (req, res) => {
    let queryParam = "SELECT * FROM movies ORDER BY users_rating DESC";

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        let limit;
        let page;
        let offset;

        limit = (req.query.limit ? req.query.limit : 50);
        if (req.query.page) {
            page = parseInt(req.query.page);
            offset = (req.query.page - 1) * limit
        } else if (req.query.offset) {
            offset = req.query.offset;
            page = parseInt(offset / limit) + 1;
        } else {
            page = 1;
        }


        if (req.query.total) {
            if (req.query.total < limit*page) limit = (req.query.total - limit*(page-1) < 0 ? 0 : (req.query.total - limit*(page-1) - 1));
        }


        queryParam += " LIMIT " + limit + (offset > 0 ? " OFFSET " + offset : "");

        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                let resultSet = pagination(req,results,"movies","/popularity",(req.query.total ? "total=" + req.query.total + "&" : ""));
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});

//The previous, but in a certain year
api.get('/api/movies/popularity/year/:year', (req, res) => {
    let queryParam = "SELECT * FROM movies WHERE year=" + req.params.year + " ORDER BY users_rating DESC";

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        connection.query(queryParam + queryPages(req), (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                let resultSet = pagination(req,results,"movies","/popularity/year/" + req.params.year, "");
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});





/*
    all endpoints from /omdb
*/

//returns the omdb version of a movie
api.get('/api/omdb/:title', (req, res) => {

    const https = require('https')
    const uri = '/?apikey=dc1deb16&t=' + req.params.title;
    const options = {
        hostname: 'www.omdbapi.com',
        port: 443,
        path: encodeURI(uri),
        method: 'GET'
    }

    let body = "";
    const request = https.request(options, res2 => {

        res2.on('data', d => {
            body += d;
        })

        res2.on("end", () => {
            try {
                let json = JSON.parse(body);

                if (json == null) {
                    res.status(204).send();
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json(json, [
                            {rel: "self", method: "GET", href: "/api/omdb/"+ json.Title},
                        ],
                    );
                }
            } catch (error) {
                console.error(error.message);
            }
        })
    })

    request.on('error', error => {
        console.error(error)
    })

    request.end()
});





/*
    all endpoints from /actors
*/

//All actors in the dataset filtered by (full) name
api.get(('/api/actors'), (req, res) => {
    let queryParam = "SELECT * FROM actors";
    if (req.query.name) queryParam = queryParam + " WHERE name = " + req.query.name + " ORDER BY name";

    if (req.query.contentType == "CSV") {
        connection.query(queryParam, (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        });
    } else {
        connection.query(queryParam + queryPages(req), (err,results) => {
            if (err) {
                res.status(400).send()
            } else if (results.length <= 0) {
                res.status(204).send();
            } else {
                let resultSet = pagination(req,results,"actors","","");
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(resultSet);
            }
        });
    }
});

//A specific actor in the database
api.get(('/api/actors/id/:id'), (req, res) => {
    let queryParam = "SELECT * FROM actors WHERE id = " + req.params.id;
    connection.query(queryParam, (err,results) => {
        if (err) {
            res.status(400).send()
        } else if (results.length <= 0) {
            res.status(204).send();
        } else {
            results.forEach((item, i) => {
                item.links = [
                    {rel: "self", method: "GET", href: "/api/actors/id/" + results[i].id}
                ];
            });
            if (req.query.contentType === "CSV") {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(results);
            }
        }
    });
});

//Check if an actor exists in the database
api.get(('/api/actors/:actorname'), (req, res) => {
    let queryParam = "SELECT * FROM actors WHERE name LIKE \"%" + req.params.actorname + "%\"";
    queryParam = queryParam + queryParser(req);
    connection.query(queryParam, (err,results) => {
        if (err) {
            res.status(400).send()
        } else if (results.length <= 0) {
            res.status(204).send();
        } else {
            results.forEach((item, i) => {
                item.links = [
                    {rel: "see", method: "GET", href: "/api/actors/id/" + results[i].id}
                ];
            });
            if (req.query.contentType === "CSV") {
                csv = csvConverter(results);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(results);
            }
        }
    });
});





/*
    all endpoints from /genres
*/

// All movie genres for a specific actor or director
api.get(('/api/genre/people/:name'), (req, res) => {

    let queryParam = "SELECT genre FROM movies WHERE actors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR actors LIKE \"%\\\"" + req.params.name + "\\\"%\" OR directors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR directors LIKE \"%\\\"" + req.params.name + "\\\"%\"";
    const data = fs.readFileSync(path.join(__dirname, '../Database Files/Given/movie.json'));
    const movies = JSON.parse(data);
    const moviesWithPerson = movies.filter(movie => (typeof movie.directors != "undefined" && movie.directors.includes(req.params.name))||movie.actors.includes(req.params.name));
    connection.query(queryParam, (err,results) => {
        if (err) {
            res.status(400).send()
        } else if (results.length <= 0) {
            res.status(204).send();
        } else {
            const data = JSON.parse(JSON.stringify(results));

            const listGenres = moviesWithPerson.map(movie => movie.genre);
            let genres = []
            listGenres.forEach(genre => genres = genres.concat(genre));
            let uniqueGenres = [];
            genres.forEach((g) => {
                if (!uniqueGenres.includes(g)) {
                    uniqueGenres.push(g);
                }
            });
            results2 = uniqueGenres.sort();

            if (req.query.contentType === "CSV") {
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send("genres\n[" + results2 + "]");
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(results2);
            }
        }
    });
});

//the previous but sorted by year
api.get(('/api/genre/people/:name/year'), (req, res) => {
    let queryParam = "SELECT genre,year FROM movies WHERE actors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR actors LIKE \"%\\\"" + req.params.name + "\\\"%\" OR directors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR directors LIKE \"%\\\"" + req.params.name + "\\\"%\"";
    if (req.query.order == "ASC") {
        queryParam = queryParam + " ORDER BY year ASC";
    } else {
        queryParam = queryParam + " ORDER BY year DESC";
    }
    connection.query(queryParam, (err,results) => {

        if (err) {
            res.status(400).send()
        } else if (results.length <= 0) {
            res.status(204).send();
        } else if (req.query.contentType === "CSV") {
            csv = csvConverter(results);
            res.setHeader('Content-Type', 'text/csv');
            res.status(200).send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(results);
        }
    });
})





/*
    all endpoints from /statistics
*/

//Descriptive statistics (mean, median, standard deviation) for the popularity of all movies for a particular actor with an optional filter by year
api.get('/api/statistics/people/:name', (req, res) => {
    connection.query("SELECT users_rating FROM movies WHERE (actors LIKE \"%\\\'" + req.params.name + "\\\'%\" OR actors LIKE \"%\\\"" + req.params.name + "\\\"%\")" + (req.query.year ? " AND year = " + req.query.year : "") + " ORDER BY users_rating", (err, results) => {
        if (err) {
            res.status(400).send();
            return;
        } else if (results.length <= 0) {
            res.status(204).send();
            return;
        }

        let total = 0;
        let variance = 0;
        let median = 0;
        results.forEach((item, i) => {
            total += parseFloat(item['users_rating'],10);
        });
        let mean = total/results.length;
        results.forEach((item, i) => {
            variance += Math.pow(parseFloat(item['users_rating'],10)-mean,2);
        });
        variance /= (results.length);
        if (results.length == 1){
            median = results[0]['users_rating'];
        } else if (results.length % 2 == 1) {
            median = parseFloat(results[Math.floor(results.length/2)]['users_rating']);
        } else {
            median = parseFloat((parseFloat(results[results.length/2-1]['users_rating']) + parseFloat(results[results.length/2]['users_rating']))/2);
        }
        if (req.query.contentType === "CSV") {
            res.setHeader('Content-Type', 'text/csv');
            res.status(200).send(
                "\"mean\",\"median\",\"std\"\n" + mean + "," + median + "," + (Math.sqrt(variance))
            );
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                'mean' : (mean),
                'median' : (median),
                'std' : (Math.sqrt(variance)),
            });
        }

    });
});
