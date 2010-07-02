from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    id = models.AutoField(primary_key=True)
    when_created = models.DateTimeField(db_index=True)
    name = models.CharField("Category name", max_length=128, help_text="The name for this category, e.g: Personal")
    user = models.ForeignKey(User)
    
    def __unicode__(self):
        return u'%(username)s:%(categoryName)s' % {'username':self.user_id,
                                                   'categoryName': self.name}

    class Meta:
        db_table = 'category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
    
    
        

class TodoItem(models.Model):
    id = models.AutoField(primary_key=True)
    when_created = models.DateTimeField(db_index=True)
    last_updated = models.DateTimeField(db_index=True)
    completed = models.BooleanField(default=False)
    category = models.ForeignKey(Category)
    name = models.CharField("Item name", max_length=128, help_text="The name for this todo item")
    description = models.CharField('Item Description', max_length=512,
                                    help_text='An optional description for this item', blank=True)
    
    def __unicode__(self):
        return u'%(username)s: %(itemName)s' % {'username': self.category.user_id,
                                                'itemName': self.name}
        
    class Meta:
        db_table = 'todoitem'
        verbose_name = 'Todo Item'
        verbose_name_plural = 'Todo Items'
    
    