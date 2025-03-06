// Particle System for Audio Visualizer
// This system creates particles, lines, and bubbles that react to audio

// Particle system configuration
const particleSettings = {
    enabled: true,
    type: 'particles', // 'particles', 'lines', 'bubbles', 'mixed'
    count: 100,
    size: 3,
    speed: 1,
    reactivity: 5,
    color: '#ffffff',
    opacity: 0.7,
    fadeSpeed: 0.02,
    connectLines: false,
    lineThreshold: 100,
    colorSync: true // Sync particle colors with visualization colors
};

// Particle class
class Particle {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.reset();
    }
    
    reset() {
        // Position
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        
        // Movement
        this.vx = (Math.random() - 0.5) * this.settings.speed;
        this.vy = (Math.random() - 0.5) * this.settings.speed;
        
        // Appearance
        this.baseSize = Math.random() * this.settings.size + 1;
        this.size = this.baseSize;
        this.color = this.settings.color;
        this.opacity = Math.random() * this.settings.opacity;
        
        // For bubbles
        this.growRate = Math.random() * 0.1 + 0.05;
        this.maxSize = this.baseSize * (Math.random() * 5 + 5);
        this.growing = true;
    }
    
    update(audioLevel, deltaTime = 1) {
        // Apply audio reactivity with frame-rate independence
        const reactivity = audioLevel * (this.settings.reactivity / 10);
        
        // Different behavior based on particle type
        if (this.settings.type === 'particles' || this.settings.type === 'mixed') {
            // Update position with velocity, scaled by deltaTime
            this.x += this.vx * (1 + reactivity) * deltaTime;
            this.y += this.vy * (1 + reactivity) * deltaTime;
            
            // Adjust size based on audio
            this.size = this.baseSize + (reactivity * 5);
            
            // Boundary check - wrap around
            if (this.x < 0) this.x = this.canvas.width;
            if (this.x > this.canvas.width) this.x = 0;
            if (this.y < 0) this.y = this.canvas.height;
            if (this.y > this.canvas.height) this.y = 0;
        } 
        else if (this.settings.type === 'bubbles') {
            // Bubbles grow and shrink, scaled by deltaTime
            if (this.growing) {
                this.size += this.growRate * (1 + reactivity) * deltaTime;
                if (this.size >= this.maxSize) {
                    this.growing = false;
                }
            } else {
                this.size -= this.growRate * deltaTime;
                if (this.size <= this.baseSize) {
                    this.reset();
                }
            }
            
            // Slow upward movement for bubbles
            this.y -= 0.5 * (1 + reactivity) * deltaTime;
            
            // Remove if out of bounds
            if (this.y < -this.size * 2) {
                this.reset();
                this.y = this.canvas.height + this.size;
            }
        }
        
        // Only apply fade effect if reactivity is low
        // This prevents the flashing effect when audio is loud
        if (this.settings.reactivity < 2) {
            this.opacity -= this.settings.fadeSpeed * deltaTime;
            if (this.opacity <= 0.1) {
                this.opacity = this.settings.opacity;
            }
        }
    }
    
    draw(ctx, audioLevel) {
        // Use a stable opacity that doesn't change with audio level
        ctx.globalAlpha = this.opacity;
        
        if (this.settings.type === 'bubbles') {
            // Draw bubble (circle with stroke)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Add highlight to bubble
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        } else {
            // Draw particle (filled circle)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// Particle system manager
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.settings = particleSettings;
        this.audioLevel = 0;
        this.lastFrameTime = 0;
        this.initialize();
    }
    
    initialize() {
        // Create particles
        this.particles = [];
        for (let i = 0; i < this.settings.count; i++) {
            this.particles.push(new Particle(this.canvas, this.settings));
        }
    }
    
    updateAudioLevel(dataArray) {
        // Calculate average audio level from frequency data
        // Optimize by sampling fewer points for large arrays
        let sum = 0;
        const step = dataArray.length > 512 ? Math.floor(dataArray.length / 128) : 1;
        let count = 0;
        
        for (let i = 0; i < dataArray.length; i += step) {
            sum += dataArray[i];
            count++;
        }
        this.audioLevel = sum / (count * 255); // Normalize to 0-1
    }
    
    update(dataArray) {
        if (!this.settings.enabled) return;
        
        // Calculate delta time for frame-rate independent animation
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 16.67; // Normalize to 60fps
        this.lastFrameTime = now;
        
        // Update audio level
        this.updateAudioLevel(dataArray);
        
        // Update each particle
        this.particles.forEach(particle => {
            particle.update(this.audioLevel, deltaTime);
        });
    }
    
    draw() {
        if (!this.settings.enabled) return;
        
        // Use a single draw call for better performance
        this.ctx.save();
        
        // Draw each particle
        this.particles.forEach(particle => {
            particle.draw(this.ctx, this.audioLevel);
        });
        
        // Draw connecting lines if enabled
        if (this.settings.connectLines) {
            this.drawConnectingLines();
        }
        
        this.ctx.restore();
    }
    
    drawConnectingLines() {
        const threshold = this.settings.lineThreshold || 100;
        
        // Optimize line drawing by using a single path
        this.ctx.globalAlpha = 0.2;
        this.ctx.strokeStyle = this.settings.color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // Use spatial partitioning for more efficient neighbor finding
        // This is a simple grid-based approach
        const gridSize = threshold;
        const grid = {};
        
        // Place particles in grid cells
        this.particles.forEach((particle, index) => {
            const cellX = Math.floor(particle.x / gridSize);
            const cellY = Math.floor(particle.y / gridSize);
            const cellKey = `${cellX},${cellY}`;
            
            if (!grid[cellKey]) {
                grid[cellKey] = [];
            }
            grid[cellKey].push(index);
        });
        
        // Check only neighboring cells for connections
        this.particles.forEach((p1, i) => {
            const cellX = Math.floor(p1.x / gridSize);
            const cellY = Math.floor(p1.y / gridSize);
            
            // Check 9 neighboring cells
            for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
                for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
                    const neighborKey = `${nx},${ny}`;
                    const neighbors = grid[neighborKey];
                    
                    if (neighbors) {
                        neighbors.forEach(j => {
                            // Skip if we've already checked this pair or it's the same particle
                            if (j <= i) return;
                            
                            const p2 = this.particles[j];
                            
                            // Calculate distance between particles
                            const dx = p1.x - p2.x;
                            const dy = p1.y - p2.y;
                            const distSquared = dx * dx + dy * dy;
                            
                            // Use squared distance for performance (avoid square root)
                            if (distSquared < threshold * threshold) {
                                // Line opacity based on distance
                                const distance = Math.sqrt(distSquared);
                                const opacity = 1 - (distance / threshold);
                                this.ctx.globalAlpha = opacity * 0.2;
                                
                                this.ctx.moveTo(p1.x, p1.y);
                                this.ctx.lineTo(p2.x, p2.y);
                            }
                        });
                    }
                }
            }
        });
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }
    
    setType(type) {
        this.settings.type = type;
        // Reinitialize particles when type changes
        this.initialize();
    }
    
    setCount(count) {
        this.settings.count = count;
        this.initialize();
    }
    
    setColor(color) {
        this.settings.color = color;
        this.particles.forEach(particle => {
            particle.color = color;
        });
    }
    
    syncWithVisualizerColors(colorMode, barColor, gradientStart, gradientEnd) {
        if (!this.settings.colorSync) return;
        
        if (colorMode === 'solid') {
            this.setColor(barColor);
        } else if (colorMode === 'gradient') {
            // Use the average of gradient colors
            const r1 = parseInt(gradientStart.slice(1, 3), 16);
            const g1 = parseInt(gradientStart.slice(3, 5), 16);
            const b1 = parseInt(gradientStart.slice(5, 7), 16);
            const r2 = parseInt(gradientEnd.slice(1, 3), 16);
            const g2 = parseInt(gradientEnd.slice(3, 5), 16);
            const b2 = parseInt(gradientEnd.slice(5, 7), 16);
            
            const r = Math.floor((r1 + r2) / 2);
            const g = Math.floor((g1 + g2) / 2);
            const b = Math.floor((b1 + b2) / 2);
            
            this.setColor(`rgb(${r}, ${g}, ${b})`);
        } else if (colorMode === 'rainbow') {
            // For rainbow mode, use a cycling color based on time
            const hue = (Date.now() / 50) % 360;
            this.setColor(`hsl(${hue}, 100%, 50%)`);
        }
    }
    
    toggleEnabled() {
        this.settings.enabled = !this.settings.enabled;
        return this.settings.enabled;
    }
}

// Create and export the particle system
let particleSystem = null;

function initParticleSystem(canvas, ctx) {
    particleSystem = new ParticleSystem(canvas, ctx);
    return particleSystem;
}

// Make the particle system available globally
window.particleSystem = particleSystem;
window.initParticleSystem = initParticleSystem; 