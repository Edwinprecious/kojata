# core/urls.py
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve as serve_static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Auth Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # This links to the api/urls.py file we are about to create
    path('api/', include('api.urls')), 
]

# Serves uploaded media files (like product images).
#
# NOTE: Django's `django.conf.urls.static.static()` helper (the usual way to
# do this) silently does nothing when settings.DEBUG is False -- so wrapping
# it in `if settings.DEBUG:` (as this used to be) meant uploaded product
# images returned 404 in production, even though the files were saved to
# MEDIA_ROOT correctly and the API returned a correct-looking URL for them.
#
# We serve media directly via `django.views.static.serve` here so it works
# regardless of DEBUG. This is fine for a small/medium store, but Django's
# docs note it isn't optimized for heavy traffic -- once you outgrow it,
# move media serving to nginx (or a cloud bucket like S3/Cloudflare R2) and
# you can remove this block.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
]