/** @module xgrid/Base **/
define([
    "xdojo/declare",
    'xide/types',
    'xide/utils',
    "xide/tests/TestUtils",
    'xide/widgets/TemplatedWidgetBase',

    'xide/mixins/EventedMixin',

    "module",



    "dojo/_base/lang",
    'dojo/_base/connect',
    'dojo/has',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-geometry',
    'dojo/dom-style',
    'xide/layout/ContentPane',
    'xide/views/_EditorBase',
    'xide/views/TextEditor',

    'xide/factory',
    'xide/widgets/ActionSelectWidget',
    'dijit/MenuItem',
    "dojo/cookie",
    'xide/bean/Action',
    'xide/mixins/ReloadMixin',
    'xide/mixins/ActionProvider',
    'xide/views/SplitViewMixin',
    'dojo/Deferred',
    'xide/views/AceDiff',
    "dojo/window", // winUtils.getBox winUtils.scrollIntoView
    'xide/Keyboard',
    'xide/widgets/ActionToolbar',
    'dijit/CheckedMenuItem',
    'xide/views/_AceMultiDocs',

    'dijit/form/CheckBox',
    'xide/widgets/ActionValueWidget',
    'xide/widgets/_ActionValueWidgetMixin',

    'xace/views/ACEEditor',
    'xace/views/_Split',

    'xace/views/Editor',
    'xide/action/Toolbar',

    'xide/action/DefaultActions',

    'dojo/has!ace-formatters?xide/editor/ace/formatters'

], function (declare,types,utils,
             TestUtils,TemplatedWidgetBase,EventedMixin,module,
             lang,connect,has, domClass, domConstruct,
             domGeometry, domStyle, ContentPane, _EditorBase, TextEditor,
             factory, ActionSelectWidget,
             MenuItem, cookie, Action, ReloadMixin,ActionProvider,
             SplitViewMixin, Deferred, AceDiff, winUtils,
             Keyboard,ActionToolbar,CheckedMenuItem,_AceMultiDocs,
             CheckBox,
             ActionValueWidget,_ActionValueWidgetMixin,ACEEditor,
             _Split,Editor,Toolbar,DefaultActions,
             formatters


){

    /**
     *
     * @returns {*}
     */
    function createACE(tab,mixin,editorClass,value){

        var thiz=this,
            mainView = ctx.mainView,
            title = 'bla',
            docker = mainView.getDocker(),
            registerInWindowManager = true;

        var root = tab;

        mixin = mixin || {};


        var args = {

            item:null,
            filePath:'a.js',
            delegate:this,
            style:'padding:0px;',
            iconClass:'fa-code',
            autoSelect:true,
            value:'trasdfasd'||value,
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
            title:title,
            closable:true,
            fileName:'bla.js'
        };

        if(mixin){
            utils.mixin(args,mixin);
        }

        var editor = utils.addWidget(editorClass || ACEEditor,args,this,root,true,null,null,true);
        if(value){
            //editor.setValue(value);
        }
        tab.resize();
        editor.resize();

        return editor;

    }

    function doEditorTests(editor){

        editor.showToolbar(true);


        //ctx.getWindowManager().registerView(editor,true);

    }

    function runAction(_action){

        var action  = this.getAction(_action);
        if(!action){
            return;
        }

        var self = this,
            command = action.command,

            editor = this.getEditor();



        switch (command) {
            case 'Help/Editor Shortcuts':{
                self.showHelp();
            }
        }

        console.log('run action : ' + action.command);


        //return this.inherited(arguments);

    }

    function getActions(permissions){



        var actions = [],
            self = this,
            ACTION = types.ACTION,
            ICON = types.ACTION_ICON,
            VISIBILITY = types.ACTION_VISIBILITY;


        actions.push(this.createAction({
            label:'Reload',
            command:ACTION.RELOAD,
            icon:ICON.RELOAD,
            keycombo:'ctrl l'
        }));


        actions.push(this.createAction({
            label:'Save',
            command:ACTION.SAVE,
            icon:ICON.SAVE,
            keycombo:'ctrl s'
        }));

        actions.push(this.createAction({
            label:'Increase Fontsize',
            command:'View/Increase Font Size',
            icon:'fa-text-height'
        }));

        actions.push(this.createAction({
            label:'Decrease Fontsize',
            command:'View/Decrease Font Size',
            icon:'fa-text-height'
        }));

        actions.push(this.createAction({
            label:'Themes',
            command:'View/Themes',
            icon:'fa-paint-brush'
        }));

        this._addThemes(actions);



        actions.push(this.createAction({
            label:'Help',
            command:'Help/Editor Shortcuts',
            icon:'fa-question',
            keycombo:'f1'
        }));


        actions.push(this.createAction({
            label:'Help',
            command:'Editor/Snippets',
            icon:'fa-paper-plane'
        }));

        actions.push(this.createAction({
            label:'Help',
            command:'Editor/Console',
            icon:'fa-terminal'
        }));


        ///editor settings

        actions.push(this.createAction({
            label:'Settings',
            command:'Editor/Settings',
            icon:'fa-cogs'
        }));




        function _createSettings(label,command,icon,option,value,mixin){

            command = command || 'Editor/Settings/' + label;

            mixin = mixin || {};

            actions.push(self.createAction({
                label:label,
                command:command,
                icon: icon || 'fa-cogs',
                option:option,
                value:value,
                mixin:utils.mixin({
                    addPermission:true,
                    isACEOption:true
                },mixin)
            }));

        }

        _createSettings('Show Gutters',null,null,'showGutter',true);



        return actions;

    }

    function createEditorClass(){

        var ACTION = types.ACTION;

        var _class = declare('Editor',[Editor,Toolbar], {

                addCommands: function () {

                    var aceEditor = this.getAce(),
                        thiz = this;

                    var config = ace.require("ace/config");
                    config.init();

                    var commands = [];
                    if (this.hasHelp) {
                        commands.push({
                            name: "showKeyboardShortcuts",
                            bindKey: {win: "Ctrl-Alt-h", mac: "Command-Alt-h"},
                            exec: function (editor) {
                                thiz.showHelp(editor);
                            }
                        });
                    }

                    if (this.hasConsole) {
                        commands.push({
                            name: "gotoline",
                            bindKey: {win: "Ctrl-L", mac: "Command-L"},
                            exec: function (editor, line) {
                                if (typeof line == "object") {
                                    var arg = this.name + " " + editor.getCursorPosition().row;
                                    editor.cmdLine.setValue(arg, 1);
                                    editor.cmdLine.focus();
                                    return;
                                }
                                line = parseInt(line, 10);
                                if (!isNaN(line))
                                    editor.gotoLine(line);
                            },
                            readOnly: true
                        });
                    }


                    aceEditor.commands.addCommands(commands);


                },
                showHelp: function (editor) {

                    editor = editor || this.getEditor();

                    var config = ace.require("ace/config");
                    config.loadModule("ace/ext/keybinding_menu", function (module) {
                        module.init(editor);
                        editor.showKeyboardShortcuts();
                    });

                },
                runAction:function(action){
                    return runAction.apply(this,[action]);
                },

                getThemeData: function () {
                    return [
                        ["Chrome"],
                        ["Clouds"],
                        ["Crimson Editor"],
                        ["Dawn"],
                        ["Dreamweaver"],
                        ["Eclipse"],
                        ["GitHub"],
                        ["Solarized Light"],
                        ["TextMate"],
                        ["Tomorrow"],
                        ["XCode"],
                        ["Kuroir"],
                        ["KatzenMilch"],
                        ["Ambiance", "ambiance", "dark"],
                        ["Day", "cloud9_day"],
                        ["Night", "cloud9_night"],
                        ["Chaos", "chaos", "dark"],
                        ["Midnight", "clouds_midnight", "dark"],
                        ["Cobalt", "cobalt", "dark"],
                        ["idle Fingers", "idle_fingers", "dark"],
                        ["krTheme", "kr_theme", "dark"],
                        ["Merbivore", "merbivore", "dark"],
                        ["Merbivore-Soft", "merbivore_soft", "dark"],
                        ["Mono Industrial", "mono_industrial", "dark"],
                        ["Monokai", "monokai", "dark"],
                        ["Pastel on dark", "pastel_on_dark", "dark"],
                        ["Solarized Dark", "solarized_dark", "dark"],
                        ["Terminal", "terminal", "dark"],
                        ["Tomorrow-Night", "tomorrow_night", "dark"],
                        ["Tomorrow-Night-Blue", "tomorrow_night_blue", "dark"],
                        ["Tomorrow-Night-Bright", "tomorrow_night_bright", "dark"],
                        ["Tomorrow-Night-80s", "tomorrow_night_eighties", "dark"],
                        ["Twilight", "twilight", "dark"],
                        ["Vibrant Ink", "vibrant_ink", "dark"]
                    ];
                },
                _addThemes: function (actions) {

                    var themes = this.getThemeData(),
                        thiz = this;

                    var creatorFn = function (label, icon, value) {

                        //console.log('add theme: label = '+label +' | value = ' + value);
                        var _theme = Action.create(label, icon, 'View/Themes/' + label, false, null, 'TEXT', 'Appearance', null, false, function () {
                            thiz.setTheme(value);
                        },{
                            tab:'Home'
                        });
                        return _theme;
                    };

                    //clean and complete theme data
                    var aceThemes = [];
                    for (var i = 0; i < themes.length; i++) {
                        var data = themes[i];

                        var name = data[1] || data[0].replace(/ /g, "_").toLowerCase();
                        var theme = creatorFn(data[0], '', name);
                        actions.push(theme);

                    }
                },
                permissions:[
                    ACTION.RELOAD,
                    ACTION.SAVE,
                    'View/Increase Font Size',
                    'View/Decrease Font Size',
                    'View/Themes',
                    'Help/Editor Shortcuts',
                    'Editor/Snippets',
                    'Editor/Console',
                    'Editor/Settings'
                ],

                //////////////////////////////////////////////////////////////////
                //
                //
                //
                templateString: '<div data-dojo-attach-point="template" class="grid-template widget" style="width: 100%;height: 100%;overflow: hidden;position: relative;padding: 0px;margin: 0px">' +
                '<div data-dojo-attach-point="header" class="view-header row" style="height: 30px;"></div>' +
                '<div data-dojo-attach-point="aceNode" class="view-body row" style="height:100%;width: 100%;position: absolute;top:0;left: 0;"></div>' +
                '<div data-dojo-attach-point="footer" class="view-footer" style="position: absolute;bottom: 0px;width: 100%"></div>' +
                '</div>',

                resize:function(){

                    var thiz = this;


                    var toolbar = this.getToolbar(),
                        noToolbar = false,
                        topOffset = 0,
                        aceNode = $(this.aceNode);

                    if(toolbar && toolbar.isEmpty()){
                        $(thiz.header).css('display','none');
                        noToolbar = true;
                    }else{

                        if(toolbar) {
                            var $toolbar = $(toolbar.domNode);
                            var bottom = $toolbar.position().top + $toolbar.outerHeight(true);
                            topOffset = bottom;
                        }
                    }



                    var totalHeight = $(thiz.domNode).height();

                    var topHeight = noToolbar==true ? 0 : $(thiz.header).height();

                    var footerHeight = $(thiz.footer).height();

                    var finalHeight = totalHeight - topHeight - footerHeight;

                    finalHeight-=5;



                    if (finalHeight > 50) {
                        aceNode.height(finalHeight + 'px');
                    } else {
                        aceNode.height('inherited');
                    }

                    aceNode.css('top',topOffset);



                    return this.inherited(arguments);
                },
                startup:function(){


                    this.inherited(arguments);

                    if (this.permissions) {
                        var _defaultActions = DefaultActions.getDefaultActions(this.permissions, this,this);
                        _defaultActions = _defaultActions.concat(getActions.apply(this,this.permissions));
                        this.addActions(_defaultActions);
                    }


                    var toolbar  = this.getToolbar();
                    if(toolbar){

                    }

                }

            }
        );





        return _class;

    }






    function doTests(){

        var tab = TestUtils.createTab('ACE-TEST',null,module.id);

        var editor = createACE(tab,{
            toolbarInitiallyHidden:true,
            options:{
                fileName:'test.js'
            }
        },createEditorClass(),'blab balsdfasdf');

        setTimeout(function(){
            doEditorTests(editor);
        },1000);
    }

    var ctx = window.sctx;

    if (ctx) {
        doTests();

    }

    return declare('a',null,{});

});