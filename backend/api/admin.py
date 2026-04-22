from django.contrib import admin
from .models import Product, Category, Order, Review, Event, WebsiteVisit

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Order)
admin.site.register(Review)

# Register the new tracking models
admin.site.register(Event)
admin.site.register(WebsiteVisit)