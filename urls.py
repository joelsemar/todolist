from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib import admin
admin.autodiscover()

from piston.resource import Resource
from piston.authentication import HttpBasicAuthentication

from todolist.mainapp.handlers import TodoItemHandler


itemResource = Resource(handler=TodoItemHandler)



urlpatterns = patterns('todolist.mainapp.views',
    # Example:
     (r'^$', 'home'),
     (r'^login/$', 'login'),
     (r'^logout/$', 'logout'),
     (r'^createUser/$', 'createUser'),
     (r'^category/$', 'newCategory'),
     (r'^category/(?P<categoryID>[\d]+)/items/$', itemResource),
     (r'^items/', 'userItemService'),
)


urlpatterns += patterns('',
       (r'^static/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.MEDIA_ROOT}),
       (r'^admin/doc/', include('django.contrib.admindocs.urls')),
       (r'^admin/', include(admin.site.urls)),
)
