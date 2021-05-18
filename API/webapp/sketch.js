//sets up the buttons if they are on the page
function setup() {
  let button01 = select('#search01');
  let button02 = select('#search02');
  let button03 = select('#search03');
  let button04 = select('#search04');
  let button05 = select('#search05');
  let button06 = select('#search06');
  let button07 = select('#search07');
  let button08 = select('#search08');
  let button09 = select('#search09');

  if(button01){
    button01.mousePressed(searchActor);
  }
  if(button02){
    button02.mousePressed(searchMovieTitle);
  }
  if(button03){
    button03.mousePressed(searchMoviesByActor);
  }
  if(button04){
    button04.mousePressed(searchActorGenre);
  }
  if(button05){
    button05.mousePressed(searchMoviePopularity);
  }
  if(button06){
    button06.mousePressed(statisticsActor);
  }
  if(button07){
    button07.mousePressed(isActorInDB);
  }
  if(button08){
    button08.mousePressed(searchMoviesByGenre);
  }
  if(button09){
    button09.mousePressed(searchOMDB);
  }
}

//Calls the api method for statistics of a specific actor and draws the corresponding response
function statisticsActor() {
  let actor = select('#actor06').value();
  let year = select('#movieYear06').value();
  if(!actor){
    return;
  }
  if(year){
    httpGet('/api/statistics/people/' + actor +'?year=' + year, "json",false, function (response){
      document.getElementById("act_statistics").innerHTML =`
        <h4>Statistics for ${actor}</h4>
        <p><strong>Mean:</strong> ${response.mean.toFixed(2)}</p>
        <p><strong>Median:</strong> ${response.median.toFixed(2)}</p>
        <p><strong>Standard deviation:</strong> ${response.std.toFixed(2)}</p>
      `
    });
  } else{
    httpGet('/api/statistics/people/' + actor, "json", false, function (response){
      document.getElementById("act_statistics").innerHTML =`
        <h4>Statistics for ${actor}</h4>
        <p><strong>Mean:</strong> ${response.mean.toFixed(2)}</p>
        <p><strong>Median:</strong> ${response.median.toFixed(2)}</p>
        <p><strong>Standard deviation:</strong> ${response.std.toFixed(2)}</p>
      `
    });
  }
}

//Calls the api method for popular movies and draws the corresponding response
function searchMoviePopularity() {
  let number = select('#number05').value();
  let year = select('#movieYear05').value();
  if(year){
    if(number){
      httpGet('/api/movies/popularity/year/' + year + '?total=' + number, "json", false, function (response){
        document.getElementById("display").innerHTML =`
          <div class="movieList" id="movieList">
            ${response.results.map(drawMovie2).join('')}
          </div>
        `
        addPageButtons(response);
      });
    } else{
      httpGet('/api/movies/popularity/year' + year, "json", false, function (response){
        document.getElementById("display").innerHTML =`
          <div class="movieList" id="movieList">
            ${response.results.map(drawMovie2).join('')}
          </div>
        `
        addPageButtons(response);
      });
    }
  } else{
    if(number){
      httpGet('/api/movies/popularity?total=' + number, "json", false, function (response){
        document.getElementById("display").innerHTML =`
          <div class="movieList" id="movieList">
            ${response.results.map(drawMovie2).join('')}
          </div>
        `
        addPageButtons(response);
      });
    } else{
      httpGet('/api/movies/popularity', "json", false, function (response){
        document.getElementById("display").innerHTML =`
          <div class="movieList" id="movieList">
            ${response.results.map(drawMovie2).join('')}
          </div>
        `
        addPageButtons(response);
      });
    }  }
}

//draws movie with indexing
function drawMovie1(movie){
  return  `
  <div class="movie">
    <a href="${movie[0].img_url}" style="background-color: transparent">
      <img class="moviePicture" src="${movie[0].img_url}" alt="Movie Picture"/>
    </a>
    <ul class="movieInfo">
      <li>
        <a href="${movie[0].imdb_url}">${movie[0].title}</a>
      </li>
      <li>
        <a>
          <strong>Rating:</strong> ${movie[0].rating}
        </a>
      </li>
      <li>
        <a>
          <strong>Genre:</strong> ${movie[0].genre}
        </a>
      </li>
      <li>
        <a>
          <strong>User Rating:</strong> ${movie[0].users_rating}
        </a>
      </li>
      <li>
        <p>
          <strong>Summary:</strong> ${movie[0].tagline}
        </p>
      </li>
    </ul>
  </div>
  `;
}

//draws the next page if it exists
function drawNextPage() {
  let nextButton = document.getElementById("next");
  let prevButton = document.getElementById("prev");
  httpGet(nextButton.value, false, function (response){
      if(response !== ''){
          let data = JSON.parse(response);
        document.getElementById("movieList").innerHTML = `
          ${data.results.map(drawMovie2).join('')}
       `
        nextButton.value = data.links[3].href;
        prevButton.value = data.links[2].href;
      }
      });
}

//draws the previous page if it exits
function drawPrevPage() {
  let prevButton = document.getElementById("prev");
  let nextButton = document.getElementById("next");
  httpGet(prevButton.value, false, function (response){
    if(response !== ''){
        let data = JSON.parse(response);
        document.getElementById("movieList").innerHTML = `
          ${data.results.map(drawMovie2).join('')}
       `
        nextButton.value = data.links[3].href;
        prevButton.value = data.links[2].href;
    }
  });
}
//adds page buttons to the display
function addPageButtons(response) {
  let but1 = document.createElement('button');
  but1.setAttribute("id", "next");
  but1.innerHTML = `next page`;
  but1.setAttribute('value', response.links[3].href);
  but1.addEventListener("click", drawNextPage);
  let but2 = document.createElement('button');
  but2.innerHTML = `previous page`;
  but2.setAttribute("id", "prev");
  but2.setAttribute('value', response.links[2].href);
  document.getElementById("display").appendChild(but2);
  document.getElementById("display").appendChild(but1);
  but2.addEventListener("click", drawPrevPage);
}

//Calls the api method for finding movies by title and draws the corresponding response
function searchMovieTitle() {
  let title = select('#title02').value();
  if(title){
    httpGet('/api/movies?title=' + title, "json", false, function (response){
      if(response.results){
        let display = document.getElementById("display");
         display.innerHTML = `<div class="movieList" id="movieList">
            ${response.results.map(drawMovie2).join('')}
          </div>
              `
        addPageButtons(response);

      } else {
        let div = document.createElement("div");
        div.setAttribute("class", "movieList");
        div.innerHTML = drawMovie1(response)
        document.getElementById("display02").innerHTML = ``;
        document.getElementById("display02").appendChild(div);
      }
    });
  }
}
//draws a movie without indexes
function drawMovie2(movie){
  return  `
  <div class="movie">
    <a href="${movie.img_url}">
      <img class="moviePicture" src="${movie.img_url}" alt="Movie Picture">
    </a>
    <ul class="movieInfo">
      <li>
        <a href="${movie.imdb_url}" style="text-decoration: underline;">
          <strong>${movie.title}</strong>
        </a>
      </li>
      <li>
          <strong>Rating:</strong> ${movie.rating}
      </li>
      <li>
          <strong>Genre:</strong> ${movie.genre}
      </li>
      <li>
          <strong>User Rating:</strong> ${movie.users_rating}
      </li>
      <li>
        <p>
          <strong>Summary:</strong> ${movie.tagline}
        </p>
      </li>
    </ul>
  </div>
  `;
}

//Calls the api method finding (partial) names in the database and draws the corresponding response
function searchActor(){
  let actor = select('#actor01').value();
  if (actor){
    httpGet('/api/actors/' + actor, "json", false, function (response){
      let div = document.getElementById("display01");
      let listOfList = document.createElement("div");
      listOfList.setAttribute('class', 'listing');
      div.innerHTML=``;
      div.appendChild(listOfList);
      for (let i = 0; i < Math.ceil(response.length/10) ; i++) {
        let actorList = document.createElement("ul");
        actorList.setAttribute("class" ,"actorList");
        actorList.innerHTML=`
        <li>
            ${response[i*10] ? response[i*10].name: ''}
         </li>
        <li>
          ${response[i*10+1] ? response[i*10+1].name: ''}
        </li>
        <li>
          ${response[i*10+2] ? response[i*10+2].name: ''}
        </li>
        <li>
          ${response[i*10+3] ? response[i*10+3].name: ''}
        </li>
        <li>
          ${response[i*10+4] ? response[i*10+4].name: ''}
        </li>
        <li>
          ${response[i*10+5] ? response[i*10+5].name: ''}
        </li>
        <li>
          ${response[i*10+6] ? response[i*10+6].name: ''}
        </li>
        <li>
          ${response[i*10+7] ? response[i*10+7].name: ''}
        </li>
        <li>
          ${response[i*10+8] ? response[i*10+8].name: ''}
        </li>
        <li>
          ${response[i*10+9] ? response[i*10+9].name: ''}
        </li>
        <ul/>`
        listOfList.appendChild(actorList);
      }
    });
  }
}

//Calls the api method movies of an actor and draws the corresponding response
function searchMoviesByActor() {
  let actor = select('#actor03').value();
  let year = select('#movieYear03').value();
  if(!actor){
    return;
  }
  if(year){
    httpGet('/api/movies/people/' + actor + '?year=' + year, "json", false, function (response){
      document.getElementById("display").innerHTML =`
      <div class="movieList" id="movieList">
      ${response.results.map(drawMovie2).join('')}
      </div>
      `
      addPageButtons(response);
    });
  } else{
    httpGet('/api/movies/people/' + actor, "json", false, function (response){
      document.getElementById("display").innerHTML =`
      <div class="movieList" id="movieList">
      ${response.results.map(drawMovie2).join('')}
      </div>
      `
      addPageButtons(response);
    });
  }
}

//Calls the api method  and draws the corresponding response
function searchActorGenre(){
  let actor = select('#actor04').value();
  if (actor) {
    let data;
    httpGet('/api/genre/people/' + actor, 'json', false , function (response) {
      data = response;
      document.getElementById("actor_genres").innerHTML = `<p>
    ${data.map(function (genre) {
        return ` ${genre}`
      }).join(',')}
    </p>
    `
    });
  }
}

//Calls the api method for retrieving movies by genre and draws the corresponding response
function searchMoviesByGenre() {
  let genre = select('#genre08').value();
  if (genre) {
    httpGet('/api/movies/genre/' + genre , "json", false, function (response){
      document.getElementById("display").innerHTML =`
    <div class="movieList" id="movieList">
    ${response.results.map(drawMovie2).join('')}
    </div>
    `
    addPageButtons(response);
    });
  }
}

//Calls the api method to check if a specific actor is in the DataBase and draws the corresponding response
function isActorInDB() {
  let name = select('#actName_text').value();
  if (name) {
    if (name.toString().toLowerCase() === "rick astley") location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    httpGet('/api/actors/?name=\"' + name + '\"', 'json', false , function (response) {
      document.getElementById("act_status").innerHTML = `<p>An actor with this name was found! ID: ${response.results[0].id}</p>`
    }, function () {
      document.getElementById("act_status").innerHTML = `<p>No actors with this name were found on our database.</p>`
    });
  }
}

//Calls the api method regarding OMDB and draws the corresponding response
function searchOMDB() {
  let title = select('#title03').value();
  if (title) {
    httpGet('/api/omdb/' + title, 'json', false , function (response) {
      if (response["Response"] === "True") {
        document.getElementById("omdb_results").innerHTML = `
            <p><strong>OMDB found a movie!</strong></p>
            <p><strong>Title:</strong> ${response["Title"]}</p>
            <p><strong>Awards:</strong> ${response["Awards"]}</p>
            <p><strong>Box Office:</strong> ${response["BoxOffice"]}</p>
        `
      }
      else {
        document.getElementById("omdb_results").innerHTML = `<p><strong>No movie found in OMDB</strong></p>`
      }
    });
  }
}
