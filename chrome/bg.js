// バックグラウンドで動く 通信用
// JSONを読み込む
function loadJSON(str, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      cb(JSON.parse(xhr.responseText));
    }
  };
  xhr.open("GET", "http://nicotools.com/nicosearch/mysqli.php?inp=" + encodeURI(str), true);
  xhr.send();
}

// chromeのメッセージに登録
chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
  if (req.name == "loadJSON") {
    loadJSON(req.str, sendResponse);
  } else {
    sendResponse("!!!!!failed!!!!!");
  }
});
