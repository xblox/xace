/** @module xgrid/Base **/
define([
    "xdojo/declare",
    'xide/types',
    'xide/utils',
    'xide/factory',
    "xide/tests/TestUtils",
    "module",
    'xace/views/ACEEditor',
    'xace/views/Editor',
    'dojo/has!ace-formatters?xide/editor/ace/formatters'

], function (declare,types,utils,factory,
             TestUtils,module,
             ACEEditor,
             Editor,
             formatters){







    var EDITOR_SETTINGS = 'Editor/Settings',
        INCREASE_FONT_SIZE = 'View/Increase Font Size',
        DECREASE_FONT_SIZE = 'View/Decrease Font Size',
        EDITOR_HELP = 'Help/Editor Shortcuts',
        EDITOR_THEMES = 'View/Themes',
        SNIPPETS = 'Editor/Snippets',
        EDITOR_CONSOLE = 'Editor/Console',
        KEYBOARD = 'Editor/Keyboard',
        FORMAT = 'File/Format',
        LAYOUT = 'View/Layout',
        ACTION = types.ACTION;



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


        var item = {
            mount:'workspace',
            path:'./index.less'
        };

        var args = {

            item:item,
            delegate:this,
            style:'padding:0px;',
            iconClass:'fa-code',
            autoSelect:true,
            value:value,
            ctx:ctx,
            /***
             * Provide a text editor store delegate
             */
            title:title
        };

        /***
         * Provide a text editor store delegate
         */
        args.storeDelegate={
            getContent:function(onSuccess){
                return ctx.getFileManager().getContent(item.mount,item.path,onSuccess);
            },
            saveContent:function(value,onSuccess,onError){
                return ctx.getFileManager().setContent(item.mount,item.path,value,onSuccess);
            }
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

        setTimeout(function(){
            factory.publish(types.EVENTS.RESIZE);
        },2000);
        return editor;

    }




    function doEditorTests(editor){
        //editor.showToolbar(false);
        ctx.getWindowManager().registerView(editor,true);
    }

    function runAction(_action){

        var action  = this.getAction(_action);
        if(!action){
            return;
        }

        var self = this,
            command = action.command,
            ACTION = types.ACTION,
            editor = this.getEditor();



        switch (command) {
            case EDITOR_HELP:{
                self.showHelp();
                break;
            }
            case ACTION.MAXIMIZE:{
                return this.maximize();
            }
            case ACTION.FIND:{

                var net = ace.require("ace/lib/net");
                var webRoot = this.getWebRoot();
                var sb = editor.searchBox;
                function _search(sb){
                    sb.show(editor.session.getTextRange(), null);
                }

                if(sb){
                    _search(sb);
                }else {
                    net.loadScript(webRoot + '/xfile/ext/ace2/ext-searchbox.js', function (what) {
                        var sbm = ace.require("ace/ext/searchbox");
                        _search(new sbm.SearchBox(editor));
                    });
                }
                break;
            }
        }


        //themes
        if(command.indexOf(EDITOR_THEMES)!=-1){
            self.set('theme',action.theme);
        }

        if(command.indexOf(LAYOUT)!=-1){
            self.setSplitMode(action.option, null);
        }
        if(command.indexOf(KEYBOARD)!=-1){

            var option = action.option;

            var keybindings = {
                ace: null, // Null = use "default" keymapping
                vim: ace.require("ace/keyboard/vim").handler,
                emacs: "ace/keyboard/emacs"

            };
            editor.setKeyboardHandler(keybindings[action.option]);

        }


        if(command.indexOf(EDITOR_SETTINGS)!=-1){

            var option = editor.getOption(action.option),
                isBoolean = _.isBoolean(option);

            if(option==null){
                console.error('option does not exists! ' + action.option);
            }

            if(isBoolean){
                editor.setOption(action.option,!option);
            }else{
                editor.setOption(action.option,false);
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
            keycombo:'ctrl r'
        }));


        actions.push(this.createAction({
            label:'Save',
            command:ACTION.SAVE,
            icon:ICON.SAVE,
            keycombo:'ctrl s',
            group:'File'
        }));

        actions.push(this.createAction({
            label:'Find',
            command:ACTION.FIND,
            icon:ICON.SEARCH,
            keycombo:'ctrl f',
            group:'Search'
        }));

        actions.push(this.createAction({
            label:'Maximize',
            command:ACTION.MAXIMIZE,
            icon:ICON.MAXIMIZE,
            keycombo:'ctrl f11',
            group:'View'
        }));

        actions.push(this.createAction({
            label:'Undo',
            command:ACTION.UNDO,
            icon:ICON.UNDO,
            keycombo:'ctrl z',
            group:'Edit'
        }));

        actions.push(this.createAction({
            label:'Undo',
            command:ACTION.REDO,
            icon:ICON.REDO,
            keycombo:'ctrl shift z',
            group:'Edit'
        }));



        actions.push(this.createAction({
            label:'Increase Fontsize',
            command:INCREASE_FONT_SIZE,
            icon:'fa-text-height',
            group:'View'
        }));

        actions.push(this.createAction({
            label:'Decrease Fontsize',
            command:DECREASE_FONT_SIZE,
            icon:'fa-text-height',
            group:'View'
        }));

        actions.push(this.createAction({
            label:'Themes',
            command:EDITOR_THEMES,
            icon:'fa-paint-brush',
            group:'View'
        }));

        this._addThemes(actions);


        actions.push(this.createAction({
            label:'Help',
            command:EDITOR_HELP,
            icon:'fa-question',
            keycombo:'f1'
        }));


        actions.push(this.createAction({
            label:'Snippets',
            command:SNIPPETS,
            icon:'fa-paper-plane',
            group:"Show"
        }));

        actions.push(this.createAction({
            label:'Console',
            command:EDITOR_CONSOLE,
            icon:'fa-terminal',
            group:'Show'
        }));



        ///editor settings
        actions.push(this.createAction({
            label:'Settings',
            command:EDITOR_SETTINGS,
            icon:'fa-cogs',
            group:"Settings"
        }));

        function _createSettings(label,command,icon,option,mixin,group){

            command = command || EDITOR_SETTINGS + '/' + label;

            mixin = mixin || {};

            actions.push(self.createAction({
                label:label,
                command:command,
                icon: icon || 'fa-cogs',
                group:group || "Settings",
                mixin:utils.mixin({
                    addPermission:true,
                    option:option
                },mixin)
            }));

        }

        _createSettings('Show Gutters',null,null,'showGutter');
        _createSettings('Show Print Margin',null,null,'printMargin');
        _createSettings('Display Intend Guides',null,null,'displayIndentGuides');
        _createSettings('Show Line Numbers',null,null,'showLineNumbers');

        _createSettings('Show Invisibles',null,null,'showInvisibles');

        _createSettings('Use Soft Tabs',null,null,'useSoftTabs');

        _createSettings('Use Elastic Tab Stops',null,null,'useElasticTabstops');
        _createSettings('Animated Scroll',null,null,'animatedScroll');


        /*
        var keybindings = {
            ace: null, // Null = use "default" keymapping
            vim: ace.require("ace/keyboard/vim").handler,
            emacs: "ace/keyboard/emacs"
        };
*/



        actions.push(this.createAction({
            label:'Keyboard',
            command:KEYBOARD,
            icon:'fa-keyboard-o',
            group:"Settings"
        }));

        _createSettings('Default',KEYBOARD +'/Default',null,'ace');
        _createSettings('Vim',KEYBOARD +'/Vim',null,'vim');
        _createSettings('EMacs',KEYBOARD +'/EMacs',null,'emacs');

        if(formatters){

            actions.push(this.createAction({
                label:'Format',
                command:FORMAT,
                icon:'fa-indent',
                group:"Edit"

            }));

            var modes = formatters.modes;
            for (var _f in modes) {
                var _label = modes[_f].replace('(JS Beautify)','');
                actions.push(_createSettings(_label, FORMAT + '/' +_label,null, _f,null,'Edit'));
            }
        }


        //layout
        actions.push(_createSettings('Layout','View/Layout',null,types.VIEW_SPLIT_MODE.SOURCE,null,'View'));
        actions.push(_createSettings('Horizontal','View/Layout/Horizontal',null,types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL,null,'View'));
        actions.push(_createSettings('Vertical','View/Layout/Vertical',null,types.VIEW_SPLIT_MODE.SPLIT_VERTICAL,null,'View'));
        actions.push(_createSettings('Diff','View/Layout/Diff',null,'Diff',null,'View'));




        return actions;

    }

    function createEditorClass(){


        return declare('Editor',Editor,{

                createMaximizedToolbar:false,
                destroy:function(){
                    this.inherited(arguments);
                    utils.destroy(this._maximizeContainer);

                },
                onSingleView:function(){},

                setSplitMode: function (mode) {


                    this.splitMode = mode;
                    if (!this.doSplit) {
                        if (mode == 'Diff') {
                            this.doDiff();
                            return;
                        }

                        var isSplit = mode == types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL || mode == types.VIEW_SPLIT_MODE.SPLIT_VERTICAL;
                        var _ed = this.getEditor();
                        var sp = this.split;
                        if (isSplit) {

                            var newEditor = (sp.getSplits() == 1);
                            sp.setOrientation(mode == types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL ? sp.BELOW : sp.BESIDE);
                            sp.setSplits(2);
                            if (newEditor) {
                                var session = sp.getEditor(0).session;
                                var newSession = sp.setSession(session, 1);
                                newSession.name = session.name;
                                var options = _ed.getOptions();
                                sp.getEditor(1).setOptions(options);


                            }
                        } else {
                            sp.setSplits(1);
                            this.onSingleView();
                        }
                    }

                },
                runAction:function(action){
                    return runAction.apply(this,[action]);
                },
                getActions:function(){
                    return getActions.apply(this,this.permissions);
                },
                startup:function(){
                    if(this._started){
                        return;
                    }
                    this.inherited(arguments);
                }
            }
        );
    }



    function doTests(){


        var tab = TestUtils.createTab('ACE-TEST',null,module.id);


        //createEditorClass()||
        var _class = createEditorClass();

        var editor = createACE(tab,{
            ctx:ctx,
            menuOrder: {
                'File': 110,
                'Edit': 100,
                'View': 60,
                'Help': 50,
                'Editor': 40
            },
            permissions:[
                ACTION.RELOAD,
                ACTION.SAVE,
                ACTION.FIND,
                ACTION.MAXIMIZE,
                KEYBOARD,
                INCREASE_FONT_SIZE,
                DECREASE_FONT_SIZE,
                EDITOR_THEMES,
                'Help/Editor Shortcuts',
                SNIPPETS,
                EDITOR_CONSOLE,
                ACTION.TOOLBAR,
                EDITOR_SETTINGS,
                FORMAT,
                ACTION.CLIPBOARD,
                ACTION.UNDO,
                ACTION.REDO
            ],
            options:{
                fileName:'test.js'
            }
        },_class,null);


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