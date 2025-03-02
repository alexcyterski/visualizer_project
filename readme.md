# Audio Spectrum Visualizer

A web-based audio spectrum visualizer that can capture and visualize both system audio output and microphone input using the Web Audio API.

## Features

- Real-time audio spectrum visualization
- Support for system audio capture (screen audio)
- Fallback to microphone input
- Responsive design that adapts to window size
- Colorful bar graph visualization

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

bash

python manage.py runserver

Then navigate to `http://localhost:8000` in your browser.

## Usage

1. Click the "Capture System Audio" button to visualize system audio output
   - When prompted, select a screen or window to share
   - Make sure to check "Share audio" in the dialog box
   - Note: System audio capture works best in Chrome and Edge browsers

2. If system audio capture doesn't work, click the "Use Microphone (Fallback)" button
   - This will use your device's microphone to capture audio instead

3. The visualization will appear as colorful bars that respond to the audio frequencies

## Browser Compatibility

- **Chrome/Edge**: Full support for both system audio and microphone capture
- **Firefox**: Supports microphone capture; limited support for system audio
- **Safari**: Supports microphone capture; system audio capture not supported

## Troubleshooting

- **No visualization appears**: Make sure audio is playing on your system
- **Permission errors**: Ensure you've granted the necessary permissions in your browser
- **System audio not working**: Make sure to check "Share audio" when prompted

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
4. Rendering the frequency data as colorful bars on an HTML canvas

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