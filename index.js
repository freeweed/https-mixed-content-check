#!/usr/bin/env node
var Spider = require('node-spider');
var cheerio = require('cheerio')
var argv = require('yargs').argv
var chalk = require('chalk');

var url = argv.url
var delay = argv.delay || 0
var allowDuplicates = argv.allowDuplicates || false
var userAgent = argv.userAgent || 'https-mixed-content-check'
var encode = argv.encode || 'utf8'
//process.exit();
if(!url){
  console.log('no url input!');
  console.log('please use --url https://www.example.com')
  process.exit()
}

if (argv.url.indexOf('https:') == -1) url = 'https://' + url
var goodCount = 0, badCount = 0, errCount = 0, mixedUrl = [];
var spider = new Spider({
    // How many requests can be run in parallel
    concurrent: 5,
    // How long to wait after each request
    delay: delay,
    // A stream to where internal logs are sent, optional
    // logs: process.stderr,
    // Re-visit visited URLs, false by default
    allowDuplicates: allowDuplicates,
    // If `true` all queued handlers will be try-catch'd, errors go to `error` callback
    catchErrors: true,
    // If `true` the spider will set the Referer header automatically on subsequent requests
    addReferrer: false,
    // If `true` adds the X-Requested-With:XMLHttpRequest header
    xhr: false,
    // If `true` adds the Connection:keep-alive header and forever option on request module
    keepAlive: false,
    // Called when there's an error, throw will be used if none is provided
    error: function(err, url) {
      errCount++
//       console.log('error:'+err)
    },
    // Called when there are no more requests
    done: function() {
      var c = parseInt(goodCount+badCount)
      console.log('\nCrawled '+c+' pages')
      console.log(chalk.green(goodCount +' pages are good'))
      console.log(chalk.red(badCount+' pages have mixed HTTP/HTTPS content'))
      if(mixedUrl.length > 0){
          console.log('list of mixed HTTP/HTTPS content')
          for(var i=0;i<mixedUrl.length;i++){
              console.log(i+1+'. '+mixedUrl[i]);
          }
      }
       console.log(errCount+' errors')
      // if (debug) {
      //     console.log(urls.discovered)
      //     console.log(urls.crawled)
      // }
    },

    //- All options are passed to `request` module, for example:
    headers: { 'user-agent': userAgent },
    encoding: encode
});

var makeUrl = function(url){
  if(url.indexOf('https:') == -1 && url.indexOf('http:') == -1){
    if (url.indexOf('//') == -1) url = '/' + url
    if (url.indexOf('https:') == -1) url = 'https:' + url
  }
  return url.replace('✓','&')
}

var addQueue = function(url){
  if(argv.domain){
    if(url.indexOf(argv.domain) > -1){
      spider.queue(makeUrl(url), handleRequest)
    }
  }else{
    spider.queue(makeUrl(url), handleRequest)
  }
}

var handleRequest = function(doc) {
    var bad = false
    $ = cheerio.load(doc.res.body)
    $('img').each(function () {
        if ($(this).attr('src') && !bad) bad = $(this).attr('src').indexOf('http:') > -1
        if ($(this).attr('srcset') && !bad) bad = $(this).attr('srcset').indexOf('http:') > -1
    })
    $('iframe').each(function () {
        if ($(this).attr('src')){
           if(!bad) bad = $(this).attr('src').indexOf('http:') > -1
           addQueue($(this).attr('src'))
        }
    })
    $('script').each(function () {
        if ($(this).attr('src')){
           if(!bad) bad = $(this).attr('src').indexOf('http:') > -1
           addQueue($(this).attr('src'))
         }
    })
    $('object').each(function () {
        if ($(this).attr('data') && !bad){
           if(!bad) bad = $(this).attr('data').indexOf('http:') > -1
           addQueue($(this).attr('data'))
         }
    })
    $('form').each(function () {
        if ($(this).attr('action') && !bad) bad = $(this).attr('action').indexOf('http:') > -1
    })
    $('embed').each(function () {
        if ($(this).attr('src') && !bad) bad = $(this).attr('src').indexOf('http:') > -1
        
    })
    $('video').each(function () {
        if ($(this).attr('src') && !bad) bad = $(this).attr('src').indexOf('http:') > -1
    })
    $('audio').each(function () {
        if ($(this).attr('src') && !bad) bad = $(this).attr('src').indexOf('http:') > -1
    })
    $('source').each(function () {
        if ($(this).attr('src') && !bad) bad = $(this).attr('src').indexOf('http:') > -1
        if ($(this).attr('srcset') && !bad) bad = $(this).attr('srcset').indexOf('http:') > -1
    })
    $('params').each(function () {
        if ($(this).attr('value') && !bad) bad = $(this).attr('value').indexOf('http:') > -1
    })
    $('link').each(function () {
        if ($(this).attr('href')){
          if(!bad) bad = $(this).attr('href').indexOf('http:') > -1
          addQueue($(this).attr('href'))
        }
    })
    $('a').each(function () {
        if ($(this).attr('href')){
          addQueue($(this).attr('href'))
        }
    })
    if (bad) {
        console.log(chalk.red('===> '+doc.url+' has mixed content!'))
        badCount++
        mixedUrl.push(doc.url)
    }
    else {
        console.log(doc.url+' is good!')
        goodCount++
    }
};

addQueue(url);

