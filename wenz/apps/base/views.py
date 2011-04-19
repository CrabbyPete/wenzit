from django.http                    import HttpResponse, HttpResponseRedirect
from django.template                import Context, RequestContext, loader
from django.template.loader         import get_template
from django.shortcuts               import render_to_response
from django.core                    import serializers

from django.contrib                 import auth
from django.contrib.auth.models     import User
from django.db.models               import Q
from django.forms.util              import ErrorList

from datetime                       import datetime,date

from icalendar.cal                  import Calendar, Event
from icalendar.prop                 import vGeo, vDatetime
from geo                            import geocode

from forms                          import EventForm, SignOnForm, SignUpForm
from models                         import EventModel, ProfileModel

import urllib
import calendar
import json
import settings


"""
{
    ol:{
        class:'starts-2',
        li:[
            {
                id:'day-1',
                div:{
                    h4:1
                }
            },
            {
                id:'day-2',
                div:{
                    h4:2
                }
            },
            {
                id:'day-3',
                div:{
                    h4:3
                }
            },
            {
                id:'day-4',
                div:{
                    h4:4
                }
            },
            {
                class:'saturday"id="day-5',
                div:{
                    h4:5
                }
            },
            {
                class:'sunday"id="day-6',
                div:{
                    h4:6
                }
            },
"""

def create_calendar(year, month, day):
    today = datetime.today()
    da  = date(year, month, day)
    cal = calendar.Calendar(calendar.SUNDAY).monthdayscalendar(da.year, da.month)


    start = 0
    begin = True
    for week in cal:
        for day in range(len(week)):
            if week[day] == 0:
                start += 1
            else:
                da = date(da.year, da.month, week[day])
                if begin:
                    begin = False
                    html = "<ol class=starts-" + str(start) + ">\n"
                html += '<li '
                if week[day] == today.day and month == today.month:
                    html += "class='today'"
                elif day == 0:
                    html += "class='sunday'"
                elif day == 6:
                    html += "class='saturday'"

                html += "id='day-" +str(week[day])+ "'>"
                ev = EventModel.objects.day_count(da)
                if ev == 0:
                    html += "<div><h4>" + str(week[day])+ "</h4>" + "</div>"
                else:
                    # If you want to use Javascript insert this instead of the next lines
                    # daystr  = "'showEvents(" + str(da.year)+ "," +str(da.month)+ "," + str(da.day) +  ")'"
                    # html += "<div onclick =" + daystr + ">"
                    html += "<div><h4>"+ str(week[day])+ "</h4>"
                    html += "<div id='events'><a href='/base/show?day=" + str(da) + "'>"
                    if ev == 1:
                        html +=  str(ev) + " event</a></div>" + "</div>"
                    else:
                        html +=  str(ev) + " events</a></div>" + "</div>"

    html += "</ol>"
    month = da.strftime('%B %Y')
    return html, month

def home(request):
    today = datetime.today()
    html, month = create_calendar(today.year, today.month, today.day)
    return render_to_response('index.html', {'month':month, 'calendar':html},
                                    context_instance=RequestContext(request))

# This is called from home calendar right and left arrows
def ajax(request):
    day = 1;
    if 'month' in request.GET:
        month = int(request.GET['month'])+ 1 # Months come 0-11
    if 'year' in request.GET:
        year = int(request.GET['year'])

    html, month = create_calendar(year, month, day)
    return HttpResponse(html, mimetype='text/html')

# Show an event
def show(request):

    def submit_form(events):
        return render_to_response('show.html', {'events':events },
                                    context_instance=RequestContext(request))

    if request.method == 'GET':
        if 'day' in request.GET:
            day = request.GET['day']
            dat = datetime.strptime(day,'%Y-%m-%d')
        else:
            dat = datetime.now()

        events = EventModel.objects.filter(date = dat)
        return submit_form(events)



# Show details of an event. This is an ajax call and should only be a GET
def detail(request):
    if request.method == 'GET' and 'pk' in request.GET:
        pk = request.GET['pk']
        event = EventModel.objects.get(pk = pk)
        try:
            owner = EventRelationModel.objects.get( event = event )
        except:
            owner = False

        t = get_template('detail.html')
        c = Context({'event':event, owner:'owner'})
        html = t.render(c)
        return HttpResponse(html, mimetype='text/html')
    else:
        return


# Add a new event
def add(request):

    def submit_form(form):
       return render_to_response('add.html', { 'form':form }, context_instance=RequestContext(request))

    if request.method == 'GET':
        if not request.user.is_authenticated():
            pass # Ask the user if the want to sign on

        data = {}
        if 'url' in request.GET:
            data.update({'url':request.GET['url']})

        day = datetime.today()
        if 'day' in request.GET:
            if request.GET['day'] != "":
                day = request.GET['day'] # Javascript hands you Tue May 20 1990
                data.update({'date': day})
            else:
                data.update({'date': day.strftime('%a %b %d %Y')})
        else:
            data.update({'date': day.strftime('%a %b %d %Y')})

        start_time = datetime.today()
        start_time = start_time.strftime('%H:%M')
        if 'start_time' in request.GET:
            if request.GET['start_time'] != '':
                start_time = request.GET['start_time']

        data.update({'start_time': start_time})

        if 'end_time' in request.GET:
            end_time = request.GET['end_time']
            if end_time != 'null':
                data.update({'end_time': end_time})

        data.update({'mail':'outlook'})

        form = EventForm(data)
        return submit_form(form)

    # Form was returned with data
    if request.method == 'POST':
        form = EventForm(request.POST)
        if not form.is_valid():
            return submit_form(form)

        title       = form.cleaned_data['title']
        date        = form.cleaned_data['date']
        start_time  = form.cleaned_data['start_time']
        end_time    = form.cleaned_data['end_time']
        url         = form.cleaned_data['url']
        describe    = form.cleaned_data['describe']
        address     = form.cleaned_data['address']
        mail        = form.cleaned_data['mail']

        latitude = None
        longitude = None

        if address != u'':
            local = geocode(address)
            if local != None:
                if 'address' in local:
                    address = local['address']

                if 'latitude' in local and 'longitude' in local:
                    latitude  = local['latitude']
                    longitude = local['longitude']

        # If they move the pointer to be more specific override address
        """
        if form.data['lati'] and form.data['lngi']:
            latitude = form.data['lati']
            longitude = form.data['lngi']
        """
        event = EventModel(  title        = title,
                             date         = date,
                             start_time   = start_time,
                             end_time     = end_time,
                             address      = address,
                             longitude    = longitude,
                             latitude     = latitude,
                             description  = describe,
                             url          = url
                          )
        # Save this event
        event.save()

        # Make sure you save the event before connecting it to a user
        if request.user.is_authenticated():
            event.connect(request.user)


        # Ical or Outlook iCal file
        if mail == 'outlook' or mail == 'ical':
            # Create the iCal file
            cal = Calendar()
            cal.add('version', '2.0')
            cal.add('prodid', '-//Microsoft Corporation//Windows Calendar 1.0//EN')
            cal.add('method', 'PUBLISH')

            event = Event()
            event.add('summary', describe)
            if start_time != None:
                dt = datetime.combine(date, start_time)
            else:
                dt = date
            event.add('dtstart', dt)
            event.add('dtstamp', dt)

            if end_time != None:
                de = datetime.combine(date, end_time)
                event.add('dtend', de)

            g = (latitude, latitude)
            event.add('geo', g)
            event.add('location', address)

            uid = date.isoformat() + '@wenzit.net'
            event.add('UID', uid)
            event.add('url', url)
            cal.add_component(event)

            f = open('schedule.ics', 'wb')
            f.write(cal.as_string())
            f.close()

            response = HttpResponse(cal.as_string(), mimetype='text/calendar')
            response['Content-Disposition'] = 'attachment; filename=schedule.ics'

            return response

        # Send the event to google
        elif mail == 'google':
            response = "http://www.google.com/calendar/event?action=TEMPLATE"
            response += "&text=" + urllib.quote_plus(title)

            if start_time != None:
                ds = datetime.combine(date, start_time)
            else:
                ds = date

            if end_time != None:
                de = datetime.combine(date, end_time)
                response += "&dates=" + vDatetime(ds).ical()+ \
                            '/'+vDatetime(de).ical()
            else:
                response += "&dates=" + vDatetime(ds).ical()

            response += "&details=" + urllib.quote_plus(title)
            response += "&location=" + urllib.quote_plus(address)
            response += "&sprop=" + urllib.quote_plus(url)
            return HttpResponseRedirect(response)

        # Send the event to Yahoo
        if mail == 'yahoo':
            response = 'http://calendar.yahoo.com/?v=60'
            response += '&TITLE='+urllib.quote_plus(title)

            ds = datetime.combine(date, start_time)
            if end_time:
                de = datetime.combine(date, end_time)
                dur = de - ds
                hrs, left  = divmod(dur.seconds, 3600)
                mins, secs = divmod(left, 60)
                dur = '%02d%02d' % (hrs, mins)
            else:
                dur = ''

            response += '&ST=' +vDatetime(ds).ical()
            response += '&DUR=' + dur

            response += '&in_loc='+urllib.quote_plus(address)
            response += '&DESC='+urllib.quote_plus(title)
            response += '&URL='+urllib.quote_plus(url)
            return HttpResponseRedirect(response)


def sign_up(request, username = None, password = None):

    def submit_form(form, close):
        c = Context({'form':form, 'close':close})
        return render_to_response('signon.html', c, context_instance=RequestContext(request))

    # If this was a GET, its the first time the form is called
    if request.method == 'GET':
        data = {'username':username,'password':password  }
        form = SignUpForm(data)
        return submit_form(form, False)

    # POST the form was submitted
    form = SignUpForm(request.POST)
    if not form.is_valid():
        return submit_form(form, False)

    username = form.cleaned_data['username']
    password = form.cleaned_data['password']
    confirm  = form.cleaned_data['confirm']
    if password != confirm:
        form._errors['confirm']  = ErrorList(["Passwords are not the same"])
        return submit_form(form, False)

    # Create the user
    if '@' in username:
        email = username
        username = username.replace('.','_')
    else:
        email = username + "@wenzit.net"

    try:
        user  = User.objects.create_user(username=username, email = email, password=password)
    except:
        form._errors['username'] = ErrorList(['This name has already been used'])
        return submit_form(form, False)

    if email != None:
        user.email = email

    user.save()

    # Create profile
    profile = ProfileModel(user = user)
    profile.save()

    user = auth.authenticate(username=user.username, password=password)
    if user is not None and user.is_active:
        auth.login(request, user)
        return submit_form(form, True)
    else:
        form._errors['username']  = ErrorList(["User could not be created"])
        return submit_form(form,False)

def sign_on(request):

    def submit_form(form, close):
        c = Context({'form':form, 'close':close})
        return render_to_response('signon.html', c, context_instance=RequestContext(request))

    # If this was a GET, its the first time the form is called
    if request.method == 'GET':
        form = SignOnForm()
        return submit_form(form, False)

    # POST the form was submitted
    form = SignOnForm(request.POST)
    if not form.is_valid():
        return submit_form(form,False)

    # Get the name and password and login
    username = form.cleaned_data['username']
    password = form.cleaned_data['password']

    if 'signup.x' in request.POST:
        request.method = 'GET'
        return sign_up( request, username, password )

    try:
        user = User.objects.get(Q(username = username)|Q(email = username))
    except User.DoesNotExist:
        form._errors['username']  = ErrorList(["User does not exist or wrong password"])
        return submit_form(form, False)

    user = auth.authenticate(username=user.username, password=password)
    if user is not None and user.is_active:
        auth.login(request, user)
        return home(request)
    else:
        form._errors['username']  = ErrorList(["User does not exist or wrong password"])
        return submit_form(form,False)

def sign_out(request):
    auth.logout(request)
    return HttpResponseRedirect('/')

def about(request):
    return render_to_response('about.html', {}, context_instance=RequestContext(request))

# Allow user to login with Facebook. This will gets call 3 times if the chooses Facebook logon
def facebook( request ):
    user = request.user
    parms = { 'client_id': settings.FACEBOOK['APP_ID'],
              'redirect_uri': settings.SITE_BASE + request.path
            }

    # You will get this from Facebook calling you back
    if 'code' in request.GET:
        parms['client_secret'] = settings.FACEBOOK_APP_SECRET
        parms['code'] = request.GET['code']

        url = 'https://graph.facebook.com/oauth/access_token?' + urllib.urlencode(parms)
        response = cgi.parse_qs( urllib.urlopen(url).read() )

        if 'access_token' in response:
            access_token = response['access_token'][0]
            graph   = GraphAPI( access_token )
            me      = graph.get_object("me")
            picture = graph.request('me',{'fields':'picture'})

            try:
                user = User.objects.get(email = me['email'])
            except User.DoesNotExist:
                password = me['id']
                user  = User.objects.create_user( username = me['name'],
                                                  email    = me['email'],
                                                  password = password
                                                 )

                user.first_name = me[u'first_name']
                user.last_name= me[u'last_name']

                user.save()

                profile = Profile(user = user, facebook_id = me[u'id'])

            else:
                profile = user.get_profile()
                password = profile.facebook_id

            profile.facebook_photo = picture['picture']
            profile.facebook_token = access_token
            profile.save()

            user = auth.authenticate(username = user.username, password = password )
            if user != None and user.is_active:
                auth.login(request, user)

            url = '/'

    # This gets called by the user hitting the Facebook logon button
    else:
        parms['scope'] = 'email,user_location'
        url = "https://graph.facebook.com/oauth/authorize?" + urllib.urlencode(parms)

    return HttpResponseRedirect(url)

def google(request):
    pass


