max_time_in_minutes = 30;

//setCookie() and getCookie() are functions taken from w3schools
//https://www.w3schools.com/js/js_cookies.asp#:~:text=JavaScript%20can%20create%2C%20read%2C%20and,cookie%20property.
//I modified the setCookie() function to set the expiration date of the cookie to 11:59 pm on the current day
function setCookie(cname, cvalue) {
  const d = new Date();
  d.setHours(23, 59, 59, 999)
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getVideoElement(){
  var video_elements = document.querySelectorAll("video")
  //The above array sometimes contains a video element that has no src (no idea why; what the heck YouTube?)
  //In any case, we want the video element that has a src, so we'll just search for it.
  var ret = null;
  for(var i = 0; i < video_elements.length; i ++){
    if(video_elements[i].src.length > 0)ret = video_elements[i];
  }
  return ret;
}

function getCookieTime(){
  //Returns how much time is stored in the timewatched cookie (in seconds)
  //If there is no timewatched cookie, getCookie() will return a blank string
  //This function is called only once, 2 seconds after the page loads.
  
  var cookieTime = parseInt(getCookie("timewatched"))
  if(Number.isNaN(cookieTime)){
    //If there is no timewatched cookie, create one that's set to zero.
    console.log("Starting from zero...")
    cookieTime = 0;
    document.cookie = "timewatched:0"
  }
  return cookieTime;
}

function getTimeWatched(){
  //Returns how much time the user has spent watching YouTube,
  //including how much time was in the timewatched cookie at the time of the page load.
  
  //Add up all the times from the videoElement.played() array
  var playedLength = videoElement.played.length 
  var ttw = 0; //total time watched in seconds
  for(var i = 0; i < playedLength; i ++){
    ttw += videoElement.played.end(i) - videoElement.played.start(i)
  }
  
  //Last step: add the cookieTimeAtStart value to the sum.
  return ttw + cookieTimeAtStart;
}

function initiateTimer(){
  document.addEventListener('keydown', (e)=>{
    if(e.code == 'Equal'){
      let newTime = parseFloat (prompt("Enter today's time in minutes") );
      if(Number.isInteger(newTime)){
        cookieTimeAtStart = 60 * parseInt(newTime)
        updateTimer();
      } else {
        // alert("Not an integer")
      }
    }
  } )
  //This function is called 2 seconds after the page loads
  //The last line of code calls this function (see bottom)
  
  //Gets how many seconds are in the timewatched cookie at the start of the page load
  //If there is no timewatched cookie, one will be created and set to zero seconds
  cookieTimeAtStart = getCookieTime();
  
  
  videoElement = getVideoElement();
  if(videoElement !== null)pvideosrc = videoElement.src
  else pvideosrc = "there was no previous video"
  
  console.log("Cookie time at start: " + cookieTimeAtStart)
  
  totalTimeWatched = 0;
  
  //timerElement is the <p> element that will appear above the video that shows time spent watching.
  timerElement = document.createElement('p')
  timerElement.innerHTML = "this is the timer element" //This will be changed
  timerElement.setAttribute('style', 'font-size:15px; color:white')
  
  //divElement is a <div> element that already exists on the YouTube page. It will be the parent of the timerElement
  divElement = document.querySelectorAll('div[id="primary"][class="style-scope ytd-watch-flexy"]')[0]
  
  divElement.prepend(timerElement)
  
  updateTimer(); //updateTimer() is a recursive function that's called every 5 seconds
}

function updateTimer(){
  //This function is called every five seconds. It updates the totalTimeWatched variable
  
  
  //Check to see if the user has switched videos since the last timer update. If so,
  //recalculate cookieTimeAtStart
  //cookieTimeAtStart needs to be recalculated every time the user switches to a new video.
  //However, clicking on a new video does not refresh the YouTube page. As an alternative, we will
  //recalculate cookieTimeAtStart whenever the user clicks on anything that changes the src of the video element.
  
  videoElement = getVideoElement();
  if(videoElement !== null){
    var videosrc = videoElement.src
    if(videosrc !== pvideosrc){
      console.log("NEW PAGE!")
      cookieTimeAtStart = getCookieTime();
      console.log("Cookie time at start: " + cookieTimeAtStart)
    }
    pvideosrc = videosrc;
    
    totalTimeWatched = getTimeWatched();
    
    var ttwstr = Math.round(totalTimeWatched/videoElement.playbackRate)
    
    //Store the total time watched in seconds in our timewatched cookie
    //The cookie will expire at midnight of the current day
    document.cookie = setCookie("timewatched", ttwstr.toString())
    
    //Update the timerElement to show the total time watched in minutes and seconds
    var minutes = Math.floor(totalTimeWatched / 60)
    var seconds = Math.round(totalTimeWatched) % 60
    seconds = seconds.toString()
    seconds = seconds.padStart(2,"0")
    timerElement.innerHTML = "Watch time today: " + minutes + ":" + seconds
    
    //If user has spent more than 30 minutes watching YouTube today, alert them.
    if(totalTimeWatched > max_time_in_minutes * 60 && totalTimeWatched < (max_time_in_minutes * 60) + 5)confirm("You have exceeded 30 minutes on YouTube today. Proceed?")
  }
  
  //Call updateTimer() again in five seconds (recursive)
  setTimeout(updateTimer, 5000)
}

//initiateTimer() will be called 2 seconds after the page loads 
setTimeout(initiateTimer, 2000)
