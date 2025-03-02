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
