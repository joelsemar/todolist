

var addItemDialog;
var tabPanel;
var currentTab;
function createTabPanel(categories){

    var tabObjects = [];
    var columns = createColumns();
    var todoItemFields = ['name', 'description', 'completed', 'category_id'];
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var url = '/category/{0}/items/'.strFormat(category.id);
        var store = new Ext.data.JsonStore({
            fields: todoItemFields,
            url: '/category/{0}/items/'.strFormat(category.id),
            autoSave: true,
            autoLoad: true,
            listeners: {
                'add': createItemEventHandler,
                'update': updateItemEventHandler,
                'delete': deleteItemEventHandler
            }
        });
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
    var allDataStore = new Ext.data.JsonStore({
        fields: todoItemFields,
        url: '/items/',
        autoLoad: true
    
    });
    tabObjects.unshift({
        title: 'All items',
        id: 'allitems_tab',
        store: allDataStore,
        cm: createColumns(),
        selModel: new Ext.grid.RowSelectionModel(),
        plugins: new Ext.grid.CheckColumn({
            id: 'completed',
            header: 'Complete',
            dataIndex: 'completed',
            width: 25
        })
    
    })
    
    tabPanel = new Ext.TabPanel({
        id: 'tabPanel',
        activeTab: currentTab ? currentTab : 0,
        height: 500,
        deferredRender: true,
        hideMode: Ext.isIE ? 'offsets' : 'display',
        defaults: {
            xtype: 'editorgrid',
            viewConfig: {
                forceFit: true
            },
            height: 500
        },
        items: tabObjects,
        tbar: [{
            text: 'Add new item',
            id: 'newItemButton',
            iconCls: 'newItem',
            tooltip: 'Click here to add a new todo item',
            handler: addNewItem
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
                allowBlank: false,
                maxLength: 512,
                maxLengthText: "The maximum length for this field is 512 characters"
            })
        }, checkColumn]
    });
    return columnModel
    
}



function addNewItem(){
    if (addItemDialog) {
        addItemDialog.show();
		Ext.fly('newItemName').update('');
		return;
    }
    var content = '<p>Give your new item a name</p>';
    content += "<input type='text' id='newItemName'></input>";
    content += "Category: <select id='categorySelect' name='categoryID'>";
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var selected = category.id === parseInt(tabPanel.getActiveTab().id.replace('tab_', ''), 10);
        content += "<option value={0} {1}>{2}</option>".strFormat(category.id, selected ? 'selected' : '', category.name);
    }
    content += '</select>';
    content += '<button type="button" id="newItemDialogButton">Create</button>';
    addItemDialog = new Ext.Window({
        width: 320,
        height: 165,
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
    var grid = tabPanel.get('tab_{0}'.strFormat(categoryID));
    var TodoItem = grid.getStore().recordType;
    if (!itemName) {
        return;
    }
    var item = new TodoItem({
        name: itemName,
        category_id: categoryID
    });
    grid.getStore().insert(0, item);
    addItemDialog.hide();
}


function createItemEventHandler(store, records){
	if(!records){
		return;
	}
	var newItem = records[0].data;
	Ext.Ajax.request({
		method: 'POST',
		url: '/category/{0}/items/'.strFormat(newItem.category_id),
		params: {itemName: newItem.name,
				 categoryID: newItem.category_id},
		success: function(responseObject){
			 var newItem = JSON.parse(responseObject.responseText);
			 tabPanel.setActiveTab('tab_{0}'.strFormat(newItem.category_id));
			 reloadAllDataGrid()
     	 }
	});

}


function updateItemEventHandler(store, records){
	var params = {
		itemName: records.data.name,
		description: records.data.description,
		completed: records.data.completed,
		category_id: records.data.category_id,
		id: records.id
	};
	debugger;
	Ext.Ajax.request({
		method: 'PUT',
		url: '/category/{0}/items/'.strFormat(params.category_id),
		params: params,
		success: function(){
			reloadAllDataGrid();
		},
		headers:{'Content-Type': 'application/x-www-form-urlencoded'}
	});

}

function deleteItemEventHandler(store, records){


}

function reloadAllDataGrid(){
	var allDataGrid = tabPanel.get('allitems_tab');
	allDataGrid.getStore().reload();
	
}
