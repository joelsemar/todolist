#General Deps
import datetime
import simplejson

#Django  Deps
from django.core.serializers.json import DateTimeAwareJSONEncoder
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User

#Project specific deps
from todolist.mainapp.models import Category, TodoItem
from todolist.util import toDict
DEFAULT_CATEGORIES = ['Personal', 'Work', 'Miscellaneous'] 

def home(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/login/')
    
    categories = Category.objects.filter(user=request.user)

    responseDict = {'categories':simplejson.dumps([toDict(category) for category in categories],
                                                  cls=DateTimeAwareJSONEncoder, indent=4)}
    
    return render_to_response('home.html', responseDict,  context_instance=RequestContext(request))


def createUser(request):
    assert request.method == 'POST'
    username = request.POST.get('username')
    password = request.POST.get('password')
    if not all([username, password]):
        return HttpResponse('Username and password are required', status=401)
    
    try:
        User.objects.get(username=username)
        return HttpResponse('That Username is already taken', status=401)
    except User.DoesNotExist:
        pass
    
    User.objects.create_user(username, '', password)
    user = authenticate(username=username, password=password)
    if user:
        auth_login(request, user)
        for category in DEFAULT_CATEGORIES:
            category = Category.objects.create(user=user, name=category, when_created=datetime.datetime.utcnow())
        
        return HttpResponse(status=200)
    
    return HttpResponse('A server error has occured, please try again later', status=500)


def newCategory(request):
    if not request.user.is_authenticated():
        return HttpResponse(status=401)
    
    name = request.POST.get('name')
    if not name:
        return HttpResponse("Please provide a name for your category", status=500)
    try:
        category = Category.objects.get(name=name, user=request.user)
        return HttpResponse("Please provide a name for your category", status=500)
    except Category.DoesNotExist:
        pass
    
    category = Category.objects.create(name=name, user=request.user, when_created=datetime.datetime.utcnow())
    allCategories = Category.objects.filter(user=request.user)
    responseDict = {}
    responseDict['newCategory'] = simplejson.dumps(toDict(category), cls=DateTimeAwareJSONEncoder, indent=4)
    responseDict['allCategories'] = simplejson.dumps([toDict(category) for category in allCategories], cls=DateTimeAwareJSONEncoder, indent=4)
    return HttpResponse(simplejson.dumps(responseDict))
    return HttpResponse("{newCategory: %s, allCategories: %s}" % (newCategory, allCategories), status=200)

def userItemService(request):
    """
    A JSON provider that supplies all the todo items for this user
    """
    if not request.user.is_authenticated():
        return HttpResponse(status=401)
    
    todoItems = TodoItem.objects.filter(category__user=request.user)
    response = simplejson.dumps([toDict(item) for item in todoItems], cls=DateTimeAwareJSONEncoder, indent=4)
    return HttpResponse(response)

    
def login(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/')
    
    if request.method == 'GET':
        return render_to_response('login.html', {}, context_instance=RequestContext(request))
    
    username = request.POST.get('username')
    password = request.POST.get('password')
    if not all([username, password]):
        return HttpResponse('Username and password are required', status=401)
    
    user = authenticate(username=username, password=password)
    if user:
        auth_login(request, user)
        return HttpResponse(status=200)
    else:
        return HttpResponse('Invalid password/username', status=401)
    
def logout(request):
    auth_logout(request)
    return HttpResponseRedirect('/login/')


