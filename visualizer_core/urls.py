from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('update_visualization/', views.update_visualization, name='update_visualization'),
]