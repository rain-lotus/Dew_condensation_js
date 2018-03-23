var w = 250;
var h = 250;
var s = 2;
var bafa = 30;

var swi = [];
var alpha = [];
var cnt = [], t = [];

var X, Y, pastX, pastY;

var mode = 0;
var hand_freeze = 0;

var can = document.getElementById("canvas");
var ctx = can.getContext("2d");

(function () {
    init();
    hand_init();
    var canvas = $("#canvas");
    canvas.attr({
        'width': w*s,
        'height': h*s
    });

    canvas.mousedown(function () {
        startDraw(event);
    });
    canvas.mousemove(function (event) {
        draw(event);
    });
    canvas.mouseup(function () {
        endDraw(event);
        hand_freeze = 0;
    });
    setInterval(function () {
        change_alpha();
        if (mouseDown) hand_freeze++;
        if (mode === 2) heat_with_hand(X, Y);
    }, 50);

    $(".yubi").click(function () {
        mode = 0;
    });
    $(".iki").click(function () {
        mode = 1;
    });
    $(".te").click(function () {
        mode = 2;
    });
    $(".reset").click(function () {
        init();
    });
})();

//手のひらの画像の情報を
//取り出して、配列の中に入れる関数です。
var hand = [];
function hand_data() {
    //http://blog.shibayan.jp/entry/20130109/1357740667
    var path = "img/te.png";
    var deferred = $.Deferred();
    var image = new Image();
    image.onload = function () {
        var width = this.width;
        var height = this.height;
        var canvas = document.createElement("canvas");

        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);

        var context = canvas.getContext("2d");
        context.drawImage(this, 0, 0);
        var imageData = context.getImageData(0, 0, width, height);
        deferred.resolve(imageData);
    };
    image.onerror = function () {
        deferred.reject();
    };
    image.src = path;
    return deferred.promise();
}
function hand_init() {
    //手のデータを配列に入れておく
    hand_data().done(function (imageData) {
        var i;
        for (i = 0; i < imageData.data.length / 4; i++) {
            hand[i] = imageData.data[i * 4];
        }
    });
}

//初期化
function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var j;
    for (var i = 0; i < w + bafa; i++) {
        alpha[i] = [];
        swi[i] = [];
        t[i] = [];
        cnt[i] = [];
        for (j = 0; j < h + bafa; j++) {
            alpha[i][j] = 1;
            swi[i][j] = 0;
            t[i][j] = 0;
            cnt[i][j] = 0;
        }
    }
}

//描画
var mouseDown;

function startDraw(event) {
    //押された
    mouseDown = true;
}

function endDraw(event) {
    mouseDown = false;
}

function draw(event) {
    X = parseInt((event.clientX - canvas.offsetLeft) / s) + bafa / 2;
    Y = parseInt((event.clientY - canvas.offsetTop) / s) + bafa / 2;

    // drawfinger 以外もできるようにしないとなあ
    if (mouseDown) Line(pastX, pastY, X, Y);

    //動かしたらリセットする
    if (pastX !== X || pastY !== Y) {
        hand_freeze = 0;
    }

    pastX = X;
    pastY = Y;
}

//ブレゼンハムのアルゴリズムでぐるぐる書かせるの無駄に苦労した
function Line(x1, y1, x2, y2) {
    var dx = Math.abs(x2 - x1);//xの距離
    var dy = Math.abs(y2 - y1);//yの距離
    var e = 0;//誤差

    var y = y1;
    var x = x1;
    var t;

    if (dx > dy) {//yoko
        if (y1 < y2) t = 1;
        else t = -1;

        for (; x != x2; x += (x1 < x2 ? 1 : -1)) {
            e += dy;
            if (e > dx) {
                e -= dx;
                y += t;
            }
            if (mode == 0) draw_finger(x, y);
            else if (mode == 1) draw_breath(x, y);
            else if (mode == 2) draw_hand(x - 15, y - 18, 3);
        }
    } else {
        if (x1 < x2) t = 1;
        else t = -1;
        for (; y != y2; y += (y1 < y2 ? 1 : -1)) {
            e += dx;
            if (e > dy) {
                e -= dy;
                x += t;
            }
            if (mode == 0) draw_finger(x, y);
            else if (mode == 1) draw_breath(x, y);
            else if (mode == 2) draw_hand(x - 15, y - 18, 3);
        }
    }
}

//指で描く
//ポインタの周りをいい感じに円形に取って温度を変える
function draw_finger(X, Y) {
    var i, j, distance;
    for (i = X - 7; i <= X + 7; i++) {
        for (j = Y - 7; j <= Y + 7; j++) {
            distance = Math.sqrt((X - i) * (X - i) + (Y - j) * (Y - j));
            if (distance < 5 && swi[i][j] !== 2 && swi[i][j] !== 3) swi[i][j] = 1;
            if (distance < 4 && swi[i][j] !== 3) swi[i][j] = 2;
            if (distance < 3) swi[i][j] = 3;
        }
    }
}

//息を吹きかける
function draw_breath(X, Y) {
    var i, j, distance;
    for (i = X - 15; i <= X + 15; i++) {
        for (j = Y - 15; j <= Y + 15; j++) {
            distance = Math.sqrt((X - i) * (X - i) + (Y - j) * (Y - j));

            if (distance < 15 && swi[i][j] != 5 && swi[i][j] != 6 && swi[i][j] != 7) swi[i][j] = 4;
            if (distance < 10 && swi[i][j] != 6 && swi[i][j] != 7) swi[i][j] = 5;
            if (distance < 8 && swi[i][j] != 7) swi[i][j] = 6;
            if (distance < 5) swi[i][j] = 7;
        }
    }
}

//手のひらの形にを描写する関数です。
function draw_hand(X, Y, m) {
    var i, j, n;
    for (i = 0; i < 37; i++) {
        for (j = 0; j < 31; j++) {
            n = hand[i * 31 + j];
            if (n === 0) swi[X + j][Y + i] = m;
        }
    }
}

//透明度関数を増減させる関数です。
//切り替え変数が４なら60まで1/フレームずつ増加、5なら…と言うように変えています。
function change_alpha() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    var i,j;
    for (i = bafa/2; i < w + bafa / 2; i++) {
        for (j = bafa/2; j < h + bafa / 2; j++) {
            switch (swi[i][j]) {
                case 0:
                    break;
                case 1:  //デクリメント弱
                    alpha[i][j] -= 0.005;
                    if (alpha[i][j] < 0.65) alpha[i][j] = 0.65;
                    break;
                case 2:  //デクリメント中
                    alpha[i][j] -= 0.05;
                    if (alpha[i][j] < 0.4) alpha[i][j] = 0.4;
                    break;
                case 3:  //デクリメント強
                    alpha[i][j] -= 0.2;
                    if (alpha[i][j] < 0.2) alpha[i][j] = 0.2;
                    break;
                case 4:  //インクリメント弱
                    alpha[i][j] += 0.005;
                    if (alpha[i][j] > 0.4) alpha[i][j] -= 0.005;
                    break;
                case 5:  //インクリメント中の下
                    alpha[i][j] += 0.05;
                    if (alpha[i][j] > 0.65) alpha[i][j] -= 0.05;
                    break;
                case 6:  //インクリメント中の上
                    alpha[i][j] += 0.1;
                    if (alpha[i][j] > 0.85) alpha[i][j] -= 0.1;
                    break;
                case 7:  //インクリメント強
                    alpha[i][j] += 0.15;
                    if (alpha[i][j] > 0.95) alpha[i][j] = 0.95;
                    break;
                //水滴を垂らす判定の関数です。
                //t配列が垂れる加速度でcnt分だけ早くなるようにしています。
                case 20:
                    t[i][j] = t[i][j] + 1 * cnt[i][j];
                    dropping(i, j, t[i][j]);
                    cnt[i][j]++;
                    break;
            }
            //半透明の正方形を敷き詰める
            ctx.fillStyle = "rgba(255,255,255," + alpha[i][j] * 0.75 + ")";
            ctx.fillRect((i - bafa / 2) * s, (j - bafa / 2) * s, s, s);
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fillRect(240, 0, 20, 500);
            drops(i, j);
        }
    }
}

//手の跡を付ける
function heat_with_hand(X, Y) {
    if (hand_freeze >= 30) {
        var i, j;
        for (i = -1; i <= 1; i += 2) {
            for (j = -1; j <= 1; j += 2) {
                draw_hand(X - 15 + i, Y - 18 + j, 5);
            }
        }
        draw_hand(X - 15, Y - 18, 3);
    }
}

// 80000/フレームの確率でそこから水滴が垂れるようにモードを変える関数です。
var rnd_num;
function drops(x, y) {
    rnd_num = parseInt(Math.random() * 40000);
    if (alpha[x][y + 1] >= 0.4 && alpha[x][y] <= 0.2) {
        if (rnd_num === 1000) {
            swi[x][y] = 20;
        }
    }
}

//水滴をたらす垂らす関数です。
function dropping(i, j, d) {
    if (j + d <= h + bafa / 2 + 10) {
        var u;
        for (u = j; u <= j + d; u++) {
            swi[i - 1][u + 1] = 3;
            swi[i][u + 1] = 3;
            swi[i + 1][u + 1] = 3;
        }
    } else {
        cnt[i][j] = 0;
        t[i][j] = 0;
    }
}

