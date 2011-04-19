from django.db                  import models
from django.contrib.auth.models import User

class EventModelManger(models.Manager):
    def day_count(self, date):
        qry = self.filter( date = date )
        return qry.count()

class EventModel(models.Model):
    title           = models.CharField(max_length=100)
    date            = models.DateField()
    start_time      = models.TimeField(blank = True, null= True)
    end_time		= models.TimeField(blank = True, null= True)

    address         = models.CharField( max_length=100, blank = True, null= True)
    longitude       = models.CharField( max_length=100, blank = True, null= True)
    latitude        = models.CharField( max_length=100, blank = True, null= True)

    description     = models.TextField(blank = True, null = True )

    url             = models.URLField()
    url_offset      = models.IntegerField(blank = True, null= True)

    clicked         = models.PositiveIntegerField( default=0, editable=False)
    votes           = models.PositiveIntegerField( default=0, editable=True)
    date_added      = models.DateTimeField( auto_now = True )

    objects         = EventModelManger()

    def __unicode__(self):
        return str(self.date)+'-'+ str(self.pk)

    def connect(self,user):
        relate = EventRelationModel()
        relate.event = self
        relate.user = user
        relate.save()
        return relate

class EventRelationModel(models.Model):
    user =  models.ForeignKey( User )
    event = models.ForeignKey( EventModel )

    def __unicode__(self):
        return self.user.username + str(event.date)

class ProfileModel ( models.Model):
    user            = models.ForeignKey(User)
    facebook_id     = models.CharField( max_length=100, blank = True, null= True)
    facebook_token  = models.CharField( max_length=100, blank = True, null= True)
    facebook_photo  = models.URLField(blank = True, null= True)
    google_id       = models.CharField( max_length=100, blank = True, null= True)
    google_token    = models.CharField( max_length=100, blank = True, null= True)


