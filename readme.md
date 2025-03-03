# Audio Spectrum Visualizer

A web-based audio spectrum visualizer that can capture and visualize both system audio output and microphone input using the Web Audio API.

## Features

- Real-time audio spectrum visualization
- Support for system audio capture (screen audio)
- Microphone input support
- Full-screen responsive design
- Multiple visualization types:
  - Bar graph (with mirrored mode options)
  - Waveform
  - Circular
- Advanced frequency analysis:
  - Logarithmic, linear, or exponential frequency scaling
  - Vocal frequency enhancement
  - Bass reduction and high frequency boost
  - Frequency separation for clearer visualization
- Customizable appearance:
  - Multiple color modes (solid, gradient, rainbow)
  - Color presets and custom color selection
  - Adjustable bar width and spacing
  - Auto-scaling to fill the entire screen
- Performance options:
  - Adjustable FFT size (32 to 2048 points)
  - Smoothing control
  - Sensitivity adjustment

## Requirements

- Python 3.6+
- Django 3.0+

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/audio-spectrum-visualizer.git
   cd audio-spectrum-visualizer
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

## Running the Application

Start the development server:

```bash
python manage.py runserver
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Audio Source Selection

1. **Capture System Audio**: Visualize audio from your entire system
   - When prompted, select a screen or window to share
   - Make sure to check "Share audio" in the dialog box
   - Note: System audio capture works best in Chrome and Edge browsers

2. **Use Microphone**: Visualize audio from your microphone
   - This is useful when system audio capture isn't supported or as an alternative input source

3. **Connect to External Audio**: Visualize audio from external applications like Spotify
   - Follow the on-screen instructions to properly set up system audio capture
   - This method captures all system audio, including the external application
   - Works best with Chrome or Edge browsers

### Visualization Controls

- **Visualization Type**: Choose between bars, waveform, or circular visualizations
- **Mirrored Mode** (Bars only): Display bars from bottom, top, or mirrored from center
- **Auto-scale** (Bars only): Automatically scale bars to fill the entire screen width

### Color Settings

- **Color Mode**: Choose between solid color, gradient, or rainbow
- **Bar Color**: Select a custom color for solid mode
- **Gradient Colors**: Choose start and end colors for gradient mode
- **Color Presets**: Quick selection of predefined color schemes

### Animation Settings

- **Sensitivity**: Adjust how responsive the visualization is to audio volume
- **Smoothing**: Control how quickly the visualization responds to changes
- **Bar Width**: Adjust the width of individual bars (when auto-scale is disabled)
- **Bar Spacing**: Control spacing between bars (when auto-scale is disabled)

### Frequency Settings

- **Frequency Scaling**: Choose between logarithmic (natural for human hearing), linear, or exponential scaling
- **Bass Reduction**: Reduce the dominance of bass frequencies
- **High Boost**: Enhance higher frequencies
- **Vocal Enhancement**: Emphasize frequencies in the vocal range
- **Frequency Separation**: Create more distinction between adjacent frequency bands

### FFT Settings

- **FFT Size**: Adjust the resolution of frequency analysis (higher values provide more detail but may impact performance)

## Browser Compatibility

- **Chrome/Edge**: Full support for both system audio and microphone capture
- **Firefox**: Supports microphone capture; limited support for system audio
- **Safari**: Supports microphone capture; system audio capture not supported

## Troubleshooting

- **No visualization appears**: Make sure audio is playing on your system
- **Permission errors**: Ensure you've granted the necessary permissions in your browser
- **System audio not working**: Make sure to check "Share audio" when prompted
- **Visualization looks crowded**: Try reducing the FFT size or enabling auto-scale
- **Bars not filling the screen**: Enable auto-scale in the visualization controls
- **Specific frequencies not visible**: Adjust frequency scaling, separation, and enhancement controls

## Technical Details

This application uses:

- Django for the backend framework
- Web Audio API for audio processing
- HTML5 Canvas for visualization
- JavaScript for real-time audio analysis

The visualization works by:
1. Capturing audio from the selected source (system or microphone)
2. Processing the audio data through an analyzer node
3. Extracting frequency data using Fast Fourier Transform (FFT)
4. Applying various transformations and enhancements to the frequency data
5. Rendering the processed data as visualizations on an HTML canvas

## Project Structure

- `visualizer_core/` - Main Django app containing the visualization logic
  - `templates/` - HTML templates for the web interface
  - `views.py` - Django views that render the templates
  - `urls.py` - URL routing for the application
- `visualizer_project/` - Django project settings and configuration

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.