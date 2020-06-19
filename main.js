let audioCtx = null;
let oscillator = null;
let gainNode = null;
let analyser = null;
let audioData = null;

const start = () => {
    const frequency = document.getElementById("frequency").value;
    const gain = document.getElementById("gain").value;
    const type = document.getElementById("type").value;

    if (!audioCtx) audioCtx = new AudioContext();
    
    if (oscillator) oscillator.stop();
    oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = type;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(audioCtx.destination);

    audioData = new Uint8Array(analyser.frequencyBinCount);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    oscillator.connect(analyser);
    oscillator.connect(gainNode);
    oscillator.start(0);
}

const stop = () => {
    if (oscillator) oscillator.stop();
    oscillator = null;
}

window.onload = () => {
    const frequencyElem = document.getElementById("frequency");
    frequencyElem.onchange = () => {
        if (oscillator) oscillator.frequency.value = frequencyElem.value;
        document.getElementById("frequency-display").innerHTML = frequencyElem.value;
    }

    const gainElem = document.getElementById("gain");
    gainElem.onchange = () => {
        if (gainNode) gainNode.gain.setValueAtTime(gainElem.value, audioCtx.currentTime);
        document.getElementById("gain-display").innerHTML = gainElem.value;
    }

    const typeElem = document.getElementById("type");
    typeElem.onchange = () => {
        if (oscillator) oscillator.type = typeElem.value;
    }

    const canvas = document.getElementById("canvas");
    canvas.width = 600;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#f00";
    ctx.fillStyle = "#000";
    ctx.lineWidth = 2;

    const draw = () => {
        requestAnimationFrame(draw);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (analyser && oscillator) {
            ctx.save();
            ctx.translate(0, canvas.height / 2);
            analyser.getByteTimeDomainData(audioData);

            ctx.beginPath();
            ctx.moveTo(0, 0);

            let x = 0;
            for (let i = 0; i < audioData.length; i++) {
                const y = audioData[i] / 128 * canvas.height / 4 - canvas.height / 4;
                ctx.lineTo(x, y);
                x += canvas.width / audioData.length;
            }
            ctx.lineTo(canvas.width, 0);
            ctx.stroke();
            ctx.restore();
        }
    }
    draw();
}