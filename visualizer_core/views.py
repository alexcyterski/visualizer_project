from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import json

# Create your views here.
@ensure_csrf_cookie
def index(request):
    return render(request, 'visualizer_core/index.html')

def update_visualization(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            audio_data = data.get('audioData', [])
            
            # Process the audio data here
            # This is where you would implement your visualization logic
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
