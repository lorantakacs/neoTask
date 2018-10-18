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

  for (p = 0; p < picArray.length; p++){
    var clickTime = 0;

    clickTime = new Date().getTime();

    if (picArray[p].id == $(this).attr('id') && picArray[p].reused == true){
        if (p % 2 == 0){
            if (picArray[p].voteTime - clickTime < picArray[p + 1].voteTime - clickTime){
              console.log('different vote');
            } else {
              console.log('same vote');
            };
        } else {
          if (picArray[p].voteTime - clickTime < picArray[p - 1].voteTime - clickTime){
            console.log('different vote');
          } else {
            console.log('same vote');
          };
        };
    };
  };

// count votes
  votes++;
  $('#numberOfVotes').html(votes);

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

voteTime(picArray, $(this));

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

displayLast5Votes(picArray, $('#last_five_vote'), getLastFive, sortByTime);

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

dipslaySortedPics(getDataToSort, sortByVotes, $('#sorted_pictures'), picArray);

// display reused pairs and chosse if both pictures voted or not
  var reusedPics = [];

  $('#container_stats').find('.reused_container').remove();

  for (k = 0; k < picArray.length;k ++){
    if (picArray[k].reused == true && k % 2 == 0){
      if (picArray[k].votes == 0 || picArray[k + 1].votes == 0){
        $('#like_one').append(`<div class="reused_container">
                                  <img src="${picArray[k].url}", class="${picArray[k].position}">
                                  <img src="${picArray[k + 1].url}", class="${picArray[k + 1].position}">
                                  </div>`);

      } else {
        $('#hard_choice').append(`<div class="reused_container">
                                  <img src="${picArray[k].url}", class="${picArray[k].position}">
                                  <img src="${picArray[k + 1].url}", class="${picArray[k + 1].position}">
                                  </div>`);

      };
    };
  };

// send request for server and later decide if reuse pictures
  if (picArray.length < 22){
//request 2 new pictures
    socket.emit('requestPicture1', messageToServer);
    socket.emit('requestPicture2', messageToServer);

  } else {

//choose to reuse pairs or not
    var reuseOrNot = [];
    reuseOrNot =  Math.random() >= 0.5;

    if(reuseOrNot){
      var reuseIndex1 = [];
      var reuseIndex2 = [];

//random choose which pair to reuse
      reuseIndex1 = Math.floor(Math.random()*picArray.length);

      if (reuseIndex1 % 2 == 0){
        reuseIndex2 = reuseIndex1 + 1;

      } else {
        reuseIndex2 = reuseIndex1 - 1;

      };

// if reused the assign value true to reused
      picArray[reuseIndex1].reused = true;
      picArray[reuseIndex2].reused = true;

//display reused pair
      $(`#${picArray[reuseIndex1].position}`).find('img').attr( "src", picArray[reuseIndex1].url).attr( "id", picArray[reuseIndex1].id);
      $(`#${picArray[reuseIndex2].position}`).find('img').attr( "src", picArray[reuseIndex2].url).attr( "id", picArray[reuseIndex2].id);

    } else {

//request 2 new pictures
      socket.emit('requestPicture1', messageToServer);
      socket.emit('requestPicture2', messageToServer);
    };
  };
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});
