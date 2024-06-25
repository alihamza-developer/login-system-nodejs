// Stop All working tracks from stream
function stopTracks(...stream) {
    stream.forEach(item => {
        if (item)
            if (item.getTracks) item.getTracks().forEach(track => track.stop());
    });
}
// Calculate Element Duration
function calculateElDuration(element, duration) {
    return new Promise(async (res, rej) => {
        if (duration === Infinity) {
            element.currentTime = Number.MAX_SAFE_INTEGER;
            element.addEventListener('timeupdate', function () {
                if (this.currentTime === Number.MAX_SAFE_INTEGER) {
                    this.currentTime = 0;
                    rej('Video metadata is not available');
                } else {
                    duration = this.duration;
                    res(duration);
                }
            });
        } else res(duration);
    });
}
// Start Recording Function
async function startRecording(type) {
    // Check if user has mediaDevices
    if (!navigator.mediaDevices) {
        sAlert('Your browser does not support mediaDevices', "error");
        return false;
    }

    // Check if user has audio permission
    let hasAudioAccess = await navigator.permissions.query({ name: 'microphone' }),
        audioAccess = hasAudioAccess.state !== 'denied',
        audioStream = null;

    if (!audioAccess) {
        sAlert("Please allow permission to record audio", "warning");
        return false;
    }

    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (type == 'audio' && audioStream) stream = audioStream;
    else if (type == 'audio' && !audioStream) {
        sAlert("Please allow audio permission to record audio", "warning");
        stopTracks(audioStream);
        return false;
    }

    if (!stream) return false;
    // Start Media Recorder 
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    // Create track name if user click on stop sharing btn
    let trackName = type == "audio" ? "getAudioTracks" : "getVideoTracks";
    // somebody clicked on "Stop sharing"
    stream[trackName]()[0].onended = function () {
        stopTracks(stream);
        stopRecording(type);
    };
    return true;
}


// Stop Recording Function
function stopRecording(type) {
    return new Promise(async (res, rej) => {
        if (!mediaRecorder || !stream) return;

        // Check if is media recorder is recording then stop and stop all tracks
        if (mediaRecorder.state == "recording") {
            mediaRecorder.stop();
            stopTracks(stream)
        }
        // Get Recorded Data
        mediaRecorder.ondataavailable = async function (e) {
            let blob = e.data,
                element = null;
            // Check if type is audio then create audio element
            if (type == 'audio') element = new Audio(URL.createObjectURL(blob));

            // On element loadedmetadata get duration and thumbnail
            element.addEventListener('loadedmetadata', async () => {

                let duration = await calculateElDuration(element, element.duration);
                let file = new File([blob], getRand(10) + ".mp3", { type: "audio/mp3" });
                res({
                    file,
                    duration
                });

            });
            // Check if element has error then reject
            element.onerror = function () {
                rej(type + ' metadata is not available');
            };
        };
    });
}
