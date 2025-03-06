// At the beginning of the file, ensure visualize is defined in the global scope
window.visualize = visualize;

// Main visualization function
function visualize() {
    // Get the appropriate buffer length based on the current FFT size
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Clear the ENTIRE canvas/viewport each frame
        // This ensures no leftover bars from previous frames
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Choose visualization type
        switch(settings.visualizationType) {
            case 'bars':
                drawBars(dataArray, bufferLength);
                break;
            case 'wave':
                drawWave(dataArray, bufferLength);
                break;
            case 'circular':
                drawCircular(dataArray, bufferLength);
                break;
            default:
                drawBars(dataArray, bufferLength);
        }
    }
    
    draw();
}

// Draw bar visualization
function drawBars(dataArray, bufferLength) {
    // Get the full viewport width
    const fullViewportWidth = window.innerWidth;
    
    // Determine how many frequency bins we have
    const frequencyBinCount = bufferLength;
    
    // Determine how many bars to display
    let visibleBarCount;
    
    if (settings.autoScale) {
        // For very large FFT sizes, limit the number of bars to keep them visible
        if (frequencyBinCount > 1024) {
            visibleBarCount = 512; // Cap at a reasonable number
        } else if (frequencyBinCount > 512) {
            visibleBarCount = 256;
        } else {
            visibleBarCount = frequencyBinCount;
        }
    } else {
        visibleBarCount = frequencyBinCount;
    }
    
    // Calculate bar dimensions
    let barWidth, barSpacing;
    
    if (settings.autoScale) {
        // Calculate spacing as a percentage of the viewport width
        const spacingRatio = settings.barSpacing / 20; // Smaller ratio for better scaling
        
        // Calculate total width available for bars and spacing
        const totalSpacingWidth = fullViewportWidth * spacingRatio;
        const totalBarWidth = fullViewportWidth - totalSpacingWidth;
        
        // Calculate individual bar width and spacing
        if (visibleBarCount > 1) {
            barWidth = totalBarWidth / visibleBarCount;
            barSpacing = totalSpacingWidth / (visibleBarCount - 1);
        } else {
            barWidth = totalBarWidth;
            barSpacing = 0;
        }
    } else {
        // Use the user-defined settings
        // Calculate bar width based on the total width and number of bars
        const totalWidth = fullViewportWidth;
        // Convert barWidth from 0.1-1 range to a proportion of available space
        barWidth = (totalWidth / visibleBarCount) * settings.barWidth;
        // Use the barSpacing setting directly as pixels between bars
        barSpacing = settings.barSpacing;
    }
    
    // Calculate the vertical center of the screen
    const centerY = height / 2;
    
    // Start drawing from the left edge of the viewport
    let x = 0;
    
    // Calculate the step size if we're not showing all bars
    const step = Math.ceil(frequencyBinCount / visibleBarCount);
    
    // Draw each bar
    for (let i = 0; i < visibleBarCount; i++) {
        // Calculate the actual data index based on step size
        const dataIndex = Math.min(i * step, frequencyBinCount - 1);
        
        // Apply frequency scaling to the index
        let index;
        const normalizedI = i / visibleBarCount;
        
        if (settings.frequencyScaling === 'logarithmic') {
            // Logarithmic scaling (more space for lower frequencies)
            index = Math.floor(Math.pow(normalizedI, 0.5) * frequencyBinCount);
        } else if (settings.frequencyScaling === 'exponential') {
            // Exponential scaling (more space for higher frequencies)
            index = Math.floor(Math.pow(normalizedI, 2) * frequencyBinCount);
        } else {
            // Linear scaling (equal space for all frequencies)
            index = dataIndex;
        }
        
        // Ensure index is within bounds
        index = Math.min(index, frequencyBinCount - 1);
        
        // Get the value and apply frequency-specific adjustments
        let value = dataArray[index];
        
        // Apply bass reduction (for lower third of the spectrum)
        if (i < visibleBarCount / 3) {
            value = Math.max(0, value - (settings.bassBoost / 100) * 255);
        }
        
        // Apply high boost (for upper third of the spectrum)
        if (i > (visibleBarCount * 2) / 3) {
            value = Math.min(255, value + (settings.highBoost / 100) * 255);
        }
        
        // Apply vocal enhancement
        const vocalRangeStart = Math.floor(visibleBarCount * 0.1);
        const vocalRangeEnd = Math.floor(visibleBarCount * 0.3);
        
        if (i >= vocalRangeStart && i <= vocalRangeEnd) {
            value = Math.min(255, value + (settings.vocalEnhance / 100) * 255);
        }
        
        // Apply frequency separation
        if (settings.frequencySeparation > 0) {
            if (i % 2 === 0) {
                value = Math.min(255, value * (1 + settings.frequencySeparation / 200));
            } else {
                value = Math.max(0, value * (1 - settings.frequencySeparation / 200));
            }
        }
        
        // Set color based on color mode
        if (settings.colorMode === 'solid') {
            ctx.fillStyle = settings.barColor;
        } else if (settings.colorMode === 'gradient') {
            const ratio = i / visibleBarCount;
            const r1 = parseInt(settings.gradientStart.slice(1, 3), 16);
            const g1 = parseInt(settings.gradientStart.slice(3, 5), 16);
            const b1 = parseInt(settings.gradientStart.slice(5, 7), 16);
            const r2 = parseInt(settings.gradientEnd.slice(1, 3), 16);
            const g2 = parseInt(settings.gradientEnd.slice(3, 5), 16);
            const b2 = parseInt(settings.gradientEnd.slice(5, 7), 16);
            
            const r = Math.floor(r1 + (r2 - r1) * ratio);
            const g = Math.floor(g1 + (g2 - g1) * ratio);
            const b = Math.floor(b1 + (b2 - b1) * ratio);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        } else if (settings.colorMode === 'rainbow') {
            const hue = (i / visibleBarCount * 360) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        }
        
        // Apply sensitivity and calculate bar height
        const barHeight = value * (settings.sensitivity / 5);
        
        // Draw based on the selected mode
        if (settings.mirroredMode === 'mirrored') {
            // Mirrored mode (center)
            const halfBarHeight = barHeight / 2;
            ctx.fillRect(x, centerY - halfBarHeight, barWidth, halfBarHeight);
            ctx.fillRect(x, centerY, barWidth, halfBarHeight);
        } else if (settings.mirroredMode === 'top') {
            // From top
            ctx.fillRect(x, 0, barWidth, barHeight);
        } else {
            // From bottom (default)
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        }
        
        // Move to next bar position
        x += barWidth + barSpacing;
        
        // If we've gone beyond the viewport width, we can stop drawing
        if (x > fullViewportWidth) break;
    }
}

// Draw waveform visualization
function drawWave(dataArray, bufferLength) {
    analyser.getByteTimeDomainData(dataArray);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = settings.colorMode === 'solid' ? settings.barColor : settings.gradientStart;
    
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

// Draw circular visualization
function drawCircular(dataArray, bufferLength) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    // Determine how many bars to display based on buffer length
    let visibleBarCount;
    
    if (settings.autoScale) {
        // For very large FFT sizes, limit the number of bars to keep them visible
        if (bufferLength > 1024) {
            visibleBarCount = 512;
        } else if (bufferLength > 512) {
            visibleBarCount = 256;
        } else {
            visibleBarCount = bufferLength;
        }
    } else {
        visibleBarCount = bufferLength;
    }
    
    // Calculate the angle step based on visible bar count and spacing
    // Apply spacing by reducing the total angle covered
    const spacingFactor = 1 - (settings.barSpacing / 10); // Convert 0-5 range to a percentage
    const totalAngle = 2 * Math.PI * spacingFactor;
    const angleStep = totalAngle / visibleBarCount;
    
    // Calculate the bar width as a percentage of the angle step
    const barAngleWidth = angleStep * settings.barWidth;
    
    // Calculate the step size if we're not showing all bars
    const step = Math.ceil(bufferLength / visibleBarCount);
    
    for (let i = 0; i < visibleBarCount; i++) {
        // Calculate the actual data index based on step size
        const dataIndex = Math.min(i * step, bufferLength - 1);
        
        // Apply frequency scaling to the index
        let index;
        const normalizedI = i / visibleBarCount;
        
        if (settings.frequencyScaling === 'logarithmic') {
            // Logarithmic scaling (more space for lower frequencies)
            index = Math.floor(Math.pow(normalizedI, 0.5) * bufferLength);
        } else if (settings.frequencyScaling === 'exponential') {
            // Exponential scaling (more space for higher frequencies)
            index = Math.floor(Math.pow(normalizedI, 2) * bufferLength);
        } else {
            // Linear scaling (equal space for all frequencies)
            index = dataIndex;
        }
        
        // Ensure index is within bounds
        index = Math.min(index, bufferLength - 1);
        
        // Get the value and apply frequency-specific adjustments
        let value = dataArray[index];
        
        // Apply bass reduction (for lower third of the spectrum)
        if (i < visibleBarCount / 3) {
            value = Math.max(0, value - (settings.bassBoost / 100) * 255);
        }
        
        // Apply high boost (for upper third of the spectrum)
        if (i > (visibleBarCount * 2) / 3) {
            value = Math.min(255, value + (settings.highBoost / 100) * 255);
        }
        
        // Apply vocal enhancement (for mid-range frequencies where vocals typically sit)
        const vocalRangeStart = Math.floor(visibleBarCount * 0.1);
        const vocalRangeEnd = Math.floor(visibleBarCount * 0.3);

        if (i >= vocalRangeStart && i <= vocalRangeEnd) {
            // Enhance the vocal range
            value = Math.min(255, value + (settings.vocalEnhance / 100) * 255);
        }
        
        // Apply frequency separation to make individual frequencies more distinct
        if (settings.frequencySeparation > 0) {
            // Create a "comb" effect by enhancing every other frequency
            if (i % 2 === 0) {
                value = Math.min(255, value * (1 + settings.frequencySeparation / 200));
            } else {
                value = Math.max(0, value * (1 - settings.frequencySeparation / 200));
            }
        }
        
        // Apply sensitivity
        const barHeight = (value * (settings.sensitivity / 5)) / 256 * radius;
        
        // Calculate angle
        const angle = i * angleStep;
        
        // Set color based on color mode
        if (settings.colorMode === 'solid') {
            ctx.strokeStyle = settings.barColor;
        } else if (settings.colorMode === 'gradient') {
            const ratio = i / visibleBarCount;
            const r1 = parseInt(settings.gradientStart.slice(1, 3), 16);
            const g1 = parseInt(settings.gradientStart.slice(3, 5), 16);
            const b1 = parseInt(settings.gradientStart.slice(5, 7), 16);
            const r2 = parseInt(settings.gradientEnd.slice(1, 3), 16);
            const g2 = parseInt(settings.gradientEnd.slice(3, 5), 16);
            const b2 = parseInt(settings.gradientEnd.slice(5, 7), 16);
            
            const r = Math.floor(r1 + (r2 - r1) * ratio);
            const g = Math.floor(g1 + (g2 - g1) * ratio);
            const b = Math.floor(b1 + (b2 - b1) * ratio);
            
            ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        } else if (settings.colorMode === 'rainbow') {
            const hue = (i / visibleBarCount * 360) % 360;
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        }
        
        // Apply bar width setting to line width
        ctx.lineWidth = Math.max(1, 5 * settings.barWidth);
        
        // Draw line
        ctx.beginPath();
        
        // Use the bar angle width to draw an arc instead of a line for thicker bars
        if (settings.barWidth > 0.3) {
            const halfBarAngle = barAngleWidth / 2;
            const startAngle = angle - halfBarAngle;
            const endAngle = angle + halfBarAngle;
            
            // Draw inner arc
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            
            // Draw outer arc (if there's a value)
            if (barHeight > 0) {
                ctx.arc(centerX, centerY, radius + barHeight, endAngle, startAngle, true);
            }
            
            // Close the path
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
        } else {
            // For thin bars, just draw lines
            const startX = centerX + Math.cos(angle) * radius;
            const startY = centerY + Math.sin(angle) * radius;
            const endX = centerX + Math.cos(angle) * (radius + barHeight);
            const endY = centerY + Math.sin(angle) * (radius + barHeight);
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
} 