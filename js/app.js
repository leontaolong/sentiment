'use strict';

var _EMOTIONS = ["positive", "negative", "anger", "anticipation",
  "disgust", "fear", "joy", "sadness", "surprise", "trust"];

var _SEARCHBUTTON = document.getElementById("searchButton");
_SEARCHBUTTON.addEventListener("click", function () { search(document.getElementById("searchBox").value) });
// when clicked, call function search(value)

// load the sample data once page opened
loadTweets("data/tweets.json");

// takes in a string and returns an array of meaningful words
function extractWords(string) {
  return string.toLowerCase().split(/\W+/).filter(moreThanOneWord);
}

// return false if word has one or fewer character
function moreThanOneWord(word) {
  return word.length > 1;
}

// takes in an array of words
// categorizes the words and puts them into specific emotion
// returns the object (key: emotions, values: words with that emotion)
function findSentimentWords(wordList) {
  var result = createNewFrameWk();
  wordList.forEach(function (eachWord) {
    _EMOTIONS.forEach(function (emotion) {
      if (_SENTIMENTS[eachWord] !== undefined &&
        _SENTIMENTS[eachWord][emotion] !== undefined)
        result[emotion].push(eachWord);
    });
  });
  return result;
}

// creates a basic framework for fufure use
// which contains an object: keys are the ten emotion and values are empty arrays
function createNewFrameWk() {
  var result = {};
  _EMOTIONS.forEach(function (emotion) {
    result[emotion] = [];
  });
  return result;
}

// takes in the a raw tweet data file
// returns an object, whose keys are the ten emotions, values are an array with three elements
// [0]: the percentage of words with certain emotion across all tweets, 
// [1]: array of top 3 words,  [2]: array of top 3 hashtags 
function analyzeTweets(tweetData) {
  var tweets = [];
  var totalWords = 0;
  var dictionary = createNewFrameWk();
  var wordCounter = createNewFrameWk();
  var result = createNewFrameWk();
  // for each tweet, constructs and pushes each tweet object (key: emotion, value: array of words)
  // counts words in each tweet
  tweetData.forEach(function (eachTweet) {
    tweets.push(findSentimentWords(extractWords(eachTweet.text)));
    totalWords += extractWords(eachTweet.text).length;
  });
  tweets.forEach(function (eachTweet) {
    Object.keys(eachTweet).forEach(function (eachEmotion) {
      eachTweet[eachEmotion].forEach(function (eachWord) {
        dictionary[eachEmotion].push(eachWord);
      });
      wordCounter[eachEmotion] = dictionary[eachEmotion].length;
    });
  });
  // push percentage, top 3 words, and top 3 hashtages into the array of the big result object
  Object.keys(dictionary).forEach(function (emotion) {
    var condensedDic = countDuplicates(dictionary[emotion]);
    result[emotion].push(wordCounter[emotion] / totalWords);
    result[emotion].push(condensedDic);
    result[emotion].push(identifyHashtags(tweets, emotion, tweetData));
  });
  return result;
}

// takes in an array of words
// counts and reduces the duplicate words, sorts them, and returns the new array  
function countDuplicates(arr) {
  var countDup = arr.reduce(function (prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
  }, {});
  var wordsSorted = Object.keys(countDup).sort(function (a, b) {
    return countDup[b] - countDup[a];
  });
  if (wordsSorted.length > 3)
    wordsSorted = wordsSorted.slice(0, 3);
  return wordsSorted;
}

// takes in each tweet object, each emotion, and raw tweet data
// returns top 3 hashtags for each emotion across all tweets
function identifyHashtags(tweets, emotion, tweetData) {
  var result = [];
  for (var i = 0; i < tweets.length; i++) {
    if (tweets[i][emotion].length != 0 && tweetData[i].entities.hashtags.length != 0) {
      tweetData[i].entities.hashtags.forEach(function (eachHashtag) {
        result.push(eachHashtag.text);
      });
    }
  }
  result = countDuplicates(result);
  return result;
}

// displays the tweet data in a table by creating each cell and row
function showStatistics(tweetData) {
  // remove the previous table
  var remove = document.querySelector('tbody');
  while (remove.firstChild) {
    remove.removeChild(remove.firstChild);
  }
  Object.keys(tweetData).forEach(function (eachEmotion) {
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var cellText = document.createTextNode(eachEmotion);
    cell.appendChild(cellText);
    row.appendChild(cell);               // append the emotions to the first cells
    tweetData[eachEmotion].forEach(function (eachElement) {
      var cell = document.createElement("td");
      // first element of the array, which are the percentages 
      if (tweetData[eachEmotion].indexOf(eachElement) === 0) {
        var cellText = document.createTextNode((eachElement * 100).toFixed(2) + "%");
      } else {
        // third element of the array, which are the hashtags 
        if (tweetData[eachEmotion].indexOf(eachElement) === 2) {
          eachElement = eachElement.map(function (elem) {
            return "#" + elem;
          })
        }
        var wordNode = eachElement.join(', ');
        var cellText = document.createTextNode(wordNode);
      }
      cell.appendChild(cellText);
      row.appendChild(cell)
    });
    document.querySelector("tbody").appendChild(row);
  });
}

// takes in an url, requests an json file and run the program to load the tweets data
function loadTweets(urlOfJson) {
  fetch(urlOfJson)
    .then(
    function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      response.json().then(function (data) {
        showStatistics(analyzeTweets(data));
      });
    })
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    });
}

// takes in the twitter username and forms an url to get the data and load the tweets data
function search(userName) {
  if (userName !== undefined) {
    var link = "https://faculty.washington.edu/joelross/proxy/twitter/timeline/?screen_name=" + userName + "&count=100";
    loadTweets(link);
  }
}





