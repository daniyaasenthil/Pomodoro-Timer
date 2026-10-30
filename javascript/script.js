let focusTime = 25;
let breakTime = 5;
let longBreakTime = 15;
let timeLeft = 25 * 60;
let mode = "focus";
let completedSessions = 0;
let timer = null;

function loadSettings() {
    let saved = JSON.parse(localStorage.getItem("pomodoroSettings"));

    if (saved) {
        focusTime = saved.focus;
        breakTime = saved.shortBreak;
        longBreakTime = saved.longBreak;

        document.getElementById("focusInput").value = focusTime;
        document.getElementById("breakInput").value = breakTime;
        document.getElementById("longInput").value = longBreakTime;
    }

    let savedCount = localStorage.getItem("completedSessions");

    if (savedCount !== null) {completedSessions = Number(savedCount);}

    updateCount();}

function saveSettings() {
    let focus = Number(document.getElementById("focusInput").value);
    let shortBreak = Number(document.getElementById("breakInput").value);
    let longBreak = Number(document.getElementById("longInput").value);

    if (focus < 1 || focus > 60 ||
        shortBreak < 1 || shortBreak > 60 ||
        longBreak < 1 || longBreak > 60) {

        alert("Enter values between 1 and 60.");
        return false;}

    focusTime = focus;
    breakTime = shortBreak;
    longBreakTime = longBreak;

    let settings = {
        focus: focusTime,
        shortBreak: breakTime,
        longBreak: longBreak};

    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));

    if (timer === null) {resetTimer();}

    return true;}

function updateDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    document.getElementById("timer").textContent =
        minutes + ":" + seconds;}

function updateCount() {
    document.getElementById("count").textContent = completedSessions;}

function startTimer() {
    if (timer !== null) {
        return;
    }

    if (saveSettings() === false) {
        return;
    }

    timer = setInterval(function() {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            sessionComplete();
        }
    }, 1000);}
function pauseTimer() {
    clearInterval(timer);
    timer = null;}

function resetTimer() {
    pauseTimer();

    if (mode === "focus") {
        timeLeft = focusTime * 60;
        document.getElementById("mode").textContent = "FOCUS SESSION";
    }
    else if (mode === "shortBreak") {
        timeLeft = breakTime * 60;
        document.getElementById("mode").textContent = "SHORT BREAK";
    }
    else {
        timeLeft = longBreakTime * 60;
        document.getElementById("mode").textContent = "LONG BREAK";
    }

    updateDisplay();}

function playSound() {
    let audio = new AudioContext();
    let oscillator = audio.createOscillator();

    oscillator.connect(audio.destination);
    oscillator.frequency.value = 800;

    oscillator.start();
    oscillator.stop(audio.currentTime + 1);

    oscillator.onended = function() {
        audio.close();
    };}

function sessionComplete() {
    playSound();

    if (mode === "focus") {
        completedSessions++;

        localStorage.setItem("completedSessions", completedSessions);
        updateCount();

        if (completedSessions % 4 === 0) {
            mode = "longBreak";
        }
        else {
            mode = "shortBreak";
        }
    }
    else {
        mode = "focus";
    }

    resetTimer();}

document.getElementById("focusInput").onchange = saveSettings;
document.getElementById("breakInput").onchange = saveSettings;
document.getElementById("longInput").onchange = saveSettings;

loadSettings();
updateDisplay();
