// Initialize UI controls
function initControls() {
    // Visualization type
    document.getElementById('visualizationType').addEventListener('change', function() {
        const type = this.value;
        settings.visualizationType = type;
        
        // Show/hide mirrored mode control based on visualization type
        const mirroredModeControl = document.getElementById('mirroredModeControl');
        if (type === 'circular' || type === 'wave') {
            mirroredModeControl.classList.add('disabled');
        } else {
            mirroredModeControl.classList.remove('disabled');
        }
        
        // Show/hide auto-scale control based on visualization type
        const autoScaleControl = document.getElementById('autoScaleControl');
        if (type === 'bars') {
            autoScaleControl.style.display = 'block';
        } else {
            autoScaleControl.style.display = 'none';
        }
        
        // Update auto-scale controls visibility
        updateAutoScaleControls();
        
        // Apply the visualization type change
        visualize();
    });
    
    // Color mode
    document.getElementById('colorMode').addEventListener('change', function() {
        settings.colorMode = this.value;
        updateColorControls();
    });
    
    // Bar color
    document.getElementById('barColor').addEventListener('input', function() {
        settings.barColor = this.value;
    });
    
    // Gradient colors
    document.getElementById('gradientStart').addEventListener('input', function() {
        settings.gradientStart = this.value;
    });
    
    document.getElementById('gradientEnd').addEventListener('input', function() {
        settings.gradientEnd = this.value;
    });
    
    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Update the settings
            settings.gradientStart = this.dataset.start;
            settings.gradientEnd = this.dataset.end;
            
            // Update the input elements
            const startInput = document.getElementById('gradientStart');
            const endInput = document.getElementById('gradientEnd');
            if (startInput) startInput.value = settings.gradientStart;
            if (endInput) endInput.value = settings.gradientEnd;
        });
    });
    
    // Sensitivity
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivityValue');
    sensitivitySlider.addEventListener('input', function() {
        settings.sensitivity = parseFloat(this.value);
        sensitivityValue.textContent = this.value;
    });
    
    // Smoothing
    const smoothingSlider = document.getElementById('smoothing');
    const smoothingValue = document.getElementById('smoothingValue');
    smoothingSlider.addEventListener('input', function() {
        settings.smoothing = parseFloat(this.value);
        smoothingValue.textContent = this.value;
        if (analyser) {
            analyser.smoothingTimeConstant = settings.smoothing;
        }
    });
    
    // Bar width
    const barWidthSlider = document.getElementById('barWidth');
    const barWidthValue = document.getElementById('barWidthValue');
    barWidthSlider.addEventListener('input', function() {
        settings.barWidth = parseFloat(this.value);
        barWidthValue.textContent = this.value;
        visualize();
    });
    
    // Bar spacing
    const barSpacingSlider = document.getElementById('barSpacing');
    const barSpacingValue = document.getElementById('barSpacingValue');
    barSpacingSlider.addEventListener('input', function() {
        settings.barSpacing = parseInt(this.value);
        barSpacingValue.textContent = settings.barSpacing;
        visualize();
    });
    
    // FFT size
    document.getElementById('fftSize').addEventListener('change', function() {
        const newSize = parseInt(this.value);
        settings.fftSize = newSize;
        
        if (analyser) {
            // Update the FFT size
            analyser.fftSize = newSize;
            
            // Force a complete redraw and recalculation
            resetVisualization();
        }
    });
    
    // Toggle controls visibility
    const toggleButton = document.getElementById('toggleControls');
    const controlPanel = document.getElementById('controlPanel');
    
    toggleButton.addEventListener('click', function() {
        if (controlPanel.style.display === 'none') {
            controlPanel.style.display = 'block';
            toggleButton.textContent = '×';
        } else {
            controlPanel.style.display = 'none';
            toggleButton.textContent = '≡';
        }
    });
    
    // Show toggle button on mobile or when controls are hidden
    toggleButton.style.display = 'block';
    
    // Update color controls based on selected mode
    updateColorControls();

    // Frequency scaling
    document.getElementById('frequencyScaling').addEventListener('change', function() {
        settings.frequencyScaling = this.value;
    });

    // Bass reduction
    const bassBoostSlider = document.getElementById('bassBoost');
    const bassBoostValue = document.getElementById('bassBoostValue');
    bassBoostSlider.addEventListener('input', function() {
        settings.bassBoost = parseInt(this.value);
        bassBoostValue.textContent = this.value;
    });

    // High boost
    const highBoostSlider = document.getElementById('highBoost');
    const highBoostValue = document.getElementById('highBoostValue');
    highBoostSlider.addEventListener('input', function() {
        settings.highBoost = parseInt(this.value);
        highBoostValue.textContent = this.value;
    });

    // Mirrored mode
    document.getElementById('mirroredMode').addEventListener('change', function() {
        settings.mirroredMode = this.value;
    });

    // Auto-scale option
    document.getElementById('autoScale').addEventListener('change', function() {
        settings.autoScale = this.checked;
        updateAutoScaleControls();
    });

    // Vocal enhancement
    const vocalEnhanceSlider = document.getElementById('vocalEnhance');
    const vocalEnhanceValue = document.getElementById('vocalEnhanceValue');
    vocalEnhanceSlider.addEventListener('input', function() {
        settings.vocalEnhance = parseInt(this.value);
        vocalEnhanceValue.textContent = this.value;
    });

    // Frequency separation
    const frequencySeparationSlider = document.getElementById('frequencySeparation');
    const frequencySeparationValue = document.getElementById('frequencySeparationValue');
    frequencySeparationSlider.addEventListener('input', function() {
        settings.frequencySeparation = parseInt(this.value);
        frequencySeparationValue.textContent = this.value;
    });

    // Background color
    document.getElementById('backgroundColor').addEventListener('input', function() {
        settings.backgroundColor = this.value;
    });

    // Initialize particle system controls if available
    if (typeof particleSystem !== 'undefined') {
        initParticleControls();
    }
}

// Update color controls based on selected mode
function updateColorControls() {
    const solidColorControl = document.getElementById('solidColorControl');
    const gradientControls = document.getElementById('gradientControls');
    
    if (settings.colorMode === 'solid') {
        solidColorControl.style.display = 'block';
        gradientControls.style.display = 'none';
    } else if (settings.colorMode === 'gradient') {
        solidColorControl.style.display = 'none';
        gradientControls.style.display = 'block';
    } else {
        solidColorControl.style.display = 'none';
        gradientControls.style.display = 'none';
    }
}

// Update visualization controls based on visualization type
function updateVisualizationControls() {
    const mirroredModeControl = document.getElementById('mirroredModeControl');
    const autoScaleControl = document.getElementById('autoScaleControl');
    
    // Only show these controls for bar visualization
    if (settings.visualizationType === 'bars') {
        mirroredModeControl.style.display = 'block';
        autoScaleControl.style.display = 'block';
        updateAutoScaleControls();
    } else {
        mirroredModeControl.style.display = 'none';
        autoScaleControl.style.display = 'none';
    }
}

// Update auto-scale controls based on auto-scale setting
function updateAutoScaleControls() {
    const autoScale = document.getElementById('autoScale').checked;
    const visualizationType = document.getElementById('visualizationType').value;
    
    // Bar width control should be available for both bars and circular visualizations
    const barWidthControl = document.getElementById('barWidthControl');
    const barSpacingControl = document.getElementById('barSpacingControl');
    
    // Show/hide auto-scale control based on visualization type
    const autoScaleControl = document.getElementById('autoScaleControl');
    if (visualizationType === 'bars') {
        autoScaleControl.style.display = 'block';
        
        // Bar width and spacing should only be disabled when auto-scale is on
        const shouldDisable = autoScale;
        
        // Update the bar width control
        barWidthControl.classList.toggle('disabled', shouldDisable);
        document.getElementById('barWidth').disabled = shouldDisable;
        
        // Update the bar spacing control
        barSpacingControl.classList.toggle('disabled', shouldDisable);
        document.getElementById('barSpacing').disabled = shouldDisable;
    } else if (visualizationType === 'circular') {
        autoScaleControl.style.display = 'none';
        
        // For circular visualization, always enable bar controls
        barWidthControl.classList.remove('disabled');
        document.getElementById('barWidth').disabled = false;
        barSpacingControl.classList.remove('disabled');
        document.getElementById('barSpacing').disabled = false;
    } else {
        autoScaleControl.style.display = 'none';
        
        // For wave visualization, always disable bar controls
        barWidthControl.classList.add('disabled');
        document.getElementById('barWidth').disabled = true;
        barSpacingControl.classList.add('disabled');
        document.getElementById('barSpacing').disabled = true;
    }
}

// Initialize particle system controls
function initParticleControls() {
    // Toggle particles
    document.getElementById('particlesEnabled').addEventListener('change', function() {
        if (particleSystem) {
            particleSystem.settings.enabled = this.checked;
        }
    });
    
    // Particle type
    document.getElementById('particleType').addEventListener('change', function() {
        if (particleSystem) {
            particleSystem.setType(this.value);
        }
    });
    
    // Particle count
    const particleCountSlider = document.getElementById('particleCount');
    const particleCountValue = document.getElementById('particleCountValue');
    particleCountSlider.addEventListener('input', function() {
        if (particleSystem) {
            const count = parseInt(this.value);
            particleCountValue.textContent = count;
            particleSystem.setCount(count);
        }
    });
    
    // Particle size
    const particleSizeSlider = document.getElementById('particleSize');
    const particleSizeValue = document.getElementById('particleSizeValue');
    particleSizeSlider.addEventListener('input', function() {
        if (particleSystem) {
            particleSystem.settings.size = parseFloat(this.value);
            particleSizeValue.textContent = this.value;
            // Update size for all existing particles
            particleSystem.particles.forEach(particle => {
                particle.baseSize = Math.random() * particleSystem.settings.size + 1;
                particle.size = particle.baseSize;
            });
        }
    });
    
    // Particle speed
    const particleSpeedSlider = document.getElementById('particleSpeed');
    const particleSpeedValue = document.getElementById('particleSpeedValue');
    particleSpeedSlider.addEventListener('input', function() {
        if (particleSystem) {
            particleSystem.settings.speed = parseFloat(this.value);
            particleSpeedValue.textContent = this.value;
            // Update speed for all existing particles
            particleSystem.particles.forEach(particle => {
                particle.vx = (Math.random() - 0.5) * particleSystem.settings.speed;
                particle.vy = (Math.random() - 0.5) * particleSystem.settings.speed;
            });
        }
    });
    
    // Particle reactivity
    const particleReactivitySlider = document.getElementById('particleReactivity');
    const particleReactivityValue = document.getElementById('particleReactivityValue');
    particleReactivitySlider.addEventListener('input', function() {
        if (particleSystem) {
            particleSystem.settings.reactivity = parseFloat(this.value);
            particleReactivityValue.textContent = this.value;
        }
    });
    
    // Particle color
    document.getElementById('particleColor').addEventListener('input', function() {
        if (particleSystem) {
            particleSystem.setColor(this.value);
        }
    });
    
    // Color sync
    document.getElementById('particleColorSync').addEventListener('change', function() {
        if (particleSystem) {
            particleSystem.settings.colorSync = this.checked;
            
            // If turning off color sync, set particles back to the color picker value
            if (!this.checked) {
                const colorPicker = document.getElementById('particleColor');
                particleSystem.setColor(colorPicker.value);
            }
        }
    });
    
    // Connect lines
    document.getElementById('connectLines').addEventListener('change', function() {
        if (particleSystem) {
            particleSystem.settings.connectLines = this.checked;
        }
    });
}

// Wrap initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // The existing initControls() function will be called from visualizer-core.js
    // This is just a safety check
    if (typeof initControls === 'function' && 
        document.getElementById('visualizationType')) {
        console.log('UI controls initialized');
    }
}); 