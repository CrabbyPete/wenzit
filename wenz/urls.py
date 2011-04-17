from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$','base.views.home', name='home'),
    (r'^base/',     include('base.urls')    ),
    (r'^admin/(.*)', admin.site.root),
)

import os.path
import settings

if settings.DEBUG:
    urlpatterns += patterns('',
					(r'^media/(?P<path>.*)$', 'django.views.static.serve',{'document_root': os.path.join(os.path.dirname(__file__), "media")}),
					)