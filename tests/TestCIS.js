/** @module xgrid/Base **/
define([
    "xdojo/declare",
    'xide/types',
    'xide/utils',
    'xgrid/Grid',
    'xide/factory',
    "xide/views/CIViewMixin",
    'xide/layout/TabContainer',

    'xide/views/CIGroupedSettingsView',
    'xide/widgets/WidgetBase',
    'xide/tests/TestUtils',
    'xace/views/ACEEditor',
    'xace/views/Editor',
    'module'


], function (declare, types,
             utils, Grid, factory,CIViewMixin,TabContainer,

             CIGroupedSettingsView,
             WidgetBase,TestUtils,ACEEditor,Editor,module

    ) {


    var actions = [],
        thiz = this,
        ACTION_TYPE = types.ACTION,
        ACTION_ICON = types.ACTION_ICON,
        grid,
        ribbon,
        CIS;

    function createDriverCIS(driver,actionTarget){

        var CIS = {
            "inputs": [
                {
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'General2',
                    "id": "CF_DRIVER_ID",
                    "name": "CF_DRIVER_ID",
                    "order": 1,
                    "params": null,
                    "parentId": "myeventsapp108",
                    "platform": null,
                    "storeDestination": "metaDataStore",
                    "title": "Id",
                    "type": 13,
                    "uid": "-1",
                    "value": "235eb680-cb87-11e3-9c1a-0800200c9a66",
                    "visible": true
                },
                {
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'General2',
                    "id": "CF_DRIVER_CLASS",
                    "name": "CF_DRIVER_CLASS",
                    "order": 1,
                    "params": null,
                    "parentId": "myeventsapp108",
                    "platform": null,
                    "storeDestination": "metaDataStore",
                    "title": "Driver Class",
                    "type": 'Script',
                    "uid": "-1",
                    "value": ".\/Marantz\/MyMarantz.js",
                    "visible": true
                }
            ]
        };

        _.each(CIS.inputs,function(ci){
            ci.driver=driver;
            ci.actionTarget=actionTarget;
        });
        return CIS;
    }
    function onWidgetCreated(basicTab,condTab,varTab,logTab){}
    function doTests(){}

    function openDriverSettings(driver){

        var toolbar = ctx.mainView.getToolbar();


        CIS = createDriverCIS(driver,toolbar);

        var docker = ctx.mainView.getDocker();
        var parent  = TestUtils.createTab('ACE-TEST',null,module.id);

        var cisRenderer = declare('cis',[CIGroupedSettingsView,CIViewMixin],{

            createGroupContainer: function () {

                if (this.tabContainer) {
                    return this.tabContainer;
                }
                var tabContainer = utils.addWidget(TabContainer,{
                    tabStrip: true,
                    tabPosition: "left-h",
                    splitter: true,
                    style: "min-width:450px;",
                    "className": "ui-widget-content"
                },null,this.containerNode,true);
                this.tabContainer = tabContainer;
                return tabContainer;
            },
            attachWidgets: function (data, dstNode,view) {

                var thiz = this;
                this.helpNodes = [];
                this.widgets = [];

                dstNode = dstNode || this.domNode;
                if(!dstNode && this.tabContainer){
                    dstNode = this.tabContainer.containerNode;
                }
                if (!dstNode) {
                    console.error('have no parent dstNode!');
                    return;
                }


                for (var i = 0; i < data.length; i++) {
                    var widget = data[i];
                    widget.delegate = this.owner || this;
                    dstNode.appendChild(widget.domNode);
                    widget.startup();

                    widget._on('valueChanged',function(evt){
                        thiz.onValueChanged(evt);
                    });

                    this.widgets.push(widget);
                    widget.userData.view=view;
                }
            },
            initWithCIS: function (data) {


                this.empty();

                data = utils.flattenCIS(data);

                this.data = data;

                var thiz = this,
                    groups = _.groupBy(data,function(obj){
                        return obj.group;
                    }),
                    groupOrder = this.options.groupOrder || {};

                groups = this.toArray(groups);

                var grouped = _.sortByOrder(groups, function(obj){
                    return groupOrder[obj.name] || 100;
                });

                if (grouped != null && grouped.length > 1) {
                    this.renderGroups(grouped);
                } else {
                    this.widgets = factory.createWidgetsFromArray(data, thiz, null, false);
                    if (this.widgets) {
                        this.attachWidgets(this.widgets);
                    }
                }
            },
        });

/*
        var view = utils.addWidget(CIGroupedSettingsView, {
            title:  'title',
            cis: driver.user.inputs,
            storeItem: driver,
            storeDelegate: this,
            iconClass: 'fa-eye',
            blockManager: ctx.getBlockManager(),
            options:{
                groupOrder: {
                    'General': 1,
                    'Settings': 2,
                    'Visual':3
                },
                select:'General'
            }
        }, null, parent, true);

        */

        docker.resize();
        //view.resize();
    }

    function createACEWidget(){

        return declare("xide.widgets.ScriptWidget", [WidgetBase], {
            didLoad: false,
            minHeight: "300px",
            editorHeight: "470px",
            jsonEditorHeight: "270px",
            aceEditorHeight: "200px",
            aceEditorOptions: null,
            aceEditor: null,
            aceNode: null,
            ctlrKeyDown: false,
            templateString: "<div class='' style='width: 100%;height:100%'>" +
                "<div valign='middle' class='aceEditorWidget' data-dojo-attach-point='aceNode' style='height:100%;padding: 0px;'></div>" +
            "</div>",
            editor: null,
            getValue: function () {
                if (this.aceEditor) {
                    return this.aceEditor.get('value');
                }
                return this.inherited(arguments);
            },
            resize: function () {

                console.log('resize');

                this.inherited(arguments);
                if (this.aceEditor) {
                    this.aceEditor.resize();
                }
            },

            onKeyUp: function (evt) {

                switch (evt.keyCode) {
                    case keys.ALT:
                    case keys.CTRL:
                    {
                        this.ctlrKeyDown = false;
                        break;
                    }
                }
            },
            onKey: function (evt) {
                switch (evt.keyCode) {

                    case keys.META:
                    case keys.ALT:
                    case keys.SHIFT:
                    case keys.CTRL:
                    {
                        this.ctlrKeyDown = true;
                        setTimeout(function () {
                            thiz.ctlrKeyDown = false
                        }, 2000);
                        break;
                    }
                }
                var thiz = this;
                if (evt.type && evt.type == 'keyup') {
                    return this.onKeyUp(evt);
                }
                var charOrCode = evt.charCode || evt.keyCode;

                if (this.ctlrKeyDown && charOrCode === 83) {
                    evt.preventDefault();

                    if (this.delegate && this.delegate.onSave) {
                        this.delegate.onSave(this.userData, this.getValue());
                    }
                }
            },
            setupEventHandlers: function () {
                var thiz = this;

                on(this.aceNode, "keydown", function (event) {
                    thiz.onKey(event);
                });

            },
            setValue: function (value) {
                this.userData = utils.setCIValueByField(this.userData, "value", value);
            },
            _onACEUpdate: function () {
                var _newValue = this.getValue();
                this.setValue(_newValue);
                this.changed = true;
                if (this.userData) {
                    this.userData.changed = true;
                }
            },
            _createACEEditor: function (parentNode) {

                var args = {
                    item:null,
                    filePath:'a.js',
                    delegate:this,
                    style:'padding:0px;',
                    iconClass:'fa-code',
                    autoSelect:true,
                    value: this.getValue(),
                    ctx:ctx,
                    /***
                     * Provide a text editor store delegate
                     */
                    _storeDelegate:{
                        getContent:function(onSuccess){

                            ctx.getFileManager().getContent(item.mount,item.path,onSuccess);
                        },
                        saveContent:function(value,onSuccess,onError){
                            ctx.getFileManager().setContent(item.mount,item.path,value,onSuccess);
                        }

                    },
                    fileName:'bla.js'
                };
                var editor = utils.addWidget(Editor,args,this,parentNode,true,null,null,true);
                return editor;
            },
            getAceNode: function () {


            },
            startup: function () {
                this.inherited(arguments);

                try {
                    if (!this.aceEditor) {
                        this.aceEditor = this._createACEEditor(this.aceNode);
                    }
                } catch (e) {
                    console.error('constructing json editor widget failed : ' + e.message);
                }
                //this.setupEventHandlers();
            }
        });

    }

    function openCISDialog(driver){

        var toolbar = ctx.mainView.getToolbar();


        CIS = createDriverCIS(driver,toolbar);

        var docker = ctx.mainView.getDocker();

        var parent  = TestUtils.createTab('ACE-TEST',null,module.id);

        var cisRenderer = declare('cis',[CIGroupedSettingsView,CIViewMixin],{

            createGroupContainer: function () {

                if (this.tabContainer) {
                    return this.tabContainer;
                }
                var tabContainer = utils.addWidget(TabContainer,{
                    tabStrip: true,
                    tabPosition: "left-h",
                    splitter: true,
                    style: "min-width:450px;",
                    "className": "ui-widget-content"
                },null,this.containerNode,true);
                this.tabContainer = tabContainer;
                return tabContainer;
            },
            attachWidgets: function (data, dstNode,view) {

                var thiz = this;
                this.helpNodes = [];
                this.widgets = [];

                dstNode = dstNode || this.domNode;
                if(!dstNode && this.tabContainer){
                    dstNode = this.tabContainer.containerNode;
                }
                if (!dstNode) {
                    console.error('have no parent dstNode!');
                    return;
                }


                for (var i = 0; i < data.length; i++) {
                    var widget = data[i];
                    widget.delegate = this.owner || this;
                    dstNode.appendChild(widget.domNode);
                    widget.startup();

                    widget._on('valueChanged',function(evt){
                        thiz.onValueChanged(evt);
                    });

                    this.widgets.push(widget);
                    widget.userData.view=view;
                }
            },
            initWithCIS: function (data) {


                this.empty();

                data = utils.flattenCIS(data);

                this.data = data;

                var thiz = this,
                    groups = _.groupBy(data,function(obj){
                        return obj.group;
                    }),
                    groupOrder = this.options.groupOrder || {};

                groups = this.toArray(groups);

                var grouped = _.sortByOrder(groups, function(obj){
                    return groupOrder[obj.name] || 100;
                });

                if (grouped != null && grouped.length > 1) {
                    this.renderGroups(grouped);
                } else {
                    this.widgets = factory.createWidgetsFromArray(data, thiz, null, false);
                    if (this.widgets) {
                        this.attachWidgets(this.widgets);
                    }
                }
            }
        });
        types.registerWidgetMapping('Script', createACEWidget());



        var view = utils.addWidget(cisRenderer,{

        },null,parent,true);

        view.initWithCIS(CIS.inputs);
        ///dialog
        /*
        var dialog = new CIActionDialog({
            cis:createDriverCIS().inputs
        });
        dialog.show();
        */
        docker.resize();
        //view.resize();
    }



/*
     * playground
     */
    var ctx = window.sctx,
        ACTION = types.ACTION,
        root,
        scope,
        blockManager,
        driverManager,
        marantz;

    function createScope() {

        var data = {
            "blocks": [
                {
                    "_containsChildrenIds": [
                        "items"
                    ],
                    "group": "click",
                    "id": "root",
                    "items": [
                        "sub0",
                        "sub1"
                    ],
                    "description": "Runs an expression.<br/>\n\n<b>Behaviour</b>\n\n<pre>\n\n    //to abort execution (child blocks), return something negative as -1 or false.\n    return false;\n\n</pre>",
                    "name": "Root - 1",
                    "method": "console.log('asd',this);",
                    "args": "",
                    "deferred": false,
                    "declaredClass": "xblox.model.code.RunScript",
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0,
                    "additionalProperties": true,
                    "_scenario": "update"
                },

                {
                    "group": "click4",
                    "id": "root4",
                    "description": "Runs an expression.<br/>\n\n<b>Behaviour</b>\n\n<pre>\n\n    //to abort execution (child blocks), return something negative as -1 or false.\n    return false;\n\n</pre>",
                    "name": "Root - 4",
                    "method": "console.log(this);",
                    "args": "",
                    "deferred": false,
                    "declaredClass": "xblox.model.code.RunScript",
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0

                },
                {
                    "group": "click",
                    "id": "root2",
                    "description": "Runs an expression.<br/>\n\n<b>Behaviour</b>\n\n<pre>\n\n    //to abort execution (child blocks), return something negative as -1 or false.\n    return false;\n\n</pre>",
                    "name": "Root - 2",
                    "method": "console.log(this);",
                    "args": "",
                    "deferred": false,
                    "declaredClass": "xblox.model.code.RunScript",
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0

                },

                {
                    "group": "click",
                    "id": "root3",
                    "description": "Runs an expression.<br/>\n\n<b>Behaviour</b>\n\n<pre>\n\n    //to abort execution (child blocks), return something negative as -1 or false.\n    return false;\n\n</pre>",
                    "name": "Root - 3",
                    "method": "console.log(this);",
                    "args": "",
                    "deferred": false,
                    "declaredClass": "xblox.model.code.RunScript",
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0

                },


                {
                    "_containsChildrenIds": [],
                    "parentId": "root",
                    "id": "sub0",
                    "name": "On Event",
                    "event": "",
                    "reference": "",
                    "declaredClass": "xblox.model.events.OnEvent",
                    "_didRegisterSubscribers": false,
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "description": "No Description",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0,
                    "additionalProperties": true,
                    "_scenario": "update"
                },
                {
                    "_containsChildrenIds": [],
                    "parentId": "root",
                    "id": "sub1",
                    "name": "On Event2",
                    "event": "",
                    "reference": "",
                    "declaredClass": "xblox.model.events.OnEvent",
                    "_didRegisterSubscribers": false,
                    "enabled": true,
                    "serializeMe": true,
                    "shareTitle": "",
                    "description": "No Description",
                    "canDelete": true,
                    "renderBlockIcon": true,
                    "order": 0,
                    "additionalProperties": true,
                    "_scenario": "update"
                }
            ],
            "variables": []
        };

        return blockManager.toScope(data);
    }

    if (ctx) {

        blockManager = ctx.getBlockManager();
        driverManager = ctx.getDriverManager();
        //marantz  = driverManager.getItemById("235eb680-cb87-11e3-9c1a-0800200c9a66");

        //openDriverSettings(marantz);
        openCISDialog();

        return declare('a',null,{});
    }

    return Grid;

});