// Initialize audio context
function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            let bufferLength = analyser.frequencyBinCount;
            let dataArray = new Uint8Array(bufferLength);
            
            // iOS requires user interaction to start audio context
            if (isIOS && audioContext.state === 'suspended') {
                document.body.addEventListener('touchstart', function iosTouchStart() {
                    audioContext.resume().then(() => {
                        document.body.removeEventListener('touchstart', iosTouchStart);
                    });
                }, false);
            }
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            statusElement.textContent = 'Error: Audio API not supported in your browser.';
        }
    }
}

// Setup visualization with the provided stream
function setupVisualization(stream) {
    // Disconnect any existing source
    if (source) {
        source.disconnect();
    }
    
    // Create a source node from the stream
    source = audioContext.createMediaStreamSource(stream);
    
    // Connect source to analyzer
    source.connect(analyser);
    
    statusElement.textContent = "Audio connected. Visualizing...";
    
    // Start the visualization
    visualize();
    
    // Log audio tracks for debugging
    console.log("Audio tracks:", stream.getAudioTracks().map(track => ({
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
    })));
}

// System audio capture
async function startSystemAudioCapture() {
    try {
        initAudio();
        statusElement.textContent = "Requesting system audio access...";
        
        // Try to get display media with audio
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,  // Sometimes video needs to be true for audio to work
            audio: true
        });
        
        // Check if we got audio tracks
        if (stream.getAudioTracks().length === 0) {
            statusElement.textContent = "No audio track found. Make sure to check 'Share audio' in the dialog.";
            return;
        }
        
        setupVisualization(stream);
    } catch (error) {
        statusElement.textContent = "Error: " + error.message;
        console.error("Setup error:", error);
    }
}

// Microphone capture
function startMicrophoneCapture() {
    statusElement.textContent = 'Requesting microphone access...';
    
    // For iOS, we need to ensure the audio context is created in response to a user gesture
    if (isIOS) {
        // Create audio context if it doesn't exist
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Force resume the audio context
                audioContext.resume().then(() => {
                    console.log('AudioContext started on iOS');
                }).catch(err => {
                    console.error('Failed to start AudioContext on iOS:', err);
                });
            } catch (e) {
                console.error('Failed to create AudioContext on iOS:', e);
            }
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Show a more visible permission prompt for iOS
        statusElement.innerHTML = '<strong>⚠️ Tap "Allow" when prompted for microphone access</strong>';
    }
    
    // Initialize audio context
    initAudio();
    
    // Use simpler constraints for iOS
    const constraints = isIOS ? {audio: true} : {
        audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    };
    
    // Add a slight delay for iOS to ensure the UI updates before permission prompt
    setTimeout(() => {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                statusElement.textContent = 'Microphone connected!';
                
                // Disconnect any existing source
                if (source) {
                    source.disconnect();
                }
                
                // Connect the microphone to the audio context
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                
                // Start visualization
                visualize();
                
                // Show the toggle controls button
                document.getElementById('toggleControls').style.display = 'block';
            })
            .catch(function(err) {
                console.error('Error accessing microphone:', err);
                statusElement.innerHTML = '<strong>Error: ' + err.message + '</strong>';
                
                if (isIOS) {
                    showIOSHelpModal();
                }
            });
    }, isIOS ? 500 : 0);
}

// Function to start external audio capture
function startExternalAudioCapture() {
    // Update status
    statusElement.textContent = 'Connecting to external audio...';
    
    // Initialize audio context if needed
    initAudio();
    
    // Start system audio capture with explicit audio option
    navigator.mediaDevices.getDisplayMedia({ 
        video: {
            cursor: "always",
            displaySurface: "monitor" // Specifically request the entire screen
        }, 
        audio: {
            // Disable processing to get raw audio
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    })
    .then(function(stream) {
        // Check if the stream has audio tracks
        if (stream.getAudioTracks().length === 0) {
            throw new Error('No audio track found. Make sure you selected "Share system audio" in the dialog.');
        }
        
        // Update status
        statusElement.textContent = 'External audio connected!';
        
        // Disconnect any existing source
        if (source) {
            source.disconnect();
        }
        
        // Connect the stream to the audio context
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Start visualization
        visualize();
        
        // Show the toggle controls button
        document.getElementById('toggleControls').style.display = 'block';
    })
    .catch(function(err) {
        console.error('Error capturing system audio: ' + err);
        statusElement.textContent = 'Error: ' + err.message + '. See troubleshooting for help.';
        
        // Show troubleshooting modal
        showTroubleshootingModal();
    });
}

// Add event listeners for audio buttons
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startButton').addEventListener('click', startSystemAudioCapture);
    document.getElementById('micButton').addEventListener('click', startMicrophoneCapture);
    document.getElementById('externalAudioButton').addEventListener('click', handleExternalAudioButton);
});

// Function to handle external audio button click
function handleExternalAudioButton() {
    if (isIOS) {
        // Show iOS-specific message
        const pages = [
            {
                title: "iOS External Audio",
                content: `
                    <p>iOS doesn't support direct system audio capture. Instead:</p>
                    <ol>
                        <li>Use the microphone option</li>
                        <li>Place your device near the speakers</li>
                        <li>Adjust the volume for best results</li>
                    </ol>
                    
                    <div class="action-buttons">
                        <button id="use-mic-ios" style="background-color: #2196F3; padding: 12px 24px; font-size: 16px;">Use Microphone</button>
                    </div>
                `
            }
        ];
        
        const modal = createPaginatedModal("iOS Audio Capture", pages);
        
        setTimeout(() => {
            const useMicBtn = modal.querySelector('#use-mic-ios');
            if (useMicBtn) {
                useMicBtn.addEventListener('click', function() {
                    document.body.removeChild(modal);
                    document.getElementById('micButton').click();
                });
            }
        }, 100);
    } else {
        // For non-iOS devices, show the regular external audio instructions
        statusElement.textContent = 'Preparing to connect to external audio...';
        showExternalAudioInstructionsWithStartButton();
    }
}

// At the end of the file, add this line to ensure the function is properly referenced
// This ensures the external audio button handler can find the function
window.showExternalAudioInstructionsWithStartButton = showExternalAudioInstructionsWithStartButton; 