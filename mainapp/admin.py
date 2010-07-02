
#General deps
from django.contrib import admin
from django import forms

#project deps
from todolist.mainapp.models import Category, TodoItem

class CategoryAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(CategoryAdminForm, self).__init__(*args, **kwargs)
        
    class Meta:
        model = Category




class CategoryAdmin(admin.ModelAdmin):
    form =CategoryAdminForm
    list_display = ('name', )
    search_fields = ['=id',]
try:
    admin.site.register(Category, CategoryAdmin)
except admin.sites.AlreadyRegistered:
    pass


class TodoItemAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(TodoItemAdminForm, self).__init__(*args, **kwargs)
        
    class Meta:
        model = TodoItem




class TodoItemAdmin(admin.ModelAdmin):
    form = TodoItemAdminForm
    list_display = ('name', )
    search_fields = ['=id',]
try:
    admin.site.register(TodoItem, TodoItemAdmin)
except admin.sites.AlreadyRegistered:
    pass

