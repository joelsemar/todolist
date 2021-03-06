import re
import simplejson
import datetime
from piston.handler import BaseHandler
from piston.utils import rc, throttle
from django.core.serializers.json import DateTimeAwareJSONEncoder
from django.http import HttpResponse, HttpResponseRedirect
from todolist.mainapp.models import Category, TodoItem
from todolist import util


class TodoItemHandler(BaseHandler):
    allowed_methods = ('GET', 'PUT', 'DELETE', 'POST')
    model = TodoItem
    exclude = ()

    
    def create(self, request, categoryID):
        now = datetime.datetime.utcnow()
        itemName = request.POST.get('itemName')
        if not all([itemName, categoryID]):
            return HttpResponse("Please provide a category and a name for the new item", status=500)
        
        try:
            category = Category.objects.get(id=categoryID)
        except Category.DoesNotExist:
            return HttpResponse("Oops, an error has occurred, please try again later", status=500)
        
        try:
            todoItem = TodoItem.objects.get(name=itemName, category=category)
            return HttpResponse("You already have that item in that category.", status=500)
        except TodoItem.DoesNotExist:
            pass
        
        todoItem = TodoItem.objects.create(name=itemName,
                                           category=category,
                                           when_created=now,
                                           last_updated=now)
        
        return HttpResponse(simplejson.dumps(util.toDict(todoItem), cls=DateTimeAwareJSONEncoder, indent=4), status=201)

    
    def read(self, request, categoryID):
        if not request.user.is_authenticated():
            return rc.FORBIDDEN
        try:
            category = Category.objects.get(id=categoryID)
    
        except Category.DoesNotExist:
            return HttpResponse("Oops, an error has occurred, please try again later", status=500)
        
        todoItems = TodoItem.objects.filter(category=category)
        response = simplejson.dumps([util.toDict(item) for item in todoItems], cls=DateTimeAwareJSONEncoder, indent=4)
        return HttpResponse(response)


    def update(self, request, categoryID):
        if not request.user.is_authenticated():
            return rc.FORBIDDEN
        try:
            category = Category.objects.get(id=categoryID)
    
        except Category.DoesNotExist:
            return HttpResponse("Oops, an error has occurred, please try again later", status=500)
        
        itemID = request.PUT.get('id')
        try:
            todoItem = TodoItem.objects.get(id=itemID)
        except TodoItem.DoesNotExist:
            return HttpResponse("Oops, an error has occurred, please try again later", status=500)
        
        name = request.PUT.get('itemName')
        description = request.PUT.get('description', '')
        completed = request.PUT.get('completed')
        
        #If they are editing the name, check for dupes
        if name != todoItem.name:
            try:
                TodoItem.objects.get(name=name, category=category)
                return HttpResponse('An item with that name already exists in "%s"' % category.name, status=500)
            except TodoItem.DoesNotExist:
                pass
        
        if not all([name, completed]):
            return HttpResponse("Oops, an error has occurred, please try again later", status=500)
        
        todoItem.name = name
        todoItem.description = description
        todoItem.category = category
        todoItem.completed = util.strToBool(completed)
        todoItem.save()
        return HttpResponse(simplejson.dumps(util.toDict(todoItem), cls=DateTimeAwareJSONEncoder, indent=4))


    def delete(self, request, categoryID):
        pass


