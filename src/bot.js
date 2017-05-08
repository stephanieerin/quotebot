'use strict'
// Dependencies =========================
const Twit = require('twit')
const ura = require('unique-random-array')
const config = require('./config')
const strings = require('./helpers/strings')
const sentiment = require('./helpers/sentiment')

const Twitter = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
})

// Frequency
const retweetFrequency = config.twitter.retweet
const username = config.twitter.username

// RANDOM QUERY STRING  =========================

let qs = ura(strings.queryString)
let qsSq = ura(strings.queryStringSubQuery)
let rt = ura(strings.resultType)
let rs = ura(strings.responseString)
let tweetStart = ura(strings.retweetOptions)

// https://dev.twitter.com/rest/reference/get/search/tweets
// A UTF-8, URL-encoded search query of 500 characters maximum, including operators.
// Queries may additionally be limited by complexity.

// RETWEET BOT ==========================

// find latest tweet according the query 'q' in params

// result_type: options, mixed, recent, popular
// * mixed : Include both popular and real time results in the response.
// * recent : return only the most recent results in the response
// * popular : return only the most popular results in the response.

let retweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'en'
  }

  Twitter.get('search/tweets', params, function (err, data) {
    if (!err) { // if there no errors
      //try {
        // grab ID of tweet to retweet
        // run sentiment check ==========
        var retweetId = data.statuses[0].id_str
        
        var url = "https://twitter.com/realDonaldTrump/status/" + retweetId
        
        var retweetText = data.statuses[0].text

      //   // setup http call
      //   var httpCall = sentiment.init()
      //   console.log(httpCall)

      //   httpCall.send('txt=' + retweetText).end(function (result) {
      //     console.log(result.body)
      //     console.log(result.body.result)
      //     var sentim = result.body.result.sentiment
      //     var confidence = parseFloat(result.body.result.confidence)
      //     console.log(confidence, sentim)
      //     // if sentiment is Negative and the confidence is above 75%
      //     if (sentim === 'Negative' && confidence >= 75) {
      //       console.log('RETWEET NEG NEG NEG', sentim, retweetText)
      //       return
      //     }
      //   })
      // } catch (e) {
      //   console.log('retweetId DERP!', e.message, 'Query String:', paramQS)
      //   return
      // }
      var status = tweetStart() + url
      var dupe = null
      console.log(status)
            // Tell TWITTER to retweet
      Twitter.get('search/tweets', {
        q: encodeURI('from:StephErin713')
      }, function (err, response) {
        if (response) {
          for (var i = response.statuses.length - 1; i >= 0; i--) {
            console.log(response)
            console.log("quoted_status_id_str: " + response.statuses[i].quoted_status_id_str)
            console.log("retweetId: " + retweetId)
            
            if (response.statuses[i].quoted_status_id_str &&
                parseInt(response.statuses[i].quoted_status_id_str) === parseInt(retweetId)) {
                  dupe = true
            } 
          }
          
          console.log(dupe)
          
          if (!dupe){
            Twitter.post('statuses/update', {
              status: status
            }, function (err, response) {
              if (response) {
                console.log('RETWEETED!', ' ID:', retweetId)
              }
                      // if there was an error while tweeting
              if (err) {
                console.log('DUPLICATE TWEET!', err)
              }
            })
          }
          
        }
        
        if (err) {
          console.log("Trouble Searching!!! ", err)
        }
      })      
      
      
      
    } else { console.log('Something went wrong while SEARCHING...') }
  })
}

// retweet on bot start
retweet()
// retweet in every x minutes
setInterval(retweet, 1000 * 60 * retweetFrequency)

// function to generate a random tweet tweet
function ranDom (arr) {
  var index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

function paramBls () {
  var ret = ''
  var arr = strings.blockedStrings
  var i
  var n
  for (i = 0, n = arr.length; i < n; i++) {
    ret += ' -' + arr[i]
  }
  return ret
}
