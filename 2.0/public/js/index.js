var socket = io();
var decisions = [];
var picArray = [];
var pairs = [];
var votes = 0;
var clickedPictureId = [];
var messageToServer = {
  from: 'User',
  text: 'Send a picture please'
}

//showing/hideing page parts
$('a').click( function(){
  var clickedMenu = $(this).text();

  switch (clickedMenu) {
    case 'Vote':
      $('#container_voting').css("display", "block");
      $('#container_stats').css("display", "none");
      $('#container_top_sort').css("display", "none");
      break;
    case 'Stats':
      $('#container_voting').css("display", "none");
      $('#container_stats').css("display", "block");
      $('#container_top_sort').css("display", "none");
      break;
    case 'Top Cats':
      $('#container_voting').css("display", "none");
      $('#container_stats').css("display", "none");
      $('#container_top_sort').css("display", "block");
      break;
  };
});

socket.on('connect', function(){

  console.log('connected to server');

//request 2 inital pictures
  socket.emit('initRequestPicture1', messageToServer);
  socket.emit('initRequestPicture2', messageToServer);

});

socket.on('welcomeMessage', function(message){
  console.log(`Message from ${message.from}: ${message.text}`);
});

// socket to listen for pictures from server
var receivePicture = function(socketName, picPosition){

  socket.on(socketName, function(picture){
    var time = 0;
    var picObj = {
      id: picture.id,
      url: picture.picUrl,
      position: picPosition,
      votes: 0,
      reused: false,
      voteTime: 0
    };

    $(`#${picPosition}`).find('img').attr( "src", picObj.url).attr( "id", picObj.id);

    picture = [];
    picArray.push(picObj);
  });
};

// listen to socket for 2 initial pictures
receivePicture('initPicture1', 'left_picture');
receivePicture('initPicture2', 'right_picture');

// listen to socket for 2 pictures
receivePicture('picture1', 'left_picture');
receivePicture('picture2', 'right_picture');

//all picture related actions after the 2 initial pictures received are triggered by clickin on any of the pictures
$('#container_voting').find('img').click( function() {

// log voted picture
console.log('voted pic id: ', $(this).attr('id'));
console.log('voted pic source: ', $(this).attr('src'));

//log if voted different pic at reused pair
var logReuseChoice = function(arr, clickedPic){
  for (i = 0; i < arr.length; i++){

    var clickTime = 0;
    clickTime = new Date().getTime();

    if (arr[i].id == clickedPic.attr('id') && arr[i].reused == true){
        if (i % 2 == 0){
            if (arr[i].voteTime - clickTime < arr[i + 1].voteTime - clickTime){
              console.log('different vote');
            } else {
              console.log('same vote');
            };
        } else {
          if (arr[i].voteTime - clickTime < arr[i - 1].voteTime - clickTime){
            console.log('different vote');
          } else {
            console.log('same vote');
          };
        };
    };
  };
};

// assign vote and vote time to picture
var voteTime = function(arr, pic){
  var votedPic = [];
  var time = 0;

  time = new Date().getTime();
  votedPic = pic.attr('id');

  for(i = 0; i < arr.length; i++){
    if (arr[i].id == votedPic){
      arr[i].votes++;
      arr[i].voteTime = time;
    };
  };
};

//sort last five votes
var getLastFive = function(arr){
  var voteTimeObj = [];
  for (i = 0; i < arr.length; i++){
    if (arr[i].votes > 0){
      voteTimeObj.push([arr[i].voteTime, arr[i].url]);
    };
  };
  return voteTimeObj;
};

var sortByTime = function(arr, func){
  var voteTimeObjToSort = [];
  var sortedVoteTimeObj = [];

  voteTimeObjToSort = func(arr);

  sortedVoteTimeObj = voteTimeObjToSort.sort(function(ob1, ob2){
    return ob2[0] - ob1[0];
  });
  return sortedVoteTimeObj;
};

var displayLast5Votes = function(arr, htmlEl, timeFunc, sortFunc){

  htmlEl.empty();

  var displayLastVotes = 0;
  var sortedObj = sortFunc(arr, timeFunc);

  if (sortedObj.length < 5){
    displayLastVotes = sortedObj.length;
  } else {
    displayLastVotes = 5;
  };

  for(n = 0; n < displayLastVotes; n++){
    htmlEl.append(`<img src="${sortedObj[n][1]}">`);
  };
};

//sort pics by votes
var getDataToSort = function(arr){
  var urlVotes = [];
  for (i = 0; i < arr.length; i++){
    urlVotes.push([arr[i].votes, arr[i].url]);
  };
  return urlVotes;
};

var sortByVotes = function(func, arr){
  var picArrayToSort = [];
  var sortedpicArray = [];

  picArrayToSort = func(arr);

  sortedpicArray = picArrayToSort.sort(function(obj1, obj2){
      return obj2[0] - obj1[0];
  });
  return sortedpicArray
};

//display pics by votes
var dipslaySortedPics = function(arrFunc, sortFunc, htmlEl, arr){
  var sortedArr = sortFunc(arrFunc, arr)

  htmlEl.empty();

  for (i = 0; i < sortedArr.length; i++){
    htmlEl.append(`<p>Likes: ${sortedArr[i][0]}</p><img src="${sortedArr[i][1]}">`);
  }
};

// display reused pairs and chosse if both pictures voted or not
var logReused = function(arr){
  var reusedPics = [];

  $('#container_stats').find('.reused_container').remove();

  for (i = 0; i < arr.length; i ++){
    if (arr[i].reused == true && i % 2 == 0){
      if (arr[i].votes == 0 || arr[i + 1].votes == 0){
        $('#like_one').append(`<div class="reused_container">
                                  <img src="${arr[i].url}", class="${arr[i].position}">
                                  <img src="${arr[i + 1].url}", class="${arr[i + 1].position}">
                                  </div>`);
      } else {
        $('#hard_choice').append(`<div class="reused_container">
                                  <img src="${arr[i].url}", class="${arr[i].position}">
                                  <img src="${arr[i + 1].url}", class="${arr[i + 1].position}">
                                  </div>`);
      };
    };
  };
};

var requestPicture = function(sock){
  socket.emit(sock, messageToServer);
};

var chooseOrReuse = function(){
  var reuseOrNot = [];
  reuseOrNot =  Math.random() >= 0.5;
  return reuseOrNot;
};

var pairToReuse = function(arr){
  var reuseIndex1 = [];
  var reuseIndex2 = [];

//random choose which pair to reuse
  reuseIndex1 = Math.floor(Math.random()*arr.length);

  if (reuseIndex1 % 2 == 0){
    reuseIndex2 = reuseIndex1 + 1;
  } else {
    reuseIndex2 = reuseIndex1 - 1;
  };

// if reused the assign value true to reused
  picArray[reuseIndex1].reused = true;
  picArray[reuseIndex2].reused = true;

//display reused pair
  $(`#${arr[reuseIndex1].position}`).find('img').attr( "src", arr[reuseIndex1].url).attr( "id", arr[reuseIndex1].id);
  $(`#${arr[reuseIndex2].position}`).find('img').attr( "src", arr[reuseIndex2].url).attr( "id", arr[reuseIndex2].id);
};

var getNewPicOrReUse = function(arr, reqpic, randFunc, reuseFunc){
  if (arr.length < 6){
//request 2 new pictures
    reqpic('requestPicture1');
    reqpic('requestPicture2');

  } else {
    if(randFunc()){
      reuseFunc(arr);
    } else {
      reqpic('requestPicture1');
      reqpic('requestPicture2');
    };
  };
};

// count votes
votes++;
$('#numberOfVotes').html(votes);

logReuseChoice(picArray, $(this));
voteTime(picArray, $(this));
displayLast5Votes(picArray, $('#last_five_vote'), getLastFive, sortByTime);
dipslaySortedPics(getDataToSort, sortByVotes, $('#sorted_pictures'), picArray);
logReused(picArray);
getNewPicOrReUse(picArray, requestPicture, chooseOrReuse, pairToReuse);

});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});
