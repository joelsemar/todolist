
var addCategoryDialog;
var addItemDialog;
var tabPanel;
var storeListeners = {
    'update': updateItemEventHandler,
    'delete': deleteItemEventHandler
};
var todoItemFields = ['name', 'description', 'completed', 'category_id', 'id'];
function createTabPanel(){
	// For every category the user has, we create a data store, associate 
	// it with a grid, and then push the grids onto an array, the result can then be used to construct
	// the tab panel
    var tabObjects = [];
    var columns = createColumns();
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var url = '/category/{0}/items/'.strFormat(category.id);
        var store = new Ext.data.JsonStore({
            fields: todoItemFields,
            url: '/category/{0}/items/'.strFormat(category.id),
            autoSave: true,
            autoLoad: true,
            listeners: storeListeners
        });
        //the 'tabObjects' are the individual grids that will make up the tabPanel
		tabObjects.push({
            title: capWord(category.name),
            id: 'tab_{0}'.strFormat(category.id),
            store: store,
            cm: createColumns(),
            selModel: new Ext.grid.RowSelectionModel(),
            plugins: new Ext.grid.CheckColumn({
                id: 'completed',
                header: 'Complete',
                dataIndex: 'completed',
                width: 25
            })
        });
        
        
    }
    
    tabPanel = new Ext.TabPanel({
        id: 'tabPanel',
        activeTab: 0,
        height: 500,
		autoScroll: true,
		enableTabScroll:true,
        deferredRender: true,
        hideMode: Ext.isIE ? 'offsets' : 'display',
	    plugins: new Ext.ux.TabCloseMenu(),
        defaults: {
            xtype: 'editorgrid',
            viewConfig: {
                forceFit: true
            },
            height: 500,
			closable:true

        },
        items: tabObjects,
        tbar: [{
            text: 'Add new item',
            id: 'newItemButton',
            iconCls: 'newItem',
            tooltip: 'Click here to add a new todo item',
            handler: addNewItem
        }, {
            text: 'Add a new category',
            id: 'newCategoryButton',
            iconCls: 'newItem',
            tooltip: 'Click here to add a new category',
            handler: addNewCategory
        
        }],
        renderTo: 'todoTabPanel'
    
    });
    
    
}

function createColumns(){
    var checkColumn = new Ext.grid.CheckColumn({
        id: 'completed',
        header: 'Complete',
        dataIndex: 'completed',
        width: 25
    });
    var columnModel = new Ext.grid.ColumnModel({
        defaults: {
            sortable: true
        },
        columns: [{
            id: 'name',
            header: 'Name',
            dataIndex: 'name',
            width: 65,
            editor: new Ext.form.TextField({
                allowBlank: false,
                maxLength: 64,
                maxLengthText: "The maximum length for this field is 64 characters"
            })
        
        }, {
            id: 'description',
            header: 'Description',
            dataIndex: 'description',
            editor: new Ext.form.TextField({
                allowBlank: true,
                maxLength: 512,
				validationEvent: false,
                maxLengthText: "The maximum length for this field is 512 characters"
            })
        }, checkColumn]
    });
    return columnModel
    
}


function addNewCategory(){
    if (addCategoryDialog) {
        addCategoryDialog.show();
        Ext.getDom('newCategoryName').value = '';
        return;
    }
    
    var content = '<p>Give your new category a name</p>';
    content += "<input type='text' id='newCategoryName' maxLength='128'></input>";
    content += '<button type="button" id="newCategoryDialogButton">Create</button>';
    addCategoryDialog = new Ext.Window({
        width: 320,
        height: 165,
        bodyStyle: {
            padding: '10px'
        },
        title: "Create a new Todo Category",
        html: content,
        closeAction: 'hide',
        modal: true,
        listeners: {
            'beforeshow': function(){
                addCategoryDialog.focusEl = Ext.get('newCategoryName')
            }
        }
    });
    addCategoryDialog.show(Ext.fly('listHeader'));
    Ext.EventManager.on('newCategoryDialogButton', 'click', submitNewCategory);
}


function submitNewCategory(){
    var newCategoryName = Ext.fly('newCategoryName').getValue();
    if (!newCategoryName) {
        return;
    }
    Ext.Ajax.request({
        method: 'POST',
        url: '/category/',
        params: {
            name: newCategoryName
        },
        success: function(responseObject){
            var data = JSON.parse(responseObject.responseText);
            var category = JSON.parse(data.newCategory);
            categories = JSON.parse(data.allCategories);
            var store = new Ext.data.JsonStore({
                fields: todoItemFields,
                url: '/category/{0}/items/'.strFormat(category.id),
                autoSave: true,
                autoLoad: true,
                listeners: storeListeners
            });
            var grid = new Ext.grid.EditorGridPanel({
                title: capWord(category.name),
                id: 'tab_{0}'.strFormat(category.id),
                store: store,
                cm: createColumns(),
                selModel: new Ext.grid.RowSelectionModel(),
                plugins: new Ext.grid.CheckColumn({
                    id: 'completed',
                    header: 'Complete',
                    dataIndex: 'completed',
                    width: 25
                }),
            
            });
            tabPanel.add(grid);
            tabPanel.setActiveTab(grid.id);
            addCategoryDialog.hide();
        },
        failure: function(responseObject){
            userMessage('errors', responseObject.responseText);
            addCategoryDialog.hide();
        }
    });
}

function addNewItem(){
    if (addItemDialog) {
        addItemDialog.show();
        Ext.getDom('newItemName').value = '';
        return;
    }
    var content = '<p>Give your new item a name</p>';
    content += "<input type='text' id='newItemName' maxLength='128'></input>";
    content += "<div>Category: <select id='categorySelect' name='categoryID'>";
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var selected = category.id === parseInt(tabPanel.getActiveTab().id.replace('tab_', ''), 10);
        content += "<option value={0} {1}>{2}</option>".strFormat(category.id, selected ? 'selected' : '', category.name);
    }
    content += '</select>';
    content += '<button type="button" id="newItemDialogButton">Create</button></div>';
    addItemDialog = new Ext.Window({
        width: 310,
        height: 165,
        closeAction: 'hide',
        bodyStyle: {
            padding: '10px'
        },
        title: "Create a new Todo item",
        html: content,
        modal: true,
        listeners: {
            'beforeshow': function(){
                addItemDialog.focusEl = Ext.get('newItemName')
            }
        }
    });
    addItemDialog.show(Ext.fly('listHeader'));
    Ext.EventManager.on('newItemDialogButton', 'click', submitNewItem)
}


function submitNewItem(){
    var itemName = Ext.get('newItemName').getValue();
    var categoryID = Ext.get('categorySelect').getValue();
    if (!itemName) {
        return;
    }
    
    Ext.Ajax.request({
        method: 'POST',
        url: '/category/{0}/items/'.strFormat(categoryID),
        params: {
            itemName: itemName,
        },
        success: function(responseObject){
            var newItem = JSON.parse(responseObject.responseText);
            
            var grid = tabPanel.get('tab_{0}'.strFormat(newItem.category_id));
    		var TodoItem = grid.getStore().recordType;
			var item = new TodoItem({
                name: newItem.name,
                category_id: newItem.category_id
            });
			tabPanel.setActiveTab('tab_{0}'.strFormat(newItem.category_id));
            grid.getStore().add(item);
            grid.getStore().sort();
            grid.getStore().reload();
        },
        failure: function(responseObject){
            userMessage('errors', responseObject.responseText)
        },
		callback: function(){
			addItemDialog.hide();
		}
    });
    
}


function updateItemEventHandler(store, records){
	//post our new changes to the server
    var params = {
        itemName: records.data.name,
        description: records.data.description,
        completed: records.data.completed,
        id: records.id
    };
    Ext.Ajax.request({
        method: 'PUT',
        url: '/category/{0}/items/'.strFormat(records.data.category_id),
        params: params,
        failure: function(responseObject){
            userMessage('errors', responseObject.responseText)
        }
    });
    store.reload();
}



function deleteItemEventHandler(store, records){


}


