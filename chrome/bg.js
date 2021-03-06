// バックグラウンドで動く 通信用
// JSONを読み込む
function loadJSON(str, cb, suggest) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      cb(JSON.parse(xhr.responseText));
    }
  };
  
  var url;
  //if (suggest) {
    //url = "http://nicotools.com/nicosearch/mysqli.php?p&inp=";//サジェスト用
  //} else {
    url = "http://nicotools.com/nicosearch/mysqli.php?inp=";//関連タグ用
  //}
  xhr.open("GET", url + encodeURI(str), false);
  xhr.send();
}

function loadJSON2(str, cb, suggest) {
	var ws = new WebSocket("ws://nicotools.com:3000");
	ws.onopen = function() {
	  ws.send(str);
	}
	ws.onmessage = function(message) {
		//console.log(message.data);
		cb(JSON.parse(message.data));
	}
	ws.onerror = function(error) {
		loadJSON(str, cb, suggest);
	}
}

function loadNewTabSetting(str, cb, suggest) {
  var data = localStorage.getItem("newTab1");
  cb(data);
}

// chromeのメッセージに登録
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
//chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
  if (req.name === "loadJSON") {
    loadJSON(req.str, sendResponse, true);
  }
  //else if (req.name ==="loadJSON2") {
    //loadJSON2(req.str, sendResponse, true);
  //}
  //else if (req.name === "loadRelateJSON") {
    //loadJSON(req.str, sendResponse, false);//拡張
  //}
  else if (req.name === "loadNewTabSetting") {
    loadNewTabSetting(req.str, sendResponse, false);
  } else {
    sendResponse("!!!!!failed!!!!!");
  }
});

//定数
const watch_page = "http://www.nicovideo.jp/watch/";
const search_page = "http://www.nicovideo.jp/search/";

//ここからomnibox拡張
//入力時
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
  var buff = "";
  var buffArray = null;
  for (var i = 0, j = 0, c = text.length; i < c; i++) {
	if (text[i] === " " || text[i] === "　") {
	    if (buffArray === null)
		buffArray = new Array();
	    buffArray[j] = buff;
	    j++;
	    buff = "";
	}
	else
	    buff += text[i];
  }

    //console.log('inputChanged: ' + text);
    loadJSON(buff, function(arr) {
        if (arr === [] || arr === false)
            return;
        
        var su = new Array(arr.length);
        
	if (buffArray === null) {
            for (var i = 0, c = arr.length; i < c; i++)
                su[i] = {content: arr[i], description: "検索：" + arr[i]}
        }
	else {
	    var buff = "";
	    for (var i = 0, c = buffArray.length; i < c; i++)
		buff += buffArray[i] + " ";

	    for (var i = 0, c = arr.length; i < c; i++)
		su[i] = {content: buff + arr[i], description: "検索：" + buff + arr[i]}	
	}
        suggest(su);
    }, false, buffArray);
  });

//エンター押下
chrome.omnibox.onInputEntered.addListener(
  function(text) {
  if (localStorage.getItem("newTab") === "true")
	chrome.tabs.create({url: movieIdDetect(text)}, null);
  else {
    chrome.tabs.getCurrent(function(tab) {
        var url = movieIdDetect(text);
        chrome.tabs.update(null, {url: url});
    });
  }
 });

function movieIdDetect(text) {
    var pattern = /(sm|so|nm|nl)(\d{1,})/;
    var result = pattern.test(text);
    var url;
    if (result) {
        url = watch_page + text;
    } else {
        url = search_page + encodeURI(text);
    }

    return url;
}

function contextOnClick(info, tab) {
  //console.log("item " + info.menuItemId + " was clicked");
  //console.log("info: " + JSON.stringify(info));
  //console.log("tab: " + JSON.stringify(tab));

    if (localStorage.getItem("newTab") === "true")
	chrome.tabs.create({url: movieIdDetect(info.selectionText)}, null);
    else {  
	chrome.tabs.getCurrent(function(tab) {
	var url = movieIdDetect(info.selectionText);
	chrome.tabs.update(null, {url: url});
    });
  }
}

// Create one test item for each context type.
var contexts = ["selection"];
for (var i = 0, c = contexts.length; i < c; i++) {
  var context = contexts[i];
  //var title = context + "をニコニコ動画で検索";
  var title = "選択した単語をニコニコ動画で検索";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": contextOnClick});
  //console.log("'" + context + "' item:" + id);
}

//chrome.browserAction.onClicked.addListener(function(tab) {
    //chrome.tab.getCurrent(function(tab) {
    //    chrome.tab.update(null, {url: "http://nicotools.com/nicosearch/"});
    //});
    //chrome.tabs.executeScript(null, {code:"window.open('http://nicotools.com/nicosearch/', '_self');"});
//});

