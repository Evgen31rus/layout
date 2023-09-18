let hallInfo = sessionStorage.getItem("hallInfo");
let wrapper = document.getElementsByClassName("conf-step__wrapper")[0];

let sum = 0;

if(hallInfo!=="null"){

    hallInfo = hallInfo.replace(/\\/g, "");
    hallInfo = hallInfo.replace(/^"|"$/g, '');
    wrapper.innerHTML = hallInfo;
}
else {
    let hallConfig = sessionStorage.getItem("hall_config");
    if(hallConfig) {
      wrapper.innerHTML = "";
      wrapper.innerHTML = hallConfig;
    }
}

let buyingInfoDescription = document.getElementsByClassName("buying__info-description")[0]; 
buyingInfoDescription.getElementsByClassName("buying__info-title")[0].textContent = sessionStorage.getItem("data-film-name");
buyingInfoDescription.getElementsByClassName("buying__info-start")[0].textContent  = `Начало сеанса: ${sessionStorage.getItem("data-seance-time")}`;
buyingInfoDescription.getElementsByClassName("buying__info-hall")[0].textContent = sessionStorage.getItem("data-hall-name");

document.getElementsByClassName("conf-step__legend-value price-standart")[0].textContent = sessionStorage.getItem("data-price-standart");
document.getElementsByClassName("conf-step__legend-value price-vip")[0].textContent = sessionStorage.getItem("data-price-vip");

let wrapperChildren = wrapper.children;

for(let i =0;i<wrapper.childElementCount; i++ ){ 
    let chairs = wrapperChildren[i].children;
    for(let j =0; j<chairs.length;j++){
        chairs[j].onclick = function () {
            if(!this.classList.contains("conf-step__chair_taken")) {
              if(this.classList.toggle("conf-step__chair_selected")){ 
                if(this.classList.contains("conf-step__chair_standart")) {
                  sum+= Number(sessionStorage.getItem("data-price-standart"));
                }
                else {
                  sum+= Number(sessionStorage.getItem("data-price-vip"));
                }
              }
              else {
                if(this.classList.contains("conf-step__chair_standart")) {
                    sum-= Number(sessionStorage.getItem("data-price-standart"));
                  }
                  else {
                    sum-= Number(sessionStorage.getItem("data-price-vip"));
                  }
              }
              
            }
        }
        chairs[j].addEventListener("mouseenter",function () {
            this.style.cursor = "pointer";
        })
    }
}

let buyButton = document.getElementsByClassName("acceptin-button")[0];
buyButton.addEventListener("mouseenter",function () {
  this.style.cursor = "pointer";
})

buyButton.onclick = function () { 
  let chairsSelected =Array.from(wrapper.getElementsByClassName("conf-step__chair_selected"));
  if(chairsSelected.length) {
    let chair = {}; 
    let saveCurrentBuy = {};
    chairsSelected.forEach(e => {  
      let parrent = e.parentElement;
      let place = null;
      let row = null;
      Array.from(parrent.children).forEach((child,index) =>{
        if(child === e){
          place = index+1;
        }
      })
      Array.from(parrent.parentElement.children).forEach((eParrent,index) => {
        if(parrent === eParrent){
          row = index+1;
        }
      })
      chair[row] ? chair[row].push(place) : chair[row] = [place];
  })
  
    saveCurrentBuy["currentBuy"] = 
    {"data-film-name": sessionStorage.getItem("data-film-name"),
    "data-hall-name": sessionStorage.getItem("data-hall-name"),
    "data-seance-time": sessionStorage.getItem("data-seance-time"),
    "data-seance-id" : sessionStorage.getItem("data-seance-id"),
    "cost": sum,
    "chair": chair
    }

    sessionStorage.setItem(sessionStorage.getItem("data-seance-id"),JSON.stringify(saveCurrentBuy));

    let data = `event=sale_add&timestamp=${sessionStorage.getItem("data-seance-timestamp")}&hallId=${sessionStorage.getItem("data-hall-id")}&seanceId=${sessionStorage.getItem("data-seance-id")}&hallConfiguration=${wrapper.innerHTML}`;
    request(()=> {
      chairsSelected.forEach(e => {
        e.classList.toggle("conf-step__chair_selected");
        e.classList.toggle("conf-step__chair_taken");
        })
      sessionStorage.setItem("hallInfo",wrapper.innerHTML);
      window.location.href = "payment.html"; 
    },data);
  }
  else{
    alert("вы не выбрали место(а)");
  }

  
}

let buyingInfoHint = document.getElementsByClassName('buying__info-hint')[0];
let lastTouchEnd = 0;
let scale = "scale(1.0)";
let rem = "3rem";
let marginTop = "0";
buyingInfoHint.addEventListener('touchend', function(event) {
  let now = new Date().getTime();
  if (now - lastTouchEnd <= 300) {
    if(scale === "scale(1.0)"){
      scale = "scale(1.2)";
      rem = "6rem";
      marginTop = "25px";
    }
    else {
      scale = "scale(1.0)";
      rem = "3rem";
      marginTop = "0";
    }
    let confStepWrapper = document.getElementsByClassName("conf-step__wrapper")[0];
    let confStepLegend = document.getElementsByClassName("conf-step__legend")[0];
    confStepLegend.style.paddingTop = rem;

    confStepWrapper.style.transform = scale;
    confStepWrapper.style.marginTop = marginTop;
  }
  lastTouchEnd = now;
});