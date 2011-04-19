from django.conf.urls.defaults import *

urlpatterns = patterns('base.views',
    url(r'^$',          'home'      , name='home'       ),
    url(r'^add/$',      'add'       , name='add_event'  ),
    url(r'^signon/$',   'sign_on'   , name='sign_on'    ),
    url(r'^signup/$',   'sign_up'   , name='sign_up'    ),
    url(r'^signout/$',  'sign_out'  , name='sign_out'   ),
    url(r'^ajax/$',     'ajax'      , name='ajax'       ),
    url(r'^show/$',     'show'      , name='show'       ),
    url(r'^detail/$',   'detail'    , name='detail'     ),
    url(r'^about/$',    'about'     , name='about'      ),
    url(r'^facebook/$', 'facebook'  , name='facebook'   ),
    url(r'^google/$',   'google'    , name='google'     ),
)
