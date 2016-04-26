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
    'xide/views/CIActionDialog',
    'xide/widgets/WidgetBase',
    'xide/widgets/_Widget',
    'xide/widgets/_CacheMixin',
    'xide/widgets/ActionToolbar',
    'xaction/ActionModel',
    'xaction/ActionProvider',
    "dstore/Memory",
    'xide/widgets/ExpressionsGridView',
    'xide/tests/TestUtils',
    'xace/views/ACEEditor',
    'xace/views/Editor',
    'module'


], function (declare, types,
             utils, Grid, factory,CIViewMixin,TabContainer,

             CIGroupedSettingsView,CIActionDialog,
             WidgetBase,_Widget,_CacheMixin,ActionToolbar,ActionModel,ActionProvider,
             Memory,ExpressionsGridView,
             TestUtils,ACEEditor,Editor,module

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
                    "group": 'General1',
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
                    "group": 'General1',
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
                    "visible": false,
                    "widget":{
                        height:'300px !important'
                    }
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
                    "group": 'General12',
                    "id": "CF_DRIVER_CLASS2",
                    "name": "CF_DRIVER_CLASS2",
                    "order": 1,
                    "params": null,
                    "parentId": "myeventsapp108",
                    "platform": null,
                    "storeDestination": "metaDataStore",
                    "title": "Driver Class",
                    "type": 'Expression',
                    "uid": "-1",
                    "value": ".\/Marantz\/MyMarantz.js",
                    "visible": true,
                    "widget":{
                        height:'300px !important',
                        showBrowser:true
                    }
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
            }
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

    function createScriptWidget(){
        return declare("xide.widgets.ScriptWidget", [WidgetBase], {
            aceEditor: null,
            editorArgs:{},
            editorOptions:{
                showGutter:false,
                mode:'javascript'
            },
            height:'200px',
            templateString: "<div class='' style='width: 100%;height:auto'>" +
                "<div valign='middle' class='aceEditorWidget' data-dojo-attach-point='aceNode' style='height:${!height}'></div>" +
            "</div>",
            getValue: function () {
                if (this.aceEditor) {
                    return this.aceEditor.get('value');
                }
                return this.inherited(arguments);
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
            createWidgets: function () {


                var args = utils.mixin({
                        style:'padding:0px;',
                        iconClass:'fa-code',
                        value: this.getValue(),
                        ctx:ctx,
                        options:this.userData.options || this.editorOptions || {
                            showGutter:false
                        }
                    },this.editorArgs),

                    self = this,

                    editor = this.add(Editor,args,this.aceNode,true,true),

                    ace = editor.getAce();

                ace.on('change', function () {
                    self._onACEUpdate();
                });

                ace.on('blur', function () {
                    self.setActive(false);
                });

                ace.on('focus', function () {
                    self.setActive(true);
                });

                $(editor.domNode).css('max-height',this.height);

                return editor;
            },
            startup: function () {
               if(this._started){return;}
                this.aceEditor = this.createWidgets(this.aceNode);
            }
        });
    }

    function createExpressionWidget(){

        return declare("xide.widgets.ExpressionEditor", [WidgetBase,_CacheMixin],{
            /////////////////////////////////////////////////////////////////////////////////////
            //
            //  Variables
            //
            /////////////////////////////////////////////////////////////////////////////////////
            editorArgs:{

            },
            editorOptions:{
                showGutter:false,
                mode:'javascript',
                wordWrap:true
            },
            cssClass: 'expressionEditor',
            aceNode: null,
            aceEditor: null,
            minHeight: "500px",
            minWidth: "600px",
            helpContainer: null,
            autoCompleterWords: null,
            apiStore: null,
            ctlrKeyDown: false,
            layoutTop2:null,
            showBrowser:true,
            showSaveButton:false,
            showExpand:true,
            editorHeight:'200px',
            templateString: "<div style='height: inherit;'>" +
            "<div data-dojo-attach-point='layoutMain' data-dojo-type='xide.layout.BorderContainer' data-dojo-props=\"design:'headline'\" class='layoutMain' style='height:${!minHeight}'>" +
            "<div data-dojo-attach-point='layoutTop' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'top',splitter:'true',toggleSplitterState:'full',toggleSplitterClosedSize:'0px',toggleSplitterFullSize:'150px'\" class='layoutTop' style='height:${!editorHeight}'>" +
                '<div data-dojo-attach-point="aceNode" class="view-body row" style="height:100%;width: 100%;position: absolute;top:0;left: 0;"></div>' +
            "</div>" +
            "<div data-dojo-attach-point='layoutTop2' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'top',splitter:'false'\" class='layoutTop ui-state-default' style='height:auto;min-height: 32px;'></div>" +
            "<div data-dojo-attach-point='layoutLeft' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'leading',splitter:'true'\" class='layoutLeft' style='width: 170px;padding:0px;'></div>" +
            "<div data-dojo-attach-point='layoutCenter' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'center',splitter:'false'\" class='layoutCenter' style='padding: 0px'></div>" +
            "<div data-dojo-attach-point='layoutBottom' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'bottom',splitter:'true',toggleSplitterState:'full',toggleSplitterClosedSize:'0px',toggleSplitterFullSize:'150px'\" class='layoutBottom ui-state-default'><div data-dojo-attach-point='helpContainer' style='height: 80px;'></div></div>" +
            "</div>" +
            "</div>",
            postMixInProperties:function(){

                if(!this.showBrowser){
                    this.minHeight = "380px";

                    //height:${!minHeight}'
                    this.templateString = "<div style=''>" +
                        "<div data-dojo-attach-point='layoutMain' data-dojo-type='xide.layout.BorderContainer' data-dojo-props=\"design:'headline'\" class='layoutMain' style=''>" +
                        "<div data-dojo-attach-point='layoutTop' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'top',splitter:'false',toggleSplitterState:'full',toggleSplitterClosedSize:'0px',toggleSplitterFullSize:'150px'\" class='layoutTop ui-state-default' style='height:${!editorHeight}'>" +
                            '<div data-dojo-attach-point="aceNode" class="view-body row" style="height:100%;width: 100%;position: absolute;top:0;left: 0;"></div>' +
                        "</div>" +
                        "<div data-dojo-attach-point='layoutTop2' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'top',splitter:'false'\" class='layoutTop ui-state-default' style='height:auto;min-height: 32px;'></div>" +
                        "<div data-dojo-attach-point='layoutLeft' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'leading',splitter:'true'\" class='layoutLeft' style='width: 170px;padding:0px;'></div>" +
                        "<div data-dojo-attach-point='layoutCenter' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'center',splitter:'false'\" class='layoutCenter' style='padding: 0px;'></div>" +
                        "<div data-dojo-attach-point='layoutBottom' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'bottom',splitter:'false',toggleSplitterState:'full',toggleSplitterClosedSize:'0px',toggleSplitterFullSize:'100px'\" class='layoutBottom ui-state-default' style=''><div data-dojo-attach-point='helpContainer' style='height: 100px;padding: 16px 8px 8px'></div></div>" +
                        "</div>" +
                        "</div>";

                }
                this.inherited(arguments);
            },
            getValue: function () {
                if (this.aceEditor) {
                    return this.aceEditor.get('value');
                }
                return this.inherited(arguments);
            },
            addAutoCompleterWord: function (text, help) {

                if (!this.autoCompleterWords) {
                    this.autoCompleterWords = [];
                }
                this.autoCompleterWords.push({
                    word: text,
                    value: text,
                    meta: help || ''
                });

            },
            /**
             * Insert a symbol into the current expression
             * @param val
             * @param isFunction
             */
            insertSymbol: function (val, isFunction) {
                if (this.aceEditor) {
                    this.aceEditor.get('value');
                    var editor = this.aceEditor.getEditor();
                    var selection = editor.getSelectedText();
                    if (selection && selection.length > 0) {
                        if (isFunction && val.indexOf('(') == -1) {
                            val = val + '(' + selection + ')';
                        } else {
                            val = ' ' + val + ' ';
                        }
                    }
                    editor.insert(val);
                }
            },
            /**
             * Show some HTML text in the help panel
             * @param text
             */
            showDocumentation: function (text) {

                dojo.empty(this.helpContainer);
                var help = dojo.create('div', {
                    innerHTML: '',
                    className: 'ui-widget'
                });
                this.helpContainer.appendChild(help);
                var textText = dojo.create('span', {
                    innerHTML: text,
                    className: 'ui-content'
                });
                help.appendChild(textText);
            },
            _createSymbol: function (label, value,isFunction) {

                var thiz = this;

                this.addAutoCompleterWord(value, label);

                return {
                    name: 'Call Command',
                    owner: this,
                    icon: '-',
                    label: label,
                    style: 'float:left;font-size:12px;margin:2px;',
                    extraClass: 'blockExpressionSymbolButton actionToolbarButtonElusive',
                    tab:'Home',
                    command:'Insert/'+label,
                    group:'Insert',
                    handler: function () {
                        thiz.insertSymbol(value || label, isFunction);
                    }
                }

            },
            runExpression: function () {

                if (this.userData.delegate && this.userData.delegate.runExpression) {

                    var thiz = this;

                    var _showText = function (text) {

                        dojo.empty(thiz.helpContainer);

                        text = text.replace('return', '');


                        var help = dojo.create('div', {
                            innerHTML: '',
                            className: 'ui-widget'
                        });

                        thiz.helpContainer.appendChild(help);

                        var textText = dojo.create('span', {
                            innerHTML: text,
                            className: 'ui-content'
                        });
                        help.appendChild(textText);
                    };

                    var _error = function (text, e) {
                        _showText(text);
                    };

                    var _run = function (text, e) {
                        _showText(text);
                    };

                    var expression = this.getValue();
                    var result = this.userData.delegate.runExpression(expression, _run, _error);
                }
            },
            initToolbar: function () {


                if (this.layoutTop2._splitterWidget) {
                    utils.destroy(this.layoutTop2._splitterWidget);
                    this.layoutTop2._splitterWidget=null;
                }

                this.toolbar = this.add(ActionToolbar, {
                    delegate: this,
                    useElusive: false,
                    beanContextName:this.id + '_toolbar',
                    subscribes:{
                        'onSetItemsActions':false
                    },
                    style: 'display:inline-block;padding:2px'
                }, this.layoutTop2, true);

                var thiz = this;
                var actions = [];
                var _actionProvider = new ActionProvider();
                var _actionStore = _actionProvider.getActionStore();

                var _defaultMixin = {
                    addPermission:true
                }

                function _createSymbol(label,value,isFunction){


                    thiz.addAutoCompleterWord(value, label);


                    return _actionProvider.createAction({
                        name: 'Call Command',
                        owner: thiz,
                        //icon:'fa-play',
                        title: label,
                        label: label,
                        onCreate:function(action){

                            action.setVisibility(types.ACTION_VISIBILITY_ALL,{
                                label:label
                            });

                        },

                        style: 'float:left;font-size:12px;margin:2px;',
                        extraClass: 'blockExpressionSymbolButton actionToolbarButtonElusive',
                        tab:'Home',
                        command:'Insert/'+label,
                        group:'Insert',
                        mixin:_defaultMixin,
                        handler: function () {
                            thiz.insertSymbol(value || label, isFunction);
                        }
                    });
                }


                actions = actions.concat([

                    _actionProvider.createAction({
                        label: 'Play',
                        icon: 'fa-play',
                        place: 'first',
                        extraClass: 'blockExpressionSymbolButton',
                        style: 'font-size:12px',
                        tab:'Home',
                        command:'Insert/Play',
                        group:'Insert',
                        mixin:_defaultMixin,
                        handler: function () {
                            thiz.runExpression();
                        }
                    }),
                    _createSymbol('+'),
                    _createSymbol('-'),
                    _createSymbol('*'),
                    _createSymbol('/'),
                    _createSymbol('=', '=='),
                    _createSymbol('<'),
                    _createSymbol('<='),
                    _createSymbol('>'),
                    _createSymbol('>='),
                    //_createSymbol(' '),
                    _createSymbol('%'),
                    _createSymbol('AND', '&&'),
                    _createSymbol('OR', '||'),
                    _createSymbol('XOR', '^'),
                    _createSymbol('NOT', '~'),
                    _createSymbol('Substring', 'substr'),
                    _createSymbol('IndexOf', 'indexOf'),
                    _createSymbol('LastIndex', 'lastIndexOf'),
                    _createSymbol('Replace', 'replace'),
                    _createSymbol('Split', 'split')
                ]);

                if(this.showSaveButton){
                    actions.push(
                        {
                            title: 'Save',
                            icon: 'fa-floppy-o',
                            place: 'first',
                            emit: false,
                            extraClass: 'blockExpressionSymbolButton',
                            elusive: true,
                            style: 'float:left;font-size:12px',
                            handler: function () {
                                thiz.userData.changed = true;
                                thiz.userData.active = true;
                                var value = thiz.getValue();

                                utils.setCIValueByField(thiz.userData, "value", value);

                                var _eventArgs = {
                                    owner: thiz.delegate || thiz.owner,
                                    ci: thiz.userData,
                                    newValue: value,
                                    storeItem: thiz.storeItem
                                };

                                thiz.publish(types.EVENTS.ON_CI_UPDATE,_eventArgs);

                                thiz._emit('valueChanged', _eventArgs);

                            }
                        }
                    );

                }



                _actionProvider.addActions(actions);


                //this.toolbar.clear();
                if (actions && actions.length > 0) {
                    this.toolbar.setActionEmitter(_actionProvider);
                }

                if(this.showExpand){

                }



            },
            /**
             *
             * @param name
             * @param where
             * @returns {{name: *, group: string, children: Array, value: null}}
             */
            createBranch: function (name, where) {
                var branch = {
                    name: name,
                    group: 'top',
                    children: [],
                    value: null
                };
                where.push(branch);
                return branch;

            },
            createAPIStore: function () {

                var sdata = {
                    identifier: "_id",
                    label: "level",
                    items: this.api
                };
                var store = Memory({data: sdata});

            },
            /**
             *
             * @param label
             * @param value
             * @param parent
             * @param help
             * @param isFunction
             * @param where
             * @returns {{name: *, group: string, value: *, parent: *, help: *, isFunction: *}}
             * @private
             */
            createLeaf: function (label, value, parent, help, isFunction, where) {
                var leaf = {
                    name: label,
                    group: 'leaf',
                    value: value,
                    parent: parent,
                    help: help,
                    isFunction: isFunction != null ? isFunction : true
                };

                this.addAutoCompleterWord(value, help);
                if (where) {
                    where.children.push({
                        _reference: label
                    })
                }
                return leaf;
            },
            apiItemToLeaf: function (item) {
                var result = {};
            },
            getAPIField: function (item, title) {

                for (var i = 0; i < item.sectionHTMLs.length; i++) {
                    var obj = item.sectionHTMLs[i];

                    if (obj.indexOf("id = \"" + title + "\"") != -1) {
                        return obj;
                    }
                }

                return '';
            },
            insertApiItems: function (startString, dst, where) {

                var result = [];
                for (var i = 0; i < this.api.length; i++) {
                    var item = this.api[i];

                    if (item.title.indexOf(startString) != -1) {
                        /*result.push(item);*/
                        var leafData = this.apiItemToLeaf(item);

                        var title = item.title.replace(startString, '');
                        var description = this.getAPIField(item, 'Description');
                        var parameters = this.getAPIField(item, 'Parameters');
                        var examples = this.getAPIField(item, 'Examples');
                        var syntax = this.getAPIField(item, 'Syntax');

                        description = description + '</br>' + parameters + '<br/>' + examples;
                        syntax = utils.strip_tags(syntax);
                        syntax = syntax.replace('Syntax', '');
                        syntax = utils.replaceAll('\n', '', syntax);
                        syntax = utils.replaceAll('\r', '', syntax);
                        where.push(this.createLeaf(title, syntax, startString.replace('.', ''), description, true, dst));

                    }

                }

                return result;
            },
            _createExpressionData: function () {

                var data = {
                    items: [],
                    identifier: 'name',
                    label: 'name'
                };

                var _Array = this.createBranch('Array', data.items);
                this.insertApiItems('Array.', _Array, data.items);

                var _Date = this.createBranch('Date', data.items);
                this.insertApiItems('Date.', _Date, data.items);

                var _Function = this.createBranch('Function', data.items);
                this.insertApiItems('Function.', _Function, data.items);

                var _Math = this.createBranch('Math', data.items);
                this.insertApiItems('Math.', _Math, data.items);

                var _Number = this.createBranch('Number', data.items);
                this.insertApiItems('Number.', _Number, data.items);

                var _Object = this.createBranch('Object', data.items);
                this.insertApiItems('Object.', _Object, data.items);

                var _String = this.createBranch('String', data.items);
                this.insertApiItems('String.', _String, data.items);

                var _RegExp = this.createBranch('RegExp', data.items);
                this.insertApiItems('RegExp.', _RegExp, data.items);

                this.publish(types.EVENTS.ON_EXPRESSION_EDITOR_ADD_FUNCTIONS, {
                    root: data,
                    widget: this,
                    user: this.userData
                });

                return data;
            },
            _createExpressionStore: function () {

                return new Memory({
                    data: this._createExpressionData(),
                    getChildren: function (parent, options) {
                        return this.query({parent: this.getIdentity(parent)});
                    },
                    mayHaveChildren: function (parent) {
                        return false;
                    }
                });
            },
            updateGrid: function (item) {
                if (this.gridView) {
                    this.gridView.grid.set("collection", this.store.filter({parent: item.name}));
                    this.gridView.grid.clearSelection();
                }

            },
            onTreeClicked: function (item, nodeWidget) {
                this.lastSelectedTreeNode = nodeWidget;
                this.currentItem = item;
                this.updateGrid(item);
            },
            _createTreeView: function () {

                this.leftStore = this._createExpressionStore();

                var thiz = this;
                var grid = new ExpressionsGridView({
                    keyboardNavigation: false,
                    mouseNavigation: false,
                    openTreeOnEnter: false,
                    dnd: false,
                    store: this.leftStore,
                    style: 'overflow-x:hidden;padding:0px',
                    delegate: {

                        onItemSelected: function (item) {
                            if (!item) {
                                return;
                            }
                            if (thiz.gridView) {
                                thiz.gridView.grid.set("collection", thiz.leftStore.filter({parent: item.name}));
                                thiz.gridView.onResize();
                                thiz.gridView.grid.clearSelection();
                            }
                        }
                    }
                });
                this.leftGrid = grid;
                this.layoutLeft.containerNode.appendChild(grid.domNode);
                grid.startup();
                this.leftGrid.grid.set("collection", this.leftStore.filter({group: 'top'}));

            },
            _createGridView: function () {

                var thiz = this;
                var grid = new ExpressionsGridView({
                    keyboardNavigation: true,
                    mouseNavigation: true,
                    openTreeOnEnter: false,
                    dnd: false,
                    store: this.leftStore,
                    style: 'overflow-x:hidden;padding:0px',
                    delegate: {
                        currentItem: null,
                        onItemSelected: function (item) {
                            if (!item) {
                                return;
                            }
                            this.currentItem = item;
                            if (item && item.help) {
                                thiz.showDocumentation(item.help || "");
                            }
                        },
                        onGridMouseDoubleClick: function () {
                            if (this.currentItem) {
                                thiz.insertSymbol(this.currentItem.value, this.currentItem.isFunction);
                            }
                        }
                    }
                });
                this.gridView = grid;
                this.layoutCenter.containerNode.appendChild(grid.domNode);
                grid.startup();
                this.gridView.grid.set("collection", this.leftStore.filter({group: 'nada'}));

            },
            createWidgets: function () {

                this.aceEditor =  this._createACEEditor(this.aceNode);

                if(this.showBrowser) {
                    this._createTreeView();
                    this._createGridView();
                }else{
                    this.leftStore = this._createExpressionStore();
                }

                this.initToolbar();

                this.aceEditor.addAutoCompleter(this.autoCompleterWords);

            },
            onReady: function () {
                var thiz = this;
                setTimeout(function () {
                    if(thiz.layoutMain) {
                        thiz.layoutMain.resize();
                    }
                }, 100);
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
            setupEventHandlers: function () {
                var thiz = this;
                on(this.aceEditor, "keydown", function (event) {
                    thiz.onKey(event);
                });
            },
            _createACEEditor: function (parentNode) {

                var args = utils.mixin({
                        style:'padding:0px;',
                        iconClass:'fa-code',
                        value: this.getValue(),
                        options:this.userData.options || this.editorOptions || {
                            showGutter:false
                        }
                    },this.editorArgs),

                    self = this,

                    editor = this.add(Editor,args,parentNode,true,true),

                    ace = editor.getAce();

                ace.on('change', function () {
                    self._onACEUpdate();
                });

                ace.on('blur', function () {
                    self.setActive(false);
                });

                ace.on('focus', function () {
                    self.setActive(true);
                });

                /*
                var args  = {
                    delegate: this,
                    owner: this,
                    value: this.getValue(),
                    beanContextName: this.id,
                    autoSelect: false,
                    style: "margin: 0; padding: 0; position:relative;overflow: auto;min-height:125px;height:inherit;width:inherit;",
                    editorOptions: this.editorOptions,
                    hasConsole: false,
                    emits: {
                        'onViewShow': false,
                        'onItemSelected': false
                    }
                };
                if(this.aceOptions){
                    utils.mixin(args,this.aceOptions);
                }
                var editorPane =  utils.addWidget(ACEEditor,args,this,parentNode,true);


                this.aceEditor = editorPane.getEditor();

                var editor = this.aceEditor.getEditor();

                var thiz = this;
                editor.on('change', function () {
                    thiz._onACEUpdate();
                });

                editor.on('blur', function () {
                    thiz.setActive(false);
                });
                editor.on('focus', function () {
                    thiz.setActive(true);
                });

                */
                this.publish(types.EVENTS.ON_ACE_READY,{
                    aceEditor:editor,
                    owner:this
                });

                return editor;

            },
            ////////////////////////////////////////////////////////////////////////////
            //
            //  Action toolbar & view lifecycle handling
            //
            ////////////////////////////////////////////////////////////////////////////
            updateItemActions: function (items, owner, actions, where) {
                //we update only when the action context changed
                if (this.toolbar && this.toolbar.getCurrentItem() != items) {
                    this.toolbar.clear();
                }
            },
            onItemSelected: function (evt) {},
            onViewRemoved: function () {},
            resizeToNode: function (parent, what) {

                if (parent && what) {
                    var size = domGeometry.getMarginBox(parent);
                    var dstHeight = size.h;
                    //dstHeight-=30;
                    what.containerNode.style.height = dstHeight + "px";
                    /*
                     what.resize();
                     setTimeout(function () {
                     what.resize();
                     }, 300);*/
                }
            },
            resize: function () {
                this.inherited(arguments);

                if (!this.layoutMain) {
                    return;
                }

                var resizeTo = function (source, target,height,width,force) {

                    target = target.domNode ? target.domNode : target;
                    source = source.domNode ? source.domNode : source;

                    if(height==true) {
                        var targetHeight = $(target).height();
                        $(source).css('height', targetHeight + 'px' + (force==true ? '!important' : ''));
                    }
                    if(width==true){
                        var targetWidth = $(target).width();
                        $(source).css('width', targetWidth + 'px' + (force==true ? '!important' : ''));
                    }
                };


                utils.resizeTo(this.domNode,this.domNode.parentNode,true,true);
                utils.resizeTo(this.layoutMain.domNode,this.domNode,true,true);


                //this.resizeToNode(this.domNode, this.layoutMain);

                this.layoutMain.resize();

                if (this.gridView) {
                    this.gridView.onResize();
                }
                if (this.leftGrid) {
                    this.leftGrid.onResize();
                }
                if (this.aceEditor) {
                    this.aceEditor.resize();
                }


            },
            onChangeToggleSplitterState: function (splitter, state) {
                this.resize();
            },
            onToggleSplitterSplitterMove: function (splitter, state) {
                //this.resize();
            },
            setupToggleSplitterListeners: function () {

                this.layoutMain.publishResizeOnToggleMove = false;

                if (this.layoutLeft && this.layoutLeft._splitterWidget) {
                    this.layoutLeft._splitterWidget.delegate = this;
                }
                if (this.layoutRight && this.layoutRight._splitterWidget) {
                    this.layoutRight._splitterWidget.delegate = this;
                }
                if (this.layoutBottom && this.layoutBottom._splitterWidget) {
                    this.layoutBottom._splitterWidget.delegate = this;
                }
                if (this.layoutTop && this.layoutTop._splitterWidget) {
                    this.layoutTop._splitterWidget.delegate = this;
                }
            },
            startup: function () {

                var thiz = this;
                this.inherited(arguments);
                //pull in ExpressionJavaScript syntax and documentation, we hide here 'require' from the compiler, otherwise its adding 2.9MB to the final layer
                var _re = require;


                if(!this.showBrowser){

                    this.layoutMain.removeChild(this.layoutLeft);

                    thiz.layoutMain.resize();
                    //this.layoutBottom = this.layoutCenter;

                    this.layoutCenter.containerNode.appendChild(this.helpContainer);
                    this.layoutMain.removeChild(this.layoutBottom);
                    utils.destroy(this.layoutBottom);
                    this.layoutBottom = null;

                }
                _re([
                    'xide/widgets/ExpressionJavaScript'], function (ExpressionJavaScript) {
                    thiz.api = ExpressionJavaScript.prototype.api;
                    thiz.setupToggleSplitterListeners();
                    thiz.createWidgets();
                    thiz.onReady();
                    thiz.layoutMain.resize();
                    //thiz.subscribe(types.EVENTS.ON_VIEW_SHOW, thiz.onViewShow);
                    thiz.subscribe(types.EVENTS.RESIZE, thiz.resize);
                });
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

        types.registerWidgetMapping('Script', createScriptWidget());

        types.registerWidgetMapping('Expression', createExpressionWidget());

        types.registerWidgetMapping(types.ECIType.EXPRESSION_EDITOR, createExpressionWidget());




/*
        var view = utils.addWidget(cisRenderer,{
        },null,parent,true);
        view.initWithCIS(CIS.inputs);*/

        ///dialog
        var dialog = new CIActionDialog({
            cis:createDriverCIS().inputs
        });
        dialog.show();
        docker.resize();
        //view.resize();
    }

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



    if (ctx) {

        //blockManager = ctx.getBlockManager();
        //driverManager = ctx.getDriverManager();
        //marantz  = driverManager.getItemById("235eb680-cb87-11e3-9c1a-0800200c9a66");

        //openDriverSettings(null);
        //openCISDialog();

        return declare('a',null,{});
    }

    return Grid;

});