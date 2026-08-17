// ==========================================
// ELEMENTS
// ==========================================

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("output");

const canvasCtx =
    canvas.getContext("2d");


const cameraStatus =
    document.getElementById("camera-status");

const statusText =
    document.getElementById("status");

const countdownText =
    document.getElementById("countdown");


const playerChoice =
    document.getElementById("player-choice");

const aiChoice =
    document.getElementById("ai-choice");


const resultText =
    document.getElementById("result");


const playerScoreText =
    document.getElementById("player-score");

const aiScoreText =
    document.getElementById("ai-score");

const drawScoreText =
    document.getElementById("draw-score");


const startButton =
    document.getElementById("start-button");

const autoButton =
    document.getElementById("auto-button");

const resetButton =
    document.getElementById("reset-button");


// IMPORTANT:
// This is the YOU vs AI box container.

const movesContainer =
    document.querySelector(".moves");


// ==========================================
// GAME VARIABLES
// ==========================================

let playerScore = 0;

let aiScore = 0;

let drawScore = 0;


let gameStarted = false;

let roundInProgress = false;

let roundReady = false;


let lockedAIMove = null;


let autoMode = false;


// ==========================================
// MEDIAPIPE HANDS
// ==========================================

const hands = new Hands({

    locateFile: (file) => {

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

    }

});


hands.setOptions({

    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence: 0.6,

    minTrackingConfidence: 0.6

});


// ==========================================
// HAND RESULTS
// ==========================================

hands.onResults((results) => {

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    canvasCtx.save();

    canvasCtx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Draw camera

    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ======================================
    // HAND DETECTED
    // ======================================

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks =
            results.multiHandLandmarks[0];


        // Draw hand connections

        drawConnectors(
            canvasCtx,
            landmarks,
            HAND_CONNECTIONS,
            {
                color: "#818cf8",
                lineWidth: 3
            }
        );


        // Draw hand points

        drawLandmarks(
            canvasCtx,
            landmarks,
            {
                color: "#ffffff",
                lineWidth: 1,
                radius: 4
            }
        );


        // Detect gesture

        const gesture =
            detectGesture(landmarks);


        if (
            gesture !== "UNKNOWN"
        ) {

            cameraStatus.textContent =
                "✋ Detected: " + gesture;

        }


        // Play round

        if (
            gameStarted &&
            roundReady &&
            !roundInProgress &&
            gesture !== "UNKNOWN"
        ) {

            playRound(gesture);

        }

    }

    else {

        cameraStatus.textContent =
            "📷 Show your hand";

    }


    canvasCtx.restore();

});


// ==========================================
// DETECT GESTURE
// ==========================================

function detectGesture(landmarks) {

    const indexOpen =
        landmarks[8].y <
        landmarks[6].y;


    const middleOpen =
        landmarks[12].y <
        landmarks[10].y;


    const ringOpen =
        landmarks[16].y <
        landmarks[14].y;


    const pinkyOpen =
        landmarks[20].y <
        landmarks[18].y;


    // PAPER

    if (
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen
    ) {

        return "PAPER";

    }


    // SCISSORS

    if (
        indexOpen &&
        middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {

        return "SCISSORS";

    }


    // ROCK

    if (
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {

        return "ROCK";

    }


    return "UNKNOWN";

}


// ==========================================
// PLAY / NEXT ROUND
// ==========================================

startButton.addEventListener(
    "click",
    handleStartButton
);


function handleStartButton() {

    // FIRST ROUND

    if (!gameStarted) {

        gameStarted = true;

        startButton.disabled = true;

        startButton.textContent =
            "Round Starting...";

        prepareRound();

        return;

    }


    // NEXT ROUND

    if (
        gameStarted &&
        !roundInProgress &&
        !roundReady
    ) {

        startButton.disabled = true;

        startButton.textContent =
            "Round Starting...";

        prepareRound();

    }

}


// ==========================================
// PREPARE ROUND
// ==========================================

function prepareRound() {

    roundReady = false;

    roundInProgress = false;


    // AI chooses its move FIRST

    lockedAIMove =
        randomMove();


    console.log(
        "🔒 AI MOVE LOCKED:",
        lockedAIMove
    );


    // Reset displayed moves

    playerChoice.textContent =
        "❔";

    aiChoice.textContent =
        "🔒";


    // IMPORTANT:
    // Hide YOU vs AI boxes during countdown.

    movesContainer.classList.remove(
        "show"
    );


    resultText.textContent =
        "";


    statusText.textContent =
        "🔒 AI MOVE LOCKED";


    cameraStatus.textContent =
        "AI has locked its move";


    countdown();

}


// ==========================================
// COUNTDOWN
// ==========================================

function countdown() {

    let count = 3;


    countdownText.textContent =
        count;


    const timer =
        setInterval(() => {

            count--;


            if (count > 0) {

                countdownText.textContent =
                    count;

            }

            else {

                clearInterval(timer);


                countdownText.textContent =
                    "SHOW!";


                statusText.textContent =
                    "✋ SHOW YOUR HAND";


                cameraStatus.textContent =
                    "✋ Make Rock, Paper or Scissors";


                roundReady = true;

            }

        }, 1000);

}


// ==========================================
// PLAY ROUND
// ==========================================

function playRound(playerMove) {

    if (!roundReady) {

        return;

    }


    if (roundInProgress) {

        return;

    }


    roundInProgress = true;

    roundReady = false;


    // --------------------------------------
    // PLAYER MOVE
    // --------------------------------------

    playerChoice.textContent =
        getEmoji(playerMove);


    // --------------------------------------
    // AI MOVE
    // --------------------------------------

    aiChoice.textContent =
        getEmoji(lockedAIMove);


    // --------------------------------------
    // SHOW YOU VS AI BOXES
    // --------------------------------------

    movesContainer.classList.add(
        "show"
    );


    // --------------------------------------
    // FIND WINNER
    // --------------------------------------

    const result =
        determineWinner(
            playerMove,
            lockedAIMove
        );


    // --------------------------------------
    // RESULT
    // --------------------------------------

    if (
        result === "WIN"
    ) {

        playerScore++;

        resultText.textContent =
            "🎉 YOU WIN!";

    }

    else if (
        result === "LOSS"
    ) {

        aiScore++;

        resultText.textContent =
            "🤖 AI WINS!";

    }

    else {

        drawScore++;

        resultText.textContent =
            "🤝 DRAW!";

    }


    // --------------------------------------
    // SCORE
    // --------------------------------------

    playerScoreText.textContent =
        playerScore;

    aiScoreText.textContent =
        aiScore;

    drawScoreText.textContent =
        drawScore;


    statusText.textContent =
        "ROUND COMPLETE";


    cameraStatus.textContent =
        "Round finished";


    countdownText.textContent =
        "";


    // --------------------------------------
    // AUTO MODE
    // --------------------------------------

    if (autoMode) {

        setTimeout(() => {

            if (gameStarted) {

                prepareRound();

            }

        }, 2000);

    }


    // --------------------------------------
    // MANUAL MODE
    // --------------------------------------

    else {

        setTimeout(() => {

            roundInProgress = false;

            startButton.disabled = false;

            startButton.textContent =
                "🎮 Play Next Round";

            statusText.textContent =
                "READY FOR NEXT ROUND";

            cameraStatus.textContent =
                "Click Play Next Round";

        }, 2000);

    }

}


// ==========================================
// RANDOM AI MOVE
// ==========================================

function randomMove() {

    const moves = [
        "ROCK",
        "PAPER",
        "SCISSORS"
    ];


    const randomIndex =
        Math.floor(
            Math.random() *
            moves.length
        );


    return moves[randomIndex];

}


// ==========================================
// WINNER
// ==========================================

function determineWinner(
    player,
    ai
) {

    if (
        player === ai
    ) {

        return "DRAW";

    }


    if (

        (
            player === "ROCK" &&
            ai === "SCISSORS"
        )

        ||

        (
            player === "PAPER" &&
            ai === "ROCK"
        )

        ||

        (
            player === "SCISSORS" &&
            ai === "PAPER"
        )

    ) {

        return "WIN";

    }


    return "LOSS";

}


// ==========================================
// EMOJI
// ==========================================

function getEmoji(move) {

    if (
        move === "ROCK"
    ) {

        return "✊";

    }


    if (
        move === "PAPER"
    ) {

        return "✋";

    }


    if (
        move === "SCISSORS"
    ) {

        return "✌️";

    }


    return "❔";

}


// ==========================================
// AUTO MODE
// ==========================================

autoButton.addEventListener(
    "click",
    toggleAuto
);


function toggleAuto() {

    autoMode =
        !autoMode;


    if (autoMode) {

        autoButton.textContent =
            "Auto: ON";


        if (
            gameStarted &&
            !roundInProgress
        ) {

            prepareRound();

        }

    }

    else {

        autoButton.textContent =
            "Auto: OFF";

    }

}


// ==========================================
// RESET
// ==========================================

resetButton.addEventListener(
    "click",
    resetGame
);


function resetGame() {

    playerScore = 0;

    aiScore = 0;

    drawScore = 0;


    gameStarted = false;

    roundInProgress = false;

    roundReady = false;


    lockedAIMove = null;


    playerScoreText.textContent =
        "0";

    aiScoreText.textContent =
        "0";

    drawScoreText.textContent =
        "0";


    playerChoice.textContent =
        "❔";

    aiChoice.textContent =
        "🤖";


    countdownText.textContent =
        "";


    // Hide boxes on reset

    movesContainer.classList.remove(
        "show"
    );


    statusText.textContent =
        "CAMERA READY";


    resultText.textContent =
        "Press Play Round to start";


    cameraStatus.textContent =
        "📷 Camera ready";


    startButton.disabled = false;


    startButton.textContent =
        "🎮 Play Round";

}


// ==========================================
// CAMERA
// ==========================================

const camera =
    new Camera(

        video,

        {

            onFrame:
                async () => {

                    await hands.send({
                        image: video
                    });

                },


            width: 640,

            height: 480

        }

    );


camera.start();