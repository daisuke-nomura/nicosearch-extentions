// ==UserScript==
// @name           nicosearch
// @version        0.1
// @namespace      http://nicotools.com/nicosearch/
// @description    nicosearch
// @include        http://*.nicovideo.jp/
// @include        http://*.nicovideo.jp/*
// ==/UserScript==



(function() {

GM_log("start");

var input         = null;
var inputvalue    = null;
var selected      = null; // 現在選択されている候補
var suggestlength = null; // 現在表示されている候補の数
var page          = null; // ページの種類


function main() {
    // video_top, その他動画関係, 静画など
    input = document.getElementById("bar_search");
    page = "video";
    
    // 全体のトップページ
    if (input == null) {
        page = "top"
        input = document.getElementById("searchWord");
    }
    
    // キーワード検索結果
    if (input == null) {
        page = "keyword";
        input = document.getElementById("search_united");
    }
    
    // 生放送
    if (input == null) {
        page = "live";
        input = document.getElementById("search_target");
    }
    
    // 大百科
    if (input == null) {
        page = "dic";
        input = document.getElementsByName("q")[0];
    }
    
    // 入力欄が無い場合は何もしない
    if (input == null) {
        return;
    }
    
    input.addEventListener("keydown", function(e) {
        if (e.keyCode == 38) {
            updown(true);
            return;
        } else if (e.keyCode == 40) {
            updown(false);
            return;
        }
        inputvalue = input.value;
        loadJSON(input.value, show_suggest);
    }, true);
    
    input.setAttribute("autocomplete", "off");
    
    
    GM_log("end");
    
}

// 生放送でloadが動かない!!!!!!!!!!!!!!!!!!
// ↑ 解決 manifest.jsonでrun_atを指定した 動かなかった原因は不明
// document.body.addEventListener("load", main, true);
// document.body.addEventListener("load", function() {console.log("aljal3j");}, true);
main();


// 読み込み
function loadJSON(str, cb) {
/*
    bg.jsにメッセージ送信
    chrome.extension.sendRequest({name: "loadJSON", str: str}, cb);
    xhr.open("GET", "http://nicotools.com/nicosearch/mysqli.php?inp=" + encodeURI(str), true);
*/
    
    var func = function( obj ){
        cb( JSON.parse(obj.responseText) );
    }
    
    GM_xmlhttpRequest ({
        method: "GET",
        url: "http://nicotools.com/nicosearch/mysqli.php?inp=" + encodeURI(str),
        onload: func
    });
    
}


// 候補表示
function show_suggest(res) {
    // 候補が無い場合は前の結果を残す
    if (res == [] || res == false) {
        return;
    }
    console.log( res );
    selected = null;
    
    var oldElem = document.getElementById("suggestelem");
    if (oldElem != null) {
        document.body.removeChild(oldElem);
    }
    
    if (input.value == "" || all_space(input.value)) {
        return;
    }
    
    var suggestElem = document.createElement("div");
    suggestElem.id             = "suggestelem";
    suggestElem.style.position = "absolute";
    // suggestElem.style.paddingLeft = "3px";
    
    var inputpos = pos(input);
    suggestElem.style.left = "" + (inputpos.left - 3) + "px";
    // suggestElem.style.left = "" + (inputpos.left) + "px";
    suggestElem.style.top = "" + (inputpos.top + input.offsetHeight + 2) + "px";
    
    suggestElem.style.backgroundColor = "#ffffff";
    suggestElem.style.minWidth = "" + input.offsetWidth + "px";
    suggestElem.style.textAlign = "left";
    
    for (var i = 0; i < res.length; i++) {
        var p = document.createElement("p");
        p.style.paddingLeft = "3px";
        
        // p.style.display = "block";
        // クリックした時
        p.addEventListener("click", function(e) {
            input.value = e.target.firstChild.nodeValue;
            document.body.removeChild(document.getElementById("suggestelem"));
            var form = formElem(input);
            // トップページ用
            // if (form.action != "") {
            if (page == "top") {
                var str = "";
                if (form.action.charAt(form.action.length - 1) == "/") {
                    str = "";
                } else {
                    str = "/";
                }
                url = form.action + str + encodeURI(input.value);
                document.location = url;
                return;
            }
            // 静画用
            if (document.location.host == "seiga.nicovideo.jp") {
                document.getElementById("search_button").click();
                return;
            }
            // 動画関係のページやその他用
            form.submit();
            /*var evt = document.createEvent("UIEvents");
            evt.initUIEvent("keypress", true, true, window, 0);
            evt.keyCode = 13;
            evt.charCode = 13;
            input.dispatchEvent(evt);*/
            // できない?
            // あきらめることも考えておく
        }, true);
        // マウスが上に来た時
        p.addEventListener("mouseover", function(e) {
            e.target.style.backgroundColor = "#afeeee";
        }, true);
        // マウスが要素から出た時
        p.addEventListener("mouseout", function(e) {
            e.target.style.backgroundColor = "#ffffff";
        }, true);
        p.appendChild(document.createTextNode(res[i]));
        suggestElem.appendChild(p);
    }
    
    // nicotools.com へのリンク
    var link = document.createElement("a");
    link.href = "http://nicotools.com/";
    link.style.color = "#666666";//"#d3d3d3";
    link.style.fontSize = "50%";
    link.style.float = "right";
    link.appendChild(document.createTextNode("Powered by nicotools.com"));
    suggestElem.appendChild(link);
    document.body.appendChild(suggestElem);
    suggestlength = res.length;
    
}


// 上下が押された時 upがtrueなら上
function updown(up) {
    up = !up;
    var suggestElem = document.getElementById("suggestelem");
    console.log( suggestElem );
    var nextElem = suggestElem.childNodes[selected + 1];
    
    if (selected == null) {
        selected = 0;
    } else if (up) {
        selected += 1;
    } else {
        selected -= 1;
    }
    
    if (selected < 0) {
        selected = suggestlength - 1;
        suggestElem.childNodes[0].style.backgroundColor = "#ffffff";
    } else if (selected >= suggestlength) {
        selected = 0;
    }
    
    if (up && suggestElem.childNodes[selected - 1]) {
        suggestElem.childNodes[selected - 1].style.backgroundColor = "#ffffff";
    } else if (suggestElem.childNodes[selected + 1] && nextElem.tagName != "A") {
        suggestElem.childNodes[selected + 1].style.backgroundColor = "#ffffff";
    }
    
    if (selected != suggestlength - 1) {
        suggestElem.childNodes[suggestlength - 1].style.backgroundColor = "#ffffff";
    }
    
    suggestElem.childNodes[selected].style.backgroundColor = "#afeeee";
    input.value = suggestElem.childNodes[selected].innerHTML;
}


// parentNodeをたどってformになるのを探す submit用
function formElem(elem) {
    if (elem.tagName == "FORM") {
        return elem;
    } else {
        return formElem(elem.parentNode);
    }
}


// 位置を取得
function pos(elem) {
    var rect = elem.getBoundingClientRect();
    var scrolltop = document.body.scrollTop;
    var scrollleft = document.body.scrollLeft;
    return {left: rect.left + scrollleft, top: rect.top + scrolltop};
}


// strが全て空白ならtrue
function all_space(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) != " ") {
            return false;
        }
    }
    return true;
}


// 違う場所をクリックしたらサジェストを消す
document.body.addEventListener("click", function(e) {
    x = e.x;
    y = e.y;
    var suggestElem = document.getElementById("suggestelem");
    if (suggestElem == null) {
        return;
    }
    var rect = suggestElem.getBoundingClientRect();
    if (!(x > rect.left && y > rect.top && x < rect.right && y < rect.bottom)) {
        document.body.removeChild(suggestElem);
    }
}, true);


})();