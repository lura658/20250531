let video;
let handpose;
let predictions = [];
let gameState = "start";
let correctAnswer = "A";
let startButton = { x: 220, y: 200, w: 200, h: 100 };
let hasStarted = false;

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => console.log("Handpose ready"));
  handpose.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);
  drawHandKeypoints();

  // 互動說明
  drawInstruction();

  if (gameState === "start") {
    drawStartScreen();
    // checkStartButtonTouch(); // 移除這行
  }

  if (gameState === "question") {
    drawQuestion();
    checkAnswer();
  }
}

function drawStartScreen() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("歡迎來到 EduMind Lab", width / 2, 100);

  fill(0, 150, 255);
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 20);
  fill(255);
  textSize(24);
  text("開始遊戲", width / 2, startButton.y + startButton.h / 2);

  fill(255);
  textSize(16);
  text("請按 Enter 鍵開始遊戲", width / 2, startButton.y + startButton.h + 30);
}

// 新增 keyPressed 事件
function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "question";
  }
}

function drawQuestion() {
  fill(255, 230);
  rect(20, 20, width - 40, 100, 20);
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("ADDIE 模型的第一步是什麼？", width / 2, 60);

  fill(0, 100, 255, 180);
  rect(60, 150, 200, 100, 20);
  fill(255);
  text("A. 分析需求", 160, 200);

  fill(0, 200, 100, 180);
  rect(width - 260, 150, 200, 100, 20);
  fill(255);
  text("B. 製作教材", width - 160, 200);
}

function checkAnswer() {
  for (let hand of predictions) {
    if (isOpenHand(hand)) {
      fill(0, 255, 0);
      text("選擇 A", width / 2, 400);
      if (correctAnswer === "A") gameState = "correct";
    } else if (isFist(hand)) {
      fill(0, 255, 0);
      text("選擇 B", width / 2, 400);
      if (correctAnswer === "B") gameState = "correct";
    }
  }
}

// 張開手：五指都伸直
function isOpenHand(hand) {
  let fingers = [
    hand.annotations.thumb,
    hand.annotations.indexFinger,
    hand.annotations.middleFinger,
    hand.annotations.ringFinger,
    hand.annotations.pinky
  ];
  // 指尖y座標比根部高(往上伸直)，閾值放寬
  return fingers.every(f => f[3][1] < f[0][1] - 20);
}

// 握拳：五指都彎曲
function isFist(hand) {
  let fingers = [
    hand.annotations.thumb,
    hand.annotations.indexFinger,
    hand.annotations.middleFinger,
    hand.annotations.ringFinger,
    hand.annotations.pinky
  ];
  // 指尖y座標比根部低(往下彎曲)，閾值放寬
  return fingers.every(f => f[3][1] > f[0][1] + 10);
}

// 顯示所有手勢點點，取消食指紅圈
function drawHandKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const [x, y, z] = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 8, 8);
    }
    // 取消食指紅圈
  }
}

// 說明移到畫布右外側
function drawInstruction() {
  let infoX = width + 20;
  fill(255, 240);
  rect(infoX, 20, 220, 120, 16);
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text(
    "互動說明：\n\n" +
    "- 綠點：偵測到的手部關鍵點\n" +
    "- 張開手：選擇A\n" +
    "- 握拳：選擇B\n" +
    "- 按 Enter 開始遊戲",
    infoX + 10, 30
  );
}
