// Create a reusable modal system
function createPaginatedModal(title, pages) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content
    let modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="close">&times;</span>
                <h2>${title}</h2>
            </div>
            
            <div class="modal-pages">
    `;
    
    // Add each page
    pages.forEach((page, index) => {
        modalContent += `
            <div class="modal-page ${index === 0 ? 'active' : ''}" data-page="${index}">
                <h3 class="modal-page-title">${page.title}</h3>
                ${page.content}
            </div>
        `;
    });
    
    // Add pagination dots
    modalContent += `
            </div>
            
            <div class="modal-pagination">
    `;
    
    pages.forEach((_, index) => {
        modalContent += `
            <div class="page-dot ${index === 0 ? 'active' : ''}" data-page="${index}"></div>
        `;
    });
    
    modalContent += `
            </div>
        </div>
        
        <div class="modal-footer">
            <div class="left-buttons">
                <!-- Action buttons will be added here dynamically -->
            </div>
            <div class="nav-buttons">
                <button class="prev-button secondary" ${pages.length > 1 ? '' : 'style="display:none"'}>Previous</button>
                <button class="next-button" ${pages.length > 1 ? '' : 'style="display:none"'}>Next</button>
            </div>
        </div>
    </div>
    `;
    
    // Add modal to body
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close');
    const prevBtn = modal.querySelector('.prev-button');
    const nextBtn = modal.querySelector('.next-button');
    const pageDots = modal.querySelectorAll('.page-dot');
    
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Function to show a specific page
    function showPage(pageNum) {
        const pages = modal.querySelectorAll('.modal-page');
        
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        pages[pageNum].classList.add('active');
        
        // Update pagination dots
        pageDots.forEach(dot => {
            dot.classList.remove('active');
        });
        pageDots[pageNum].classList.add('active');
        
        // Update button states
        prevBtn.disabled = pageNum === 0;
        nextBtn.disabled = pageNum === pages.length - 1;
        
        // Change button appearance based on state
        if (pageNum === 0) {
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.style.opacity = '1';
        }
        
        if (pageNum === pages.length - 1) {
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.style.opacity = '1';
        }
    }
    
    // Add navigation event listeners
    let currentPage = 0;
    
    prevBtn.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            showPage(currentPage);
        }
    });
    
    // Add pagination dot event listeners
    pageDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentPage = index;
            showPage(currentPage);
        });
    });
    
    // Make the modal object available
    return modal;
}

// Function to show iOS-specific help modal
function showIOSHelpModal() {
    const pages = [
        {
            title: "iOS Audio Setup",
            content: `
                <p>On iOS devices, you'll need to:</p>
                <ol>
                    <li>Allow microphone access when prompted</li>
                    <li>Use the microphone option for best results</li>
                    <li>Make sure your device is not on silent mode</li>
                    <li>For external audio, place the microphone near your speakers</li>
                </ol>
                <p>Note: iOS has limitations on audio capture. The microphone method works best.</p>
                
                <div class="action-buttons">
                    <button id="try-mic-again" style="background-color: #4CAF50; padding: 12px 24px; font-size: 16px;">Try Microphone Again</button>
                </div>
            `
        }
    ];
    
    const modal = createPaginatedModal("iOS Audio Setup", pages);
    
    setTimeout(() => {
        const tryAgainBtn = modal.querySelector('#try-mic-again');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.getElementById('micButton').click();
            });
        }
    }, 100);
}

// Function to show troubleshooting modal
function showTroubleshootingModal() {
    const pages = [
        {
            title: "Audio Troubleshooting",
            content: `
                <p>Common issues with audio capture:</p>
                <ul>
                    <li><strong>No audio detected:</strong> Make sure you checked "Share audio" in the dialog</li>
                    <li><strong>Permission denied:</strong> Try refreshing the page and granting permission</li>
                    <li><strong>Audio not working:</strong> Try a different browser or device</li>
                </ul>
                
                <div class="action-buttons">
                    <button id="try-mic-button" style="background-color: #2196F3;">Try Microphone Instead</button>
                    <button id="retry-button" style="background-color: #4CAF50;">Try Again</button>
                </div>
            `
        }
    ];
    
    const modal = createPaginatedModal("Audio Troubleshooting", pages);
    
    setTimeout(() => {
        const tryMicBtn = modal.querySelector('#try-mic-button');
        if (tryMicBtn) {
            tryMicBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.getElementById('micButton').click();
            });
        }
        
        const retryBtn = modal.querySelector('#retry-button');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.getElementById('externalAudioButton').click();
            });
        }
    }, 100);
}

// Function to show external audio instructions with start button
function showExternalAudioInstructionsWithStartButton() {
    const pages = [
        {
            title: "Basic Setup",
            content: `
                <p>To visualize audio from external applications like Spotify:</p>
                <ol>
                    <li>On the next screen, select <strong>"Entire Screen"</strong> (not a specific window)</li>
                    <li>Make sure to check <strong>"Share audio"</strong> in the dialog box</li>
                    <li>Play audio in your application (Spotify, iTunes, etc.)</li>
                    <li>Return to this browser tab to see the visualization</li>
                </ol>
                
                <p style="margin-top: 20px;">Select your operating system for specific setup instructions:</p>
                <div class="os-buttons">
                    <button id="windows-setup-btn">Windows Setup</button>
                    <button id="mac-setup-btn">Mac Setup</button>
                    <button id="linux-setup-btn">Linux Setup</button>
                </div>
                
                <div class="action-buttons">
                    <button id="startCaptureButton" style="background-color: #4CAF50; padding: 12px 24px; font-size: 16px;">Start Audio Capture</button>
                </div>
            `
        },
        {
            title: "Chrome/Edge Troubleshooting",
            content: `
                <p>If you don't see the "Share audio" option:</p>
                <ol>
                    <li>First select "Chrome Tab" in the sharing dialog</li>
                    <li>Then click "Share" without selecting any tab</li>
                    <li>In the next dialog, select "Entire Screen" and check "Share audio"</li>
                </ol>
                <p>If you see "To share audio, use a tab instead":</p>
                <ol>
                    <li>Try the above workaround</li>
                    <li>Make sure you're using the latest browser version</li>
                    <li>Some systems may require additional setup (see OS-specific pages)</li>
                </ol>
                
                <div class="action-buttons">
                    <button id="startCaptureButton2" style="background-color: #4CAF50; padding: 12px 24px; font-size: 16px;">Start Audio Capture</button>
                </div>
            `
        },
        {
            title: "Windows Setup",
            content: `
                <h3>Enable Stereo Mix</h3>
                <ol>
                    <li>Right-click the speaker icon in the taskbar</li>
                    <li>Select "Sounds" → "Recording" tab</li>
                    <li>Right-click in the empty area and check "Show Disabled Devices"</li>
                    <li>Right-click "Stereo Mix" and select "Enable"</li>
                    <li>Set it as the default device</li>
                </ol>
                
                <h3>If Stereo Mix is not available</h3>
                <ol>
                    <li>Update your audio drivers from your PC or sound card manufacturer</li>
                    <li>Use a virtual audio cable software:
                        <ul>
                            <li><a href="https://vb-audio.com/Cable/" target="_blank">VB-Cable</a> (free)</li>
                            <li><a href="https://www.voicemeeter.com/" target="_blank">Voicemeeter</a> (free)</li>
                        </ul>
                    </li>
                </ol>
                
                <div class="action-buttons">
                    <button id="startCaptureButton3" style="background-color: #4CAF50; padding: 12px 24px; font-size: 16px;">Start Audio Capture</button>
                </div>
            `
        }
    ];
    
    const modal = createPaginatedModal("External Audio Setup", pages);
    
    // Add event listeners for action buttons
    setTimeout(() => {
        const startBtns = modal.querySelectorAll('[id^="startCaptureButton"]');
        startBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.body.removeChild(modal);
                startExternalAudioCapture();
            });
        });
        
        // OS-specific buttons
        const windowsBtn = modal.querySelector('#windows-setup-btn');
        const macBtn = modal.querySelector('#mac-setup-btn');
        const linuxBtn = modal.querySelector('#linux-setup-btn');
        
        if (windowsBtn) {
            windowsBtn.addEventListener('click', function() {
                showPage(2); // Show Windows page
            });
        }
        
        if (macBtn) {
            macBtn.addEventListener('click', function() {
                showOSSpecificInstructions('Mac');
            });
        }
        
        if (linuxBtn) {
            linuxBtn.addEventListener('click', function() {
                showOSSpecificInstructions('Linux');
            });
        }
    }, 100);
    
    // Helper function to navigate to a specific page
    function showPage(pageNum) {
        const pageDots = modal.querySelectorAll('.page-dot');
        if (pageDots[pageNum]) {
            pageDots[pageNum].click();
        }
    }
    
    // Shows OS-specific instructions in a separate modal
    function showOSSpecificInstructions(os) {
        let content = '';
        let title = '';
        
        if (os === 'Mac') {
            title = 'Mac Setup';
            content = `
                <p>macOS doesn't natively support system audio capture. You have two options:</p>
                <ol>
                    <li>Use a virtual audio routing tool:
                        <ul>
                            <li><a href="https://rogueamoeba.com/loopback/" target="_blank">Loopback</a> (paid)</li>
                            <li><a href="https://existential.audio/blackhole/" target="_blank">BlackHole</a> (free)</li>
                        </ul>
                    </li>
                    <li>Install the <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Screen Capturing</a> extension for Chrome</li>
                </ol>
                <p>After setting up audio routing, select the virtual audio device as your system output.</p>
                
                <div class="action-buttons">
                    <button id="close-os-modal" style="background-color: #555;">Go Back</button>
                    <button id="start-capture-os" style="background-color: #4CAF50;">Start Audio Capture</button>
                </div>
            `;
        } else if (os === 'Linux') {
            title = 'Linux Setup';
            content = `
                <h3>Audio Capture Setup for Linux</h3>
                <ol>
                    <li>Install the necessary packages:
                        <code>sudo apt install pulseaudio pavucontrol alsa-utils</code>
                    </li>
                    <li>Open a terminal and load the ALSA loopback module:
                        <code>sudo modprobe snd-aloop</code>
                    </li>
                    <li>Open PulseAudio Volume Control:
                        <code>pavucontrol</code>
                    </li>
                    <li>Go to the "Playback" tab and ensure your audio application is playing audio.</li>
                    <li>Set the output to "Loopback Analog Stereo".</li>
                    <li>Now click the "Start Audio Capture" button below.</li>
                </ol>
                
                <div class="action-buttons">
                    <button id="close-os-modal" style="background-color: #555;">Go Back</button>
                    <button id="start-capture-os" style="background-color: #4CAF50;">Start Audio Capture</button>
                </div>
            `;
        }
        
        const osModal = createPaginatedModal(title, [{title: title, content: content}]);
        
        // Add event listeners for the OS-specific modal
        setTimeout(() => {
            const backBtn = osModal.querySelector('#close-os-modal');
            const startBtn = osModal.querySelector('#start-capture-os');
            
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    document.body.removeChild(osModal);
                });
            }
            
            if (startBtn) {
                startBtn.addEventListener('click', function() {
                    document.body.removeChild(osModal);
                    document.body.removeChild(modal);
                    startExternalAudioCapture();
                });
            }
        }, 100);
    }
}

// At the end of the file, add these lines to expose modal functions
window.showIOSHelpModal = showIOSHelpModal;
window.showTroubleshootingModal = showTroubleshootingModal;
window.createPaginatedModal = createPaginatedModal;
window.showExternalAudioInstructionsWithStartButton = showExternalAudioInstructionsWithStartButton; 