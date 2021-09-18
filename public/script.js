let sig = $("#signature");
const can1 = $("#canv");
const can = $("#canv").get(0);
const ctx = can.getContext("2d");

can1.on("mousedown", function () {
    // console.log("mousemove running");
    can1.on("mousemove", draw);
});

can1.on("mouseup", function () {
    // console.log("stop drawing");
    can1.off("mousemove", draw);
    sig.val(can.toDataURL());
});

function draw(e) {
    let currentX = e.clientX;
    let currentY = e.clientY;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "deeppink";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineTo(
        currentX - can.getBoundingClientRect().left,
        currentY - can.getBoundingClientRect().top
    );
    ctx.stroke();
    ctx.closePath();
}

/////// OLD CODE
// var mousePressed = false;
// var lastX, lastY;
// var ctx;

// function InitThis() {
//     ctx = document.getElementById("canv").getContext("2d");

//     $("#canv").mousedown(function (e) {
//         mousePressed = true;
//         Draw(
//             e.pageX - $(this).offset().left,
//             e.pageY - $(this).offset().top,
//             false
//         );
//     });

//     $("#canv").mousemove(function (e) {
//         if (mousePressed) {
//             Draw(
//                 e.pageX - $(this).offset().left,
//                 e.pageY - $(this).offset().top,
//                 true
//             );
//         }
//     });

//     $("#canv").mouseup(function (e) {
//         mousePressed = false;
//     });
//     $("#canv").mouseleave(function (e) {
//         mousePressed = false;
//     });

//     var dataURL = ctx.toDataURL();
//     console.log(dataURL);
// }

// function Draw(x, y, isDown) {
//     if (isDown) {
//         ctx.beginPath();
//         ctx.strokeStyle = $("#selColor").val();
//         ctx.lineWidth = $("#selWidth").val();
//         ctx.lineJoin = "round";
//         ctx.moveTo(lastX, lastY);
//         ctx.lineTo(x, y);
//         ctx.closePath();
//         ctx.stroke();
//     }
//     lastX = x;
//     lastY = y;
// }
// // const dataURL = ctx.toDataURL();
// // console.log("dataURL :>> ", dataURL);

// console.log("ciao io almeno funziono"); // const document = $("#canv");
// console.log("ctx :>> ", ctx);
// // const dataCanvas = document.getElementById("canv").getContext("2d");
