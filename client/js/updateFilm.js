function startSetInfo(){
  if (!localStorage.length) {  
    request((info) => {
      localStorage.setItem('info', info);
      localStorage.setItem('date',new Date());
      setFilms(JSON.parse(info),selectDay);
    },"event=update");
 }
 else {
   let date = new Date(localStorage.getItem("date"));
   if (currentDate.getDate() === date.getDate()) { 
     let info = JSON.parse(localStorage.getItem("info"));
     setFilms(info,selectDay);
   }else { 
      request((info) => {
        localStorage.setItem('info', info);
        localStorage.setItem('date',new Date());
        setFilms(JSON.parse(info),selectDay); 
      },"event=update");
   }
 }
}

function setFilms(info,date) {
    let moviesSection = Array.from(document.getElementsByClassName("movie"));
    let movieSection = moviesSection[0].cloneNode(true);
    let seanceHall = Array.from(movieSection.getElementsByClassName("movie-seances__hall"))[0].cloneNode(true); 
    moviesSection.forEach(element => { element.remove()}); 
    Array.from(movieSection.getElementsByClassName("movie-seances__hall")).forEach(e => {e.remove()}); 
    let main = Array.from(document.getElementsByTagName("main"))[0];

    let filmsHalls ={}; 
    info.seances.result.forEach(e => {
      filmsHalls[e.seance_filmid] ? filmsHalls[e.seance_filmid].push(e) : filmsHalls[e.seance_filmid] = [e]; 
    })

    let openHalls = {};
    info.halls.result.forEach(e=> {
      if(e.hall_open === "1"){
        openHalls[e.hall_id] = e;
      } 
    })

    info.films.result.forEach((element) => { 
      let newMovieSection = movieSection.cloneNode(true);
      let curretnFilmHalls = {};
      Array.from(newMovieSection.getElementsByClassName("movie__poster-image"))[0].src = element.film_poster;
      Array.from(newMovieSection.getElementsByClassName("movie__title"))[0].textContent = element.film_name;
      Array.from(newMovieSection.getElementsByClassName("movie__data-duration"))[0].textContent = element.film_duration + " " + declension(Number(element.film_duration),['минута', 'минуты', 'минут']);
      Array.from(newMovieSection.getElementsByClassName("movie__data-origin"))[0].textContent = element.film_origin;
      Array.from(newMovieSection.getElementsByClassName("movie__synopsis"))[0].textContent = element.film_description;

      filmsHalls[element.film_id].forEach(e => {
        if(openHalls[e.seance_hallid]){
          let hall = openHalls[e.seance_hallid];
          if(curretnFilmHalls[hall.hall_name]) {
            curretnFilmHalls[hall.hall_name].push(e.seance_time);
          }
          else {
            curretnFilmHalls[hall.hall_name] = [e.seance_time];
          }
        }
      }) 
      
      let sortedHalls = {};
      Object.keys(curretnFilmHalls).sort().forEach(key => {
        sortedHalls[key] = curretnFilmHalls[key];
      });

      Object.keys(sortedHalls).forEach(key => {
        let hall = seanceHall.cloneNode(true);
        let ul = hall.getElementsByTagName("ul")[0];
        let li = ul.getElementsByTagName("li")[0].cloneNode(true);
        ul.innerHTML = "";

        hall.getElementsByTagName('h3')[0].textContent = key.substring(0,3)+" "+key.substring(3);

        sortedHalls[key].forEach( time => {
          let currHall = Object.values(openHalls).find(hall => hall.hall_name === key) ;
          let currSeance = filmsHalls[element.film_id].find( seance=> {return seance.seance_time === time})
          let newTime = li.cloneNode(true);
          let refHall =  newTime.children[0];

          refHall.classList.remove("acceptin-button-disabled");
          refHall.textContent = time;
          refHall.setAttribute('data-film-id', element.film_id);
          refHall.setAttribute('data-film-name', element.film_name);
          refHall.setAttribute('data-hall-name', key.substring(0,3)+" "+key.substring(3));
          refHall.setAttribute('data-hall-id', currHall.hall_id);
          refHall.setAttribute('data-price-vip', currHall.hall_price_vip);
          refHall.setAttribute('data-price-standart', currHall.hall_price_standart);
          refHall.setAttribute('data-seance-id', currSeance.seance_id);
          refHall.setAttribute('data-seance-time', currSeance.seance_time);
          refHall.setAttribute('data-seance-start', currSeance.seance_start);
          refHall.setAttribute('data-seance-timestamp', toSecond(currSeance.seance_time,date));

          if(selectDay.getDate() === currentDate.getDate()) { 
            let timeSeance = Number(refHall.getAttribute("data-seance-timestamp"));
            let currentTime = Math.floor(currentDate.getTime()/1000);
            if(timeSeance < currentTime){
              refHall.classList.add("acceptin-button-disabled");
            }
          }

          let data = `event=get_hallConfig&timestamp=${refHall.getAttribute("data-seance-timestamp")}&hallId=${refHall.getAttribute("data-hall-id")}&seanceId=${refHall.getAttribute("data-seance-id")}`;
          refHall.onclick = function(){
            request((hallInfo)=> {
              sessionStorage.setItem("hallInfo",hallInfo);
              sessionStorage.setItem("hall_config",currHall.hall_config);

              for (let i = 0; i < refHall.attributes.length; i++) {
                const attribute = refHall.attributes[i];
                sessionStorage.setItem(attribute.name,attribute.value);
              }
              window.location.href = "hall.html";
            },data);
            return false;
          }
          ul.appendChild(newTime);
        })
        newMovieSection.appendChild(hall);

      })
      main.appendChild(newMovieSection);
    })
}

function toSecond(time,date) {
  let [hours, minutes] = time.split(':');
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  return Math.floor(date.getTime() / 1000); 
}
function declension(number, titles) { 
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

startSetInfo();

setInterval(()=>{ 
  currentDate = new Date();
  let acceptinButton = Array.from(document.getElementsByClassName("movie-seances__time"));
  acceptinButton.forEach(e => {
    if(selectDay.getDate() === currentDate.getDate()) { 
      let timeSeance = Number(e.getAttribute("data-seance-timestamp"));
      let currentTime = Math.floor(currentDate.getTime()/1000);
       if(timeSeance < currentTime){
        e.classList.add("acceptin-button-disabled");
       }
       else {
        e.classList.remove("acceptin-button-disabled");
      }
    }
  }) 
},1000)