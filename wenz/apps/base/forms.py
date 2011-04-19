from django                 import  forms
from django.forms.util      import  ValidationError

from datetime       import datetime


from dateutil import parser


class ParseDateField(forms.Field):
    def clean(self, value):
        super(ParseDateField, self).clean(value)
        if value in (None, ''):
            return None
        if isinstance(value, datetime):
            return value
        try:
            return parser.parse(value).date()
        except ValueError:
            raise ValidationError(u'Enter a valid date')

class ParseTimeField(forms.Field):
    def clean(self, value):
        super(ParseTimeField, self).clean(value)
        if value in (None, ''):
            return None
        if isinstance(value, datetime):
            return value
        try:
            return parser.parse(value).time()
        except ValueError:
            raise ValidationError(u'Enter a valid date')


MAIL_Choices = (
    ('outlook','Windows'),
    ('ical',   'Apple'),
    ('google', 'Google'),
    ('yahoo','Yahoo')
)

class EventForm(forms.Form):
    title       = forms.CharField   (label = 'Event Title:',
                                     required = False,
                                     )

    date        = ParseDateField    ( label = 'Date:',
                                     )


    start_time  = ParseTimeField   ( label = 'Start Time:',
                                      required = False,
                                   )

    end_time    = ParseTimeField   ( label = 'End Time:',
                                      required = False,
                                   )


    address    = forms.CharField   ( label  = 'Place:',
                                      required = False,
                                      widget = forms.TextInput (attrs ={'name':"address",
                                                                         'size':40
                                                                       }
                                                                )
                                    )

    describe    = forms.CharField   ( label = 'Description:',
                                      required = False,
                                      widget = forms.Textarea(attrs={'cols':40,
                                                                     'rows':3,
                                                                     'id':'describe'
                                                                    }
                                                             )
                                    )

    url         = forms.URLField    ( label = "URL:",
                                      required = False,
                                      widget = forms.TextInput(attrs ={'size':40} )
                                    )

    mail        = forms.ChoiceField ( label = "Mail Choices",
                                      choices=MAIL_Choices,
                                      widget=forms.RadioSelect()
                                    )

class SignOnForm(forms.Form):
    username        = forms.CharField   ( max_length = 45,
                                            widget = forms.TextInput(attrs={'class':'txtBox1','size':24, 'id':'user',
                                            'value':"Email Address",
                                            'onfocus':"if(this.value == 'Email Address')this.value = ''",
                                            'onblur' :"if(this.value == '') this.value = 'Email Address'"}
                                        )
                                        )
    password        = forms.CharField   ( max_length = 45,
                                            label = 'Password',
                                            widget = forms.PasswordInput(attrs={'class':'txtBox1','size':24})
                                        )
class SignUpForm( SignOnForm ):
    confirm        = forms.CharField   ( max_length = 45,
                                            required = False,
                                            label = 'Confirm Password',
                                            widget = forms.PasswordInput(attrs={'class':'txtBox1','size':24})
                                        )
