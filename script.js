// ---------- Grab the HTML elements we need ----------
const orbWrap = document.getElementById("orbWrap");
const status = document.getElementById("status");
const chat = document.getElementById("chat");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const clock = document.getElementById("clock");

// ---------- Decorative diagnostic bars (just for visual effect) ----------
const barCpu = document.getElementById("barCpu");
const barMem = document.getElementById("barMem");
const barNet = document.getElementById("barNet");

function randomizeBars() {
    if (!barCpu) return; // panels might not exist on narrow screens' DOM state, but they do - safe check anyway
    barCpu.style.width = (20 + Math.random() * 50) + "%";
    barMem.style.width = (30 + Math.random() * 40) + "%";
    barNet.style.width = (10 + Math.random() * 70) + "%";
}
setInterval(randomizeBars, 1800);
randomizeBars();

// ---------- Uptime: real time since this page was opened ----------
const uptimeReadout = document.getElementById("uptimeReadout");
const startTime = Date.now();

function updateUptime() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    uptimeReadout.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateUptime, 1000);
updateUptime();

// ---------- Core temp: decorative, just fluctuates slightly ----------
const tempReadout = document.getElementById("tempReadout");

function updateTemp() {
    const temp = (34 + Math.random() * 4).toFixed(1);
    tempReadout.textContent = temp + "°C";
}
setInterval(updateTemp, 2500);
updateTemp();

// ---------- Live clock in the header ----------
function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ---------- Add a message bubble to the chat ----------
function addMessage(text, sender) {
    // sender is either "user" or "jarvis"
    const bubble = document.createElement("div");
    bubble.classList.add("msg", sender);
    bubble.textContent = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}

// ---------- Small helper to switch the HUD state ----------
function setState(active, label) {
    status.textContent = label;
    status.classList.toggle("active", active);
    orbWrap.classList.toggle("active", active);
}

// ---------- What happens when user sends a typed message ----------
sendBtn.addEventListener("click", function () {
    const userText = textInput.value.trim();

    if (userText === "") {
        return; // ignore empty input
    }

    addMessage(userText, "user");
    textInput.value = "";

    // Now we actually call the Python backend (Flask) running on port 5000
    setState(true, "THINKING...");

    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: userText })
    })
        .then(function (response) {
            return response.json(); // convert the server's reply into JS data
        })
        .then(function (data) {
            addMessage(data.reply, "jarvis");
            setState(false, "SYSTEM IDLE");
        })
        .catch(function (error) {
            // this runs if Flask isn't running, or something went wrong
            addMessage("Sorry, I couldn't reach the backend. Is app.py running?", "jarvis");
            setState(false, "SYSTEM IDLE");
            console.error("Fetch error:", error);
        });
});

// ---------- Pressing Enter also sends the message ----------
textInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendBtn.click();
    }
});

// ---------- Mic button: real voice recording using the browser's MediaRecorder ----------
let mediaRecorder = null;
let audioChunks = [];
let listening = false;

micBtn.addEventListener("click", async function () {
    if (!listening) {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.addEventListener("dataavailable", function (event) {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", function () {
                // Once recording stops, package the audio and send it to Flask
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                sendAudioToBackend(audioBlob);

                // Stop the mic stream so the browser mic indicator turns off
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
            });

            mediaRecorder.start();
            listening = true;
            setState(true, "LISTENING...");
            micBtn.textContent = "⏹ Stop";
            micBtn.classList.add("listening");
        } catch (error) {
            console.error("Mic access error:", error);
            addMessage("Sir, I could not access the microphone. Please allow mic permission.", "jarvis");
        }
    } else {
        // Stop recording
        mediaRecorder.stop();
        listening = false;
        setState(true, "PROCESSING...");
        micBtn.textContent = "🎤 Speak";
        micBtn.classList.remove("listening");
    }
});

// ---------- Send the recorded audio to Flask for speech-to-text + AI reply ----------
function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    fetch("http://127.0.0.1:5000/voice", {
        method: "POST",
        body: formData
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.heard) {
                addMessage(data.heard, "user");
            }
            addMessage(data.reply, "jarvis");
            setState(false, "SYSTEM IDLE");
        })
        .catch(function (error) {
            addMessage("Sorry, I couldn't reach the backend for voice processing.", "jarvis");
            setState(false, "SYSTEM IDLE");
            console.error("Voice fetch error:", error);
        });
}

// ---------- Time-based greeting on page load ----------
function greetUser() {
    const now = new Date();
    const hour = now.getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good evening";
    } else {
        greeting = "Good night";
    }

    return `${greeting}, Rajat. All systems online.`;
}

function speakGreeting(message) {
    setState(true, "SPEAKING...");

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = function () {
        setState(false, "SYSTEM IDLE");
    };

    window.speechSynthesis.speak(utterance);
}

// Show the greeting text immediately when the page loads
const greetingMessage = greetUser();
window.addEventListener("load", function () {
    addMessage(greetingMessage, "jarvis");
});

// Browsers block audio until the user interacts with the page at least once.
// So we speak the greeting on the FIRST click anywhere on the page.
let hasSpokenGreeting = false;
document.addEventListener("click", function () {
    if (!hasSpokenGreeting) {
        hasSpokenGreeting = true;
        speakGreeting(greetingMessage);
    }
}, { once: true });
