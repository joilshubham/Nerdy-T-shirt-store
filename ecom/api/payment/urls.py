from rest_framework import routers
from django.urls import path, include

from . import views


urlpatterns = [
    path('start_payment/<str:user_id>/<str:token>/', views.start_payment, name = 'start_payment'),
    path('success/', views.handle_payment_success, name="payment_success"),
]