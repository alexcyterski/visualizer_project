// Global variables
let audioContext;
let analyser;
let source;
let canvas;
let ctx;
let width;
let height;
let statusElement;
let isMobile, isIOS;

// Visualization settings
const settings = {
    visualizationType: 'bars',
    colorMode: 'gradient',
    barColor: '#00ffff',
    gradientStart: '#ff0000',
    gradientEnd: '#0000ff',
    sensitivity: 5,
    smoothing: 0.8,
    barWidth: 0.5,
    barSpacing: 1,
    fftSize: 256,
    frequencyScaling: 'logarithmic',
    bassBoost: 0,
    highBoost: 0,
    mirroredMode: 'mirrored',
    autoScale: true,
    vocalEnhance: 0,
    frequencySeparation: 0
};

// Initialize everything when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');
    statusElement = document.getElementById('status');
    
    // Initialize
    detectMobileDevice();
    initCanvas();
    initControls();
    updateAutoScaleControls();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add touch event handling for visualizations
    canvas.addEventListener('touchstart', handleCanvasTouch);
});

// Device detection function
function detectMobileDevice() {
    isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        document.getElementById('toggleControls').style.display = 'block';
    }
    
    if (isIOS) {
        document.body.classList.add('ios-device');
        // Show iOS-specific instructions
        statusElement.textContent = 'Tap a button to start. iOS requires microphone access.';
    }
    
    return { isMobile, isIOS };
}

// Initialize canvas
function initCanvas() {
    // Set canvas dimensions to match the viewport exactly
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    
    // Force the canvas to take up the full viewport
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
}

// Handle window resize
function handleResize() {
    // Update canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    
    // Reset the visualization to ensure proper scaling
    resetVisualization();
}

// Handle canvas touch events
function handleCanvasTouch(e) {
    e.preventDefault(); // Prevent scrolling when touching the canvas
    
    // Toggle controls on canvas touch for mobile
    const controlPanel = document.getElementById('controlPanel');
    if (isMobile) {
        if (controlPanel.style.display === 'none') {
            controlPanel.style.display = 'block';
            document.getElementById('toggleControls').textContent = '×';
        } else {
            controlPanel.style.display = 'none';
            document.getElementById('toggleControls').textContent = '≡';
        }
    }
}

// Reset visualization
function resetVisualization() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    // If we have an active audio source, restart the visualization
    if (source) {
        // Update analyzer settings
        analyser.fftSize = settings.fftSize;
        analyser.smoothingTimeConstant = settings.smoothing;
        
        // Restart visualization
        visualize();
    }
}

// At the end of the file, add these lines to expose necessary functions
window.resetVisualization = resetVisualization;
window.visualize = visualize; // This will be defined in visualizer.js but needs to be accessible

// Add at the end of the file
function testVisualizerComponents() {
    console.log('Testing visualizer components...');
    
    // Test core components
    console.log('Core settings:', settings);
    console.log('Canvas initialized:', canvas instanceof HTMLCanvasElement);
    
    // Test audio components
    console.log('Audio context available:', typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined');
    
    // Test UI components
    const uiElements = [
        'visualizationType', 'colorMode', 'barColor', 'sensitivity', 
        'smoothing', 'barWidth', 'barSpacing', 'fftSize'
    ];
    
    uiElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`UI element ${id} found:`, element !== null);
    });
    
    console.log('Testing complete');
}

// Expose the test function globally
window.testVisualizerComponents = testVisualizerComponents; 