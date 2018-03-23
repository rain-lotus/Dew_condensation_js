//http://gimmicklog.main.jp/jquery/278/

$(function () {
    var h = $(window).height();

    $('.main').css('display', 'none');
    $('#loader-bg ,#loader').height(h).css('display', 'block');
});

$(window).on('load', function () {
    $('#loader-bg').delay(900).fadeOut(800);
    $('#loader').delay(600).fadeOut(300);
    $('.main').css('display', 'block');
});

//BGM
// var audio;
// var audioName;
//
// window.onload = function () {
//     audioName = "img/月の記憶.mp3";
//     playBGM();
// };
//
// function pauseAudio() {
//     audio.pause();
//     document.getElementById('musicName').innerHTML = "&nbsp;蛛懈ｭ｢荳ｭ";
// }
//
// function stopAudio() {
//     audio.pause();
//     audio.currentTime = 0;
//     document.getElementById('musicName').innerHTML = "";
//     document.getElementById('progress').innerHTML = "";
// }
//
// function playBGM() {
//     audio = new Audio(audioName);
//     audio.play();
//     console.log("bgm");
// }