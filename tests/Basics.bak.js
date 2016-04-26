/** @module xgrid/Base **/
define([
    "xdojo/declare",
    'xide/types',
    'xide/utils',
    "xide/tests/TestUtils",
    'xide/views/ACEEditor',
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
    'xaction/Action',
    'xide/mixins/ReloadMixin',
    'xaction/ActionProvider',
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
    'dojo/has!ace-formatters?xide/editor/ace/formatters'

], function (declare,types,utils,
             TestUtils,ACEEditor,TemplatedWidgetBase,EventedMixin,module,


             lang,connect,has, domClass, domConstruct,
             domGeometry, domStyle, ContentPane, _EditorBase, TextEditor,
             factory, ActionSelectWidget,
             MenuItem, cookie, Action, ReloadMixin,ActionProvider,
             SplitViewMixin, Deferred, AceDiff, winUtils,
             Keyboard,ActionToolbar,CheckedMenuItem,_AceMultiDocs,
             CheckBox,
             ActionValueWidget,_ActionValueWidgetMixin,
             formatters


){


    var actions = [],
        thiz = this,
        ACTION_TYPE = types.ACTION,
        ACTION_ICON = types.ACTION_ICON;


    function createACEBaseClass(){


        return declare('ACEBASE',TemplatedWidgetBase,{
            templateString:'<div></div>'
        })


    }

    /**
     *
     * @returns {*}
     */
    function createACEClass2(){


        var _loadedModes = {};//global cache for loaded modes
        var _loadedThemes = {};//global cache for loaded themes
        var aceModes = [
            'abap',
            'actionscript',
            'ada',
            'apache_conf',
            'applescript',
            'asciidoc',
            'assembly_x86',
            'autohotkey',
            'batchfile',
            //'c9search',
            'c_cpp',
            'cirru',
            'clojure',
            'cobol',
            'coffee',
            'coldfusion',
            'csharp',
            'css',
            'curly',
            'd',
            'dart',
            'diff',
            'django',
            'dockerfile',
            'dot',
            'ejs',
            'erlang',
            'forth',
            'ftl',
            'gherkin',
            'gitignore',
            'glsl',
            'golang',
            'groovy',
            'haml',
            'handlebars',
            'haskell',
            'haxe',
            'html',
            'html_ruby',
            'ini',
            'jack',
            'jade',
            'java',
            'javascript',
            'json',
            'jsoniq',
            'jsp',
            'jsx',
            'julia',
            'latex',
            'less',
            'liquid',
            'lisp',
            'livescript',
            'logiql',
            'lsl',
            'lua',
            'luapage',
            'lucene',
            'matlab',
            'makefile',
            'markdown',
            'mel',
            'mushcode',
            'mysql',
            'nix',
            'objectivec',
            'ocaml',
            'pascal',
            'perl',
            'pgsql',
            'php',
            'plain_text',
            'powershell',
            'prolog',
            'protobuf',
            'python',
            'r',
            'rdoc',
            'rhtml',
            'ruby',
            'rust',
            'sass',
            'scad',
            'scala',
            'scheme',
            'scss',
            'sh',
            'sjs',
            'smarty',
            'snippets',
            'soy_template',
            'space',
            'sql',
            'stylus',
            'svg',
            'tcl',
            'tex',
            'text',
            'textile',
            'toml',
            'typescript',
            'twig',
            'vala',
            'vbscript',
            'velocity',
            'verilog',
            'vhdl',
            'xml',
            'xquery',
            'yaml'
        ];

        var Implementation ={
            startup: function () {

                if (this._started) {
                    return;
                }

                //save icon class normal
                this.iconClassNormal = '' + this.iconClass;
                this.set('iconClass', 'fa-spinner fa-spin');
                this.inherited(arguments);

                var thiz = this;

                if (this.value) {

                    this.attachACE(this.value);

                } else {
                    //we have no content yet, call in _TextEditor::getContent, this will be forwarded
                    //to our 'storeDelegate'
                    this.getContent(
                        function (content) {//onSuccess
                            //thiz.set('iconClass', thiz.iconClassNormal);//
                            thiz.lastSavedContent = content;
                            thiz.attachACE(content);
                        },
                        function (error) {//onError
                            thiz.attachACE();
                        }
                    );
                }

                if (!this._item) {
                    this._item = {};
                }
            }
        };


        var Module = declare("xide.views.ACEEditor2", [createACEBaseClass(),EventedMixin],Implementation);

        return Module;

    }

    /**
     *
     * @returns {*}
     */
    function createACEClass(){


        var _loadedModes = {};//global cache for loaded modes
        var _loadedThemes = {};//global cache for loaded themes
        var aceModes = [
            'abap',
            'actionscript',
            'ada',
            'apache_conf',
            'applescript',
            'asciidoc',
            'assembly_x86',
            'autohotkey',
            'batchfile',
            //'c9search',
            'c_cpp',
            'cirru',
            'clojure',
            'cobol',
            'coffee',
            'coldfusion',
            'csharp',
            'css',
            'curly',
            'd',
            'dart',
            'diff',
            'django',
            'dockerfile',
            'dot',
            'ejs',
            'erlang',
            'forth',
            'ftl',
            'gherkin',
            'gitignore',
            'glsl',
            'golang',
            'groovy',
            'haml',
            'handlebars',
            'haskell',
            'haxe',
            'html',
            'html_ruby',
            'ini',
            'jack',
            'jade',
            'java',
            'javascript',
            'json',
            'jsoniq',
            'jsp',
            'jsx',
            'julia',
            'latex',
            'less',
            'liquid',
            'lisp',
            'livescript',
            'logiql',
            'lsl',
            'lua',
            'luapage',
            'lucene',
            'matlab',
            'makefile',
            'markdown',
            'mel',
            'mushcode',
            'mysql',
            'nix',
            'objectivec',
            'ocaml',
            'pascal',
            'perl',
            'pgsql',
            'php',
            'plain_text',
            'powershell',
            'prolog',
            'protobuf',
            'python',
            'r',
            'rdoc',
            'rhtml',
            'ruby',
            'rust',
            'sass',
            'scad',
            'scala',
            'scheme',
            'scss',
            'sh',
            'sjs',
            'smarty',
            'snippets',
            'soy_template',
            'space',
            'sql',
            'stylus',
            'svg',
            'tcl',
            'tex',
            'text',
            'textile',
            'toml',
            'typescript',
            'twig',
            'vala',
            'vbscript',
            'velocity',
            'verilog',
            'vhdl',
            'xml',
            'xquery',
            'yaml'
        ];

        var Implementation ={

            cssClass:'AceEditorPane',
            closeable: true,
            aceEditor: null,
            value: null,
            editorOptions: null,
            fileName: null,
            didStart: false,
            defaultTheme: 'cloud9_night',
            autoSelect: false,
            autoFocus: true,
            iconClassNormal: null,
            lastSavedContent: null,
            cookiePrefix: '',
            statusbar: false,
            hasEmmet: true,
            hasLinking: true,
            hasHelp: true,
            hasGotoLine: true,
            hasSplit: true,
            hasSave:true,
            hasReload:true,
            hasConsole: true,
            consoleNode: null,
            hasShowSnippets: true,
            _item: null,
            hasMaximize:true,
            hasSnippetEditor:true,
            hasEditSettings:true,
            hasTern:false,
            hasMultiDocs:true,
            extraHeightOffset:0,
            createMaximizedToolbar:true,
            _isMaximized:false,
            _lastParent:null,
            _maximizeContainer:null,
            _maximizeToolbar:null,
            allowCache:false,
            addSplitModes: function (widget,actions) {
                this.addSplitMode('None', 'el-icon-eye-open', types.VIEW_SPLIT_MODE.SOURCE, widget,actions,'Home');
                this.addSplitMode('Horizontal', 'layoutIcon-horizontalSplit', types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL, widget,actions,'Home');
                this.addSplitMode('Vertical', 'layoutIcon-verticalSplit', types.VIEW_SPLIT_MODE.SPLIT_VERTICAL, widget,actions,'Home');
                this.addSplitMode('Diff', 'layoutIcon-verticalSplit', 'Diff', widget,actions,'Home');
            },
            _createActions:function(){


                var actions = this.getItemActions();
                this.addActions(actions);
            },
            getItemActions: function () {


                this.getActionStore().allowCache=false;


                var actions = [],
                    thiz = this,
                    getAce = function () {
                        return thiz.getAce();
                    },
                    ace = getAce(),
                    VISIBILITY = types.ACTION_VISIBILITY;



                //reload
                if(this.hasReload) {
                    this.addAction(actions,Action.create('Reload', 'fa-refresh', 'File/Reload', false, null, types.ITEM_TYPE.TEXT, 'File', null, true, function () {
                        thiz.reload()
                    },{
                        accelKey: 'CTRL+L',
                        tab:'Home'
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));
                }



                this.addAction(actions,this.getSplitViewAction(null,actions,'Home'));


                //save
                if(this.hasSave) {
                    this.addAction(actions,Action.create('Save', 'fa-floppy-o', 'File/Save', false, null, types.ITEM_TYPE.TEXT, 'File', null, true, function () {
                            thiz.save()
                        },
                        {
                            accelKey: 'CTRL+S',
                            tab:'Home'
                        }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));
                }


                //maximize
                if(this.hasMaximize) {

                    this.addAction(actions,Action.create('Maximize', 'fa-arrows-alt', 'View/Maximize', false, null, types.ITEM_TYPE.TEXT, 'Zoom', null, true,
                        function () {
                            thiz.maximize();
                        },
                        {
                            accelKey: 'CTRL+F11',
                            tab:'Home'
                        }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));
                }


                //font size +
                this.addAction(actions,Action.create('Increase Font Size', 'fa-search-plus', 'View/Increase Font Size', false, null, types.ITEM_TYPE.TEXT, 'Zoom', null, true,
                    function () {

                        getAce().setFontSize(getAce().getFontSize() + 1);
                        thiz.setPreferences();


                    },
                    {
                        accelKey: 'CTRL+',
                        tab:'Home',
                        width:'150px'
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));

                //font size -
                this.addAction(actions,Action.create('Decrease Font Size', 'fa-search-minus', 'View/Decrease Font Size', false, null, types.ITEM_TYPE.TEXT, 'Zoom', null, true,
                    function () {
                        getAce().setFontSize(getAce().getFontSize() - 1);
                        thiz.setPreferences();
                    },
                    {
                        accelKey: 'CTRL-',
                        tab:'Home'
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}).
                    setVisibility(VISIBILITY.RIBBON, {label: ''}));

                //themes
                var _theme = Action.createDefault('Themes', 'fa-paint-brush', 'View/Themes', 'Appearance', null, {
                    dummy: true,
                    tab:'Home'
                }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}).
                    setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                    setVisibility(VISIBILITY.CONTEXT_MENU, null);

                this.addAction(actions,_theme);

                this._addThemes(actions);


                //modes
                var widget = utils.addWidget(ActionSelectWidget, {
                    item: null,
                    delegate: this,
                    style: 'float:left;',
                    iconClass: 'fa-code',
                    cssClass:'modeSelectWidget'
                }, this,utils.getDoc().createElement('div'), true);
                this._addModes(widget);

                var _modes = Action.createDefault('Syntax', 'fa-code', 'View/Syntax', '_a', null, {
                    dummy: true
                }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {
                    label: '',
                    _widget: widget
                }).setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                    setVisibility(VISIBILITY.CONTEXT_MENU, null);

                this.addAction(actions,_modes);


                //formatters
                if (formatters) {

                    var _format = formatters;
                    var modes = formatters.modes;
                    var formatCode = function (mode) {
                        var editor = thiz.aceEditor;
                        if (editor) {
                            var _value = formatters.format(editor.getEditor(), mode);
                            thiz.setValue(_value);
                        }
                    };

                    var creatorFn = function (label, icon, value) {
                        return Action.create(label, icon, 'Edit/Format/' + label, false, null, 'TEXT', 'viewActions', null, false, function () {
                            formatCode(value);
                        });
                    };
                    var format = Action.createDefault('Format', 'fa-indent', 'Edit/Format', '_a', null, {
                        dummy: true
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}).
                        setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                        setVisibility(VISIBILITY.CONTEXT_MENU, null);

                    this.addAction(actions,format);
                    for (var _f in modes) {
                        actions.push(creatorFn(modes[_f], '', _f));
                    }
                }

                if (this.hasHelp) {
                    //
                    this.addAction(actions,Action.create('Help', 'fa-question', 'Help/Editor Shortcuts', false, null, types.ITEM_TYPE.TEXT, 'help', null, true,
                        function () {
                            thiz.showHelp();
                        },
                        {accelKey: 'CTRL ALT H'}).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));
                }

                if (this.hasSnippetEditor) {
                    //
                    this.addAction(actions,Action.create('Snippets', 'fa-paper-plane', 'View/Show Snippets', false, null, types.ITEM_TYPE.TEXT, 'help', null, true,
                        function () {
                            thiz.editSnippets();
                        }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}));
                }

                if(this.hasEditSettings){




                    var widget = utils.addWidget(ActionSelectWidget, {
                        item: null,
                        delegate: this,
                        iconClass: 'fa-cogs',
                        style:'display:inline-block;width:auto'
                    }, this, dojo.doc.createElement('div'), true);

                    var _modes = Action.createDefault('Settings', 'fa-cogs', 'View/Settings', 'Show', null, {
                        dummy: true,
                        tab:'Home'
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {
                        label: '',
                        _widget: widget
                    }).setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                        setVisibility(VISIBILITY.CONTEXT_MENU, null);


                    _modes.setVisibility(VISIBILITY.RIBBON,{
                        expand:true
                    });



                    /*
                     var gutters = this.createItem('Show Gutter','',true,function(){
                     console.log('show gutter');
                     });*/

                    var _createMenuItem =function(label,option,handler,checked,group){

                        var _ed = thiz.getEditor();

                        var _widget = new CheckedMenuItem({
                            label: label,
                            checked: checked!=null ? checked : true,
                            option:option
                        },utils.getDoc().createElement('div'));

                        _widget.on("click", function () {

                            if(handler){
                                handler(option,_widget);
                            }
                            var _ed = thiz.getEditor();
                            _ed.set(_widget.option,_widget.get('checked'));

                        });
                        widget.fixButton(_widget);

                        var _toggle = Action.createDefault(label, 'fa-cogs', 'View/Settings/'+label, group || 'Show', function(){

                            if(handler){
                                handler(option,_widget);
                            }


                            _ed.set(_widget.option,_widget.get('checked'));

                        },{
                            tab:'Home'
                        });


                        //console.log('option ' + option + _ed.get(option));



                        //for ribbons we collapse into 'Checkboxes'
                        _toggle.setVisibility(VISIBILITY.RIBBON,{
                            widgetClass:declare.classFactory('_CheckedGroup', [ActionValueWidget], null,{
                                iconClass:"",
                                postMixInProperties: function() {
                                    this.inherited(arguments);
                                    this.checked = this.item.get('value') == true;
                                },
                                startup:function(){
                                    this.inherited(arguments);
                                    this.widget.on('change', function (val) {
                                        //thiz.showColumn(id,val);
                                    }.bind(this));
                                }
                            } ,null),
                            widgetArgs:{
                                /*style:'float:right;',*/
                                renderer:CheckBox,
                                checked:_ed.get(option),
                                label:_toggle.label.replace('Show ','')
                            }
                        });


                        actions.push(_toggle);

                        return _widget;
                    };

                    widget.menu.addChild(_createMenuItem('Soft Tabs','softTabs',null,false,'Settings'));
                    widget.menu.addChild(_createMenuItem('Elastic Tabstops','elasticTabstops',null,false,'Settings'));
                    widget.menu.addChild(_createMenuItem('Incremental Search','useIncrementalSearch',null,false,'Settings'));



                    widget.menu.addChild(_createMenuItem('Show Gutters','showGutter',null));
                    widget.menu.addChild(_createMenuItem('Show Intend Guides','showIntentGuides',null));
                    widget.menu.addChild(_createMenuItem('Show Print Margin','showPrintMargin',null));





                    this.addAction(actions,_modes);
                }

                return actions;
            },
            destroy:function(){
                this.inherited(arguments);

                var aceEditor = this.getAce();
                if(aceEditor){
                    aceEditor.destroy();
                }
            },
            enableMultiDocuments:function(){


                //console.log('add file completer');
                /*
                 var completer  = this.addFileCompleter();

                 var text = "var xxxTop = 2*3;";
                 var path = "asdf.js";
                 completer.addDocument(path,text);
                 */



                /*
                 var completeUtil = ace.require("ace/plugins/c9.ide.language/complete_util",function(completeUtil){

                 });
                 */

            },
            editSnippets:function(){


                try {
                    var snippetManager = ace.require("ace/snippets").snippetManager;

                    var _ed = this.getEditor();

                    var sp = _ed.split;
                    if (sp.getSplits() == 2) {
                        sp.setSplits(1);
                        return;
                    }
                    sp.setSplits(1);
                    sp.setSplits(2);
                    sp.setOrientation(sp.BESIDE);
                    var editor = sp.$editors[1];
                    var id = sp.$editors[0].session.$mode.$id || "";
                    var m = snippetManager.files[id];
                    editor.setTheme(this.aceEditor.get('theme'));
                    editor.setValue(m.snippetText);
                }catch(e){
                    console.error('problem: ',e);
                }


            },
            onSingleView: function () {
                var _ed = this.getEditor();
                if (this.diff) {
                    //this.diff.destroy();
                    this.diff = null;
                }
                if (_ed.diffGutter) {
                    utils.destroyWidget(_ed.diffGutter);
                    _ed.diffGutter = null;
                }
            },
            doDiff: function () {


                var _ed = this.getEditor();
                var sp = _ed.split;


                sp.setOrientation(sp.BESIDE);
                sp.setSplits(1);
                if(sp.diffGutter){
                    utils.destroyWidget(sp.diffGutter);

                }
                sp.setSplits(2);

                var leftAce = sp.getEditor(0);
                var leftSession = leftAce.session;
                var rightAce = sp.getEditor(1);
                var rightSession = rightAce.session;

                var value = leftSession.getValue();
                rightSession.setValue(value);

                var diff = new AceDiff();

                var webRoot = this.getWebRoot();
                console.log('web root : ' + webRoot);
                var gutter = domConstruct.create('div', {
                    id: this.id + 'diff-gutter',
                    className: 'acediff-gutter ui-widget-content'
                });



                rightAce.setTheme(this.aceEditor.get('theme'));
                _ed.diffGutter = gutter;
                sp.diffGutter = gutter;

                dojo.place(gutter, leftAce.container, 'after');


                var mode = this._getMode(this.fileName);
                console.log('mode : ' + mode);
                var options = {
                    mode: "ace/mode/" + mode,
                    leftAce: leftAce,
                    rightAce: rightAce,
                    left: {
                        id: "editor1",
                        content: value
                    },
                    right: {
                        content: value
                    },
                    classes: {
                        gutterID: gutter.id
                    }
                };

                var net = ace.require("ace/lib/net"),
                    thiz = this;


                /*
                 <div id="acediff-gutter"><div class="acediff-copy-right"><div class="acediff-new-code-connector-copy" style="top:25.666656494140625px" title="Copy to right" data-diff-index="0">→</div></div><div class="acediff-copy-left"><div class="acediff-deleted-code-connector-copy" style="top:25.666656494140625px" title="Copy to left" data-diff-index="0">←</div><div class="acediff-deleted-code-connector-copy" style="top:218.1665802001953px" title="Copy to left" data-diff-index="1">←</div></div><svg width="60" height="848"><path d="M -1 25.666656494140625 C 30,25.666656494140625 30,25.666656494140625 61,25.666656494140625 L61,25.666656494140625 61,52.33331298828125 M 61 52.33331298828125 C 30,52.33331298828125 30,52.33331298828125 -1,52.33331298828125 L-1,52.33331298828125 -1,25.666656494140625" class="acediff-connector"/><path d="M -1 218.1665802001953 C 30,218.1665802001953 30,218.1665802001953 61,218.1665802001953 L61,218.1665802001953 61,244.83323669433594 M 61 244.83323669433594 C 30,244.83323669433594 30,219.1665802001953 -1,219.1665802001953 L-1,219.1665802001953 -1,218.1665802001953" class="acediff-connector"/></svg></div>
                 */


                function createDiff() {

                    console.log('create diff');
                    diff.create(options);
                    sp.resize();
                    thiz.resize();
                    thiz.diff = diff;
                }

                net.loadScript(webRoot + '/xfile/ext/diff_match_patch.js', function () {
                    createDiff();
                });

            },
            enableLinking:function(){
                var net = ace.require("ace/lib/net");
                var webRoot = this.getWebRoot();
                var thiz = this;

                var _ed = this.getEditor();
                var sp = _ed.split;
                net.loadScript(webRoot + '/xfile/ext/ace2/ext-linking.js', function () {
                    thiz.getAce().setOption("enableLinking", true);
                });
            },
            enableEmmet:function(){
                var net = ace.require("ace/lib/net");
                var webRoot = this.getWebRoot();
                var thiz = this;

                var _ed = this.getEditor();
                net.loadScript(webRoot + '/xfile/ext/ace2/ext-emmet.js', function () {
                    var Emmet = ace.require('ace/ext/emmet');
                    net.loadScript(webRoot + '/xfile/ext/emmet.js', function () {
                        Emmet.setCore(window.emmet);
                        /*env.editor.setOption("enableEmmet", true);*/
                        thiz.getAce().setOption("enableEmmet", true);
                    });
                });
            },
            enableTern:function(){
                var net = ace.require("ace/lib/net");
                var webRoot = this.getWebRoot();
                var thiz = this;

                var _ed = this.getEditor();
                var editor = this.getAce();
                var useWebWorker = true;

                editor.getSession().setUseWrapMode(true);
                editor.getSession().setWrapLimitRange(null, null);

                ace.config.loadModule('ace/ext/language_tools', function() {
                    ace.config.loadModule('ace/ext/tern', function() {
                        editor.setOptions({
                            /**
                             * Either `true` or `false` or to enable with custom options pass object that
                             * has options for tern server: http://ternjs.net/doc/manual.html#server_api
                             * If `true`, then default options will be used
                             */
                            enableTern: {
                                /* http://ternjs.net/doc/manual.html#option_defs */
                                defs: ['browser', 'ecma5'],
                                /* http://ternjs.net/doc/manual.html#plugins */
                                plugins: {
                                    doc_comment: {
                                        fullDocs: true
                                    }
                                },
                                /**
                                 * (default is true) If web worker is used for tern server.
                                 * This is recommended as it offers better performance, but prevents this from working in a local html file due to browser security restrictions
                                 */
                                useWorker: useWebWorker,
                                /* if your editor supports switching between different files (such as tabbed interface) then tern can do this when jump to defnition of function in another file is called, but you must tell tern what to execute in order to jump to the specified file */
                                switchToDoc: function(name, start) {
                                    console.log('switchToDoc called but not defined. name=' + name + '; start=', start);
                                },
                                /**
                                 * if passed, this function will be called once ternServer is started.
                                 * This is needed when useWorker=false because the tern source files are loaded asynchronously before the server is started.
                                 */
                                startedCb: function() {
                                    //once tern is enabled, it can be accessed via editor.ternServer
                                    console.log('editor.ternServer:', editor.ternServer);
                                }
                            },
                            /**
                             * when using tern, it takes over Ace's built in snippets support.
                             * this setting affects all modes when using tern, not just javascript.
                             */
                            enableSnippets: true,
                            /**
                             * when using tern, Ace's basic text auto completion is enabled still by deafult.
                             * This settings affects all modes when using tern, not just javascript.
                             * For javascript mode the basic auto completion will be added to completion results if tern fails to find completions or if you double tab the hotkey for get completion (default is ctrl+space, so hit ctrl+space twice rapidly to include basic text completions in the result)
                             */
                            enableBasicAutocompletion: true
                        });
                    });
                });

                //});
            },
            onReloaded: function () {


                this.enableMultiDocuments();





                //this.doDiff();

                this.resize();
                //this.editSnippets();

                return;
                var webRoot = this.getWebRoot();
                var net = ace.require("ace/lib/net");
                var thiz = this;

                var _ed = this.getEditor();
                var sp = _ed.split;

                var value = "below";

                var newEditor = (sp.getSplits() == 1);
                sp.setOrientation(value == "below" ? sp.BELOW : sp.BESIDE);
                sp.setSplits(2);
                if (newEditor) {

                    var session = sp.getEditor(0).session;
                    var newSession = sp.setSession(session, 1);
                    newSession.name = session.name;
                }

                /*
                 this.addCommands();
                 this.addExtras();
                 */

                return;

                net.loadScript(webRoot + '/xfile/ext/ace2/ext-emmet.js', function () {
                    var Emmet = ace.require('ace/ext/emmet');
                    console.log('did load ace/ext-emmet');
                    //load emmet it self
                    net.loadScript(webRoot + '/xfile/ext/emmet.js', function () {
                        Emmet.setCore(window.emmet);
                        /*env.editor.setOption("enableEmmet", true);*/

                        console.log('set emmet');

                        thiz.getAce().setOption("enableEmmet", true);
                    });
                });

            },
            maximize: function () {

                var node = this.domNode,
                    thiz = this;

                if(!this._isMaximized) {



                    var vp = winUtils.getBox(this.domNode.ownerDocument);
                    var editor = this.getEditor();
                    //var root = dojo.byId('root');
                    var root = $('body')[0];


                    var container = domConstruct.create('div',{
                        className:'ACEContainer ui-widget-content',
                        style:'z-index:300'
                    });
                    this._maximizeContainer=container;

                    root.appendChild(container);

                    if(this.createMaximizedToolbar) {
                        //actionToolbar
                        var actionToolbar = new ActionToolbar({

                        });
                        actionToolbar.startup();
                        container.appendChild(actionToolbar.domNode);
                        var actions = this.getItemActions();
                        actionToolbar.setItemActions({}, actions, {});
                        this._maximizeToolbar = actionToolbar;
                    }

                    domClass.add(node,'AceEditorPaneFullScreen');


                    this._lastParent = node.parentNode;

                    container.appendChild(node);

                    domGeometry.setMarginBox(container, {
                        w: vp.w,
                        h: vp.h
                    });

                    domStyle.set(container, {
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        border:'none medium',
                        width: '100%',
                        height: '100%'
                    });

                    this._isMaximized = true;

                    this.resize();

                }else{

                    this._isMaximized = false;

                    domClass.remove(node,'AceEditorPaneFullScreen');
                    this._lastParent.appendChild(node);

                    utils.destroyWidget(this._maximizeContainer);
                    utils.destroyWidget(this._maximizeToolbar,true);
                    this._maximizeToolbar=null;

                    //click on our dom node will trigger item selection. this is a fake event and
                    //needed to force the applications main view to re-build the toolbar
                    this.publish(types.EVENTS.ON_ITEM_SELECTED, {
                            item: {},
                            owner: this
                        }
                    );

                    if (thiz.onItemClear) {
                        thiz.onItemClear();
                    }
                    if (thiz.onItemClick) {
                        thiz.onItemClick(null);
                    }

                    this.publish(types.EVENTS.ON_ITEM_SELECTED, {
                            item: this._item,
                            owner: this
                        }
                    );

                    this.resize();


                    this.publish(types.EVENTS.RESIZE,null,1500);

                    this.resize();

                }

                this.onMaximized(this._isMaximized);

            },
            onMaximized:function(){},
            resize: function () {
                if(this._isMaximized){

                    var ed = this.getEditor();
                    if (this.hasConsole && this.consoleNode && this.aceEditor) {
                        $(this._maximizeContainer).css('overflow', 'hidden');
                        var ace = this.getAce();
                        var width = $(window).width();
                        var height = $(window).height();
                        $(this._maximizeContainer).css('height',height + 'px');
                        var sizeTotal = {
                            h:height,
                            w:width
                        };
                        var sizeCMD = $(this.consoleNode).height();
                        var aceHeight = sizeTotal.h;
                        aceHeight -=sizeCMD;
                        if(this._maximizeToolbar){
                            var actionToolbarHeight = $(this._maximizeToolbar.domNode).height();
                            aceHeight -=actionToolbarHeight;
                        }
                        aceHeight-=4;
                        $(ed.domNode).css('height',aceHeight + 'px');
                        $(ed.domNode).css('width',width + 'px');
                        if(ed && ed.split) {
                            ed.split.resize();
                        }
                        if (ed.diffGutter) {
                            $(ed.diffGutter).css('height', aceHeight + 'px');
                        }
                    }
                    return;
                }

                this.inherited(arguments);

                if (this.hasConsole && this.consoleNode && this.aceEditor) {
                    var ed = this.getEditor();

                    var sizeCMD = $(this.consoleNode).height();
                    var aceHeight = $(this.domNode).height();
                    var aceWidth = $(this.domNode).width();

                    aceHeight -=sizeCMD;
                    $(ed.domNode).css('height',aceHeight + 'px');
                    $(ed.domNode).css('width',aceWidth+ 'px');
                    if (ed.diffGutter) {
                        $(ed.diffGutter).css('height', aceHeight + 'px');
                    }
                    ed.split.resize();
                }
                //this.publish(types.EVENTS.RESIZE);
            },
            focus: function (evt) {

                //this.inherited(arguments);
                var ed = this.getEditor();
                var _j = $ || jQuery;
                if (ed && evt && _j(evt.target).closest(ed.domNode).length > 0) {
                    //this.getEditor().focus();
                }

            },
            addExtras: function () {
                if (this.hasConsole) {
                    this.createConsole();
                }
                if(this.hasEmmet){
                    this.enableEmmet();
                }
                if(this.hasLinking) {
                    this.enableLinking();
                }

                if(this.hasMultiDocs){
                    this.enableMultiDocuments();
                }
            },
            createConsole: function () {

                var aceEditor = this.getAce();

                var dom = ace.require("ace/lib/dom");
                var event = ace.require("ace/lib/event");

                var EditSession = ace.require("ace/edit_session").EditSession;
                var UndoManager = ace.require("ace/undomanager").UndoManager;
                var Renderer = ace.require("ace/virtual_renderer").VirtualRenderer;
                var Editor = ace.require("ace/editor").Editor;
                /*var MultiSelect = require("ace/multi_select").MultiSelect;*/


                var singleLineEditor = function (el) {
                    var renderer = new Renderer(el);
                    el.style.overflow = "hidden";

                    renderer.screenToTextCoordinates = function (x, y) {
                        var pos = this.pixelToScreenCoordinates(x, y);
                        return this.session.screenToDocumentPosition(
                            Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
                            Math.max(pos.column, 0)
                        );
                    };

                    renderer.$maxLines = 4;

                    renderer.setStyle("ace_one-line");
                    var editor = new Editor(renderer);
                    editor.session.setUndoManager(new UndoManager());

                    editor.setShowPrintMargin(false);
                    editor.renderer.setShowGutter(false);
                    editor.renderer.setHighlightGutterLine(false);
                    editor.$mouseHandler.$focusWaitTimout = 0;
                    editor.session.setUseWorker(true);
                    editor.setOptions({
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: false,
                        enableSnippets: true
                    });


                    //editor.setTheme(this.aceEditor.get('theme'));



                    return editor;
                };

                if (this.consoleNode) {
                    utils.destroyWidget(this.consoleNode);
                }

                var consoleEl = dom.createElement("div");
                this.consoleNode = consoleEl;
                this.containerNode.appendChild(consoleEl);
                consoleEl.style.cssText = "position:absolute; bottom:1px; left:0;width:100%;border:0px solid #baf; z-index:100";
                domClass.add(consoleEl,'ui-widget-content');


                var cmdLine = new singleLineEditor(consoleEl);
                cmdLine.editor = aceEditor;
                aceEditor.cmdLine = cmdLine;

                cmdLine.commands.bindKeys({
                    "Shift-Return|Ctrl-Return|Alt-Return": function (cmdLine) {
                        cmdLine.insert("\n");
                    },
                    "Esc|Shift-Esc": function (cmdLine) {
                        cmdLine.editor.focus();
                    },
                    "Return": function (cmdLine) {
                        var command = cmdLine.getValue().split(/\s+/);
                        var editor = cmdLine.editor;
                        editor.commands.exec(command[0], editor, command[1]);
                        editor.focus();
                    }
                });

                cmdLine.commands.removeCommands(["find", "gotoline", "findall", "replace", "replaceall"]);


            },
            showHelp: function (editor) {

                editor = editor || this.getAce();
                var config = ace.require("ace/config");
                config.loadModule("ace/ext/keybinding_menu", function (module) {
                    module.init(editor);
                    editor.showKeyboardShortcuts();
                });
            },
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
            getWebRoot: function () {

                var webRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);
                return webRoot;
            },
            onShow: function () {

                this.inherited(arguments);

                if (this.autoFocus && this.aceEditor) {
                    this.focus();
                }
            },
            //////////////////////////////////////////////////////////
            //
            //  Minimum bean protocol implementation
            //
            getActiveItem: function () {
                //we actually don't have an item (yet!)
                return null;
            },
            hasItemActions: function () {
                return true;
            },
            getItem: function () {

                return {}; //dummy, needed
            },
            getEditor: function () {
                return this.aceEditor || this;
            },
            getAce: function () {
                if (this.aceEditor) {
                    return this.getEditor().getEditor();
                }
            },
            setSplitMode: function (mode, widget) {

                if(widget) {
                    this._splitMenuWidget.wButton.set('iconClass', '' + widget.iconClass);
                }
                this.splitMode = mode;

                if (!this.doSplit) {

                    if (mode == 'Diff') {
                        this.doDiff();
                        return;
                    }

                    var isSplit = mode == types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL || mode == types.VIEW_SPLIT_MODE.SPLIT_VERTICAL;
                    var _ed = this.getEditor();
                    var sp = _ed.split;

                    if (isSplit) {


                        var newEditor = (sp.getSplits() == 1);
                        sp.setOrientation(mode == types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL ? sp.BELOW : sp.BESIDE);
                        sp.setSplits(2);
                        if (newEditor) {
                            var session = sp.getEditor(0).session;
                            var newSession = sp.setSession(session, 1);
                            newSession.name = session.name;
                        }
                    } else {
                        sp.setSplits(1);
                        this.onSingleView();
                    }
                } else {

                }

            },
            //////////////////////////////////////////////////////////
            //
            //  Model related
            reload: function (item) {
                var thiz = this;
                if (item) {
                    this.dataItem = item;
                }
                var _ready = function (content) {
                    thiz.setValue(content);
                };
                this.getContent(_ready, this.dataItem);
            },
            /**
             * Save content on server
             */
            save: function () {
                return this.saveContent();
            },
            //////////////////////////////////////////////////////////
            //
            //  UI factory related
            //
            _createModeWidget: function (title, mode) {

                var thiz = this;
                var widget = new MenuItem({
                    label: title,
                    checked: false,
                    mode: mode,
                    iconClass: 'fa-code'
                });

                connect.connect(widget, "onClick", function () {
                    thiz.setMode(mode);
                });

                return widget;
            },
            onContentChange: function (changed) {
                var isTab = this.controlButton != null;
                if (isTab) {
                    domClass.toggle(this.controlButton.domNode, 'unsavedContent', changed);
                } else {

                }
            },
            consoleEl: null,
            fakeItem:{},
            didSetFirstContent:false,
            _theme: null,
            createStatusBar: function () {

                var consoleEl = domConstruct.create("div");

                this.containerNode.appendChild(consoleEl);
                consoleEl.style.cssText = "top:1px; right:0;border:1px solid #baf;position:absolute;";
                this.consoleEl = consoleEl;
                try {
                    var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
                    var editor = this.aceEditor.getEditor();
                    new StatusBar(editor, consoleEl);
                } catch (e) {

                }
            },
            attachACE: function (value) {

                this.set('iconClass', this.iconClassNormal);

                var mode = this._getMode(this.fileName),
                    thiz = this,
                    settings = this.getPreferences();


                this.fakeItem = {}

                this.defaultTheme = settings.theme;
                var _options = {
                    region: "center",
                    /*value: value,*/
                    style: "margin: 0; padding: 0; position:relative;overflow: auto;height:inherit;width:inherit;text-align:left;",
                    readOnly: false,
                    tabSize: 2,
                    softTabs: false,
                    wordWrap: false,
                    showPrintMargin: true,
                    highlightActiveLine: true,
                    fontSize: settings.fontSize + 'px',
                    showGutter: true,
                    useWorker: true,
                    className2: 'editor-ace ace_editor',
                    className: 'editor-ace ace_editor',
                    onDidChange: function () {
                        thiz.onContentChange(thiz.getValue() !== thiz.lastSavedContent);
                    },
                    onPrefsChanged: function () {
                        thiz.setPreferences();
                    }

                };
                if (this.editorOptions) {
                    _options = lang.mixin(_options, this.editorOptions);
                }
                var editorPane = new TextEditor(_options, dojo.doc.createElement('div'));

                this.containerNode.appendChild(editorPane.domNode);

                editorPane.startup();

                editorPane.delegate = this;

                this.aceEditor = editorPane;


                this.aceEditor.setOptions();
                this.aceEditor.getEditor().$blockScrolling = true;
                this.getAce().setFontSize(settings.fontSize);

                if (editorPane.split) {
                    editorPane.split.$fontSize = settings.fontSize;
                }

                this.addCommands();
                this.addExtras();
                setTimeout(function () {
                    thiz.setMode(mode);
                    thiz.setTheme(thiz.defaultTheme);

                    factory.publish(types.EVENTS.RESIZE, {}, this);

                    /*
                     if (thiz.autoSelect) {
                     factory.publish(types.EVENTS.ITEM_SELECTED, {
                     owner: thiz,
                     item: thiz.fakeItem
                     }, thiz);
                     }
                     */
                }, 10);

                if (this.statusbar) {
                    this.createStatusBar();
                }

                if(this.hasMaximize) {
                    this.addKeyboardListerner('ctrl f11',this.keyPressDefault(),null,this,function(){
                        thiz.maximize();
                    },this.getAce().container);
                }

                if(this.hasSave) {
                    var params = {
                        prevent_repeat: false,
                        prevent_default: true,
                        is_unordered: false,
                        is_counting: false,
                        is_exclusive: true,
                        is_solitary: false,
                        is_sequence: true
                    };
                    this.addKeyboardListerner('ctrl s',params,null,this,function(){
                        thiz.saveContent();
                    },this.domNode);
                }

                this.setValue(value);

            },
            loadScript: function (url, attributes, readyCB) {
                // DOM: Create the script element
                var jsElm = document.createElement("script");
                // set the type attribute
                jsElm.type = "application/javascript";
                // make the script element load file
                jsElm.src = url;
                jsElm.onload = function () {
                    if (readyCB) {
                        readyCB();
                    }
                };
                // finally insert the element to the body element in order to load the script
                document.body.appendChild(jsElm);
            },
            //////////////////////////////////////////////////////////
            //
            //  Themes related functions
            //
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
            getPreferences: function () {
                var _cookie = this.cookiePrefix + '_ace';

                var settings = null;
                try {
                    settings = JSON.parse(cookie(_cookie));
                } catch (e) {

                    settings = {theme: "ambiance", fontSize: 14};

                    this.setPreferences(settings);
                }

                return settings;
            },
            setPreferences: function (_prefs) {
                var _cookie = this.cookiePrefix + '_ace';
                var prefs = _prefs || {
                        theme: this.aceEditor.get('theme').replace('ace/theme/', ''),
                        fontSize: this.getAce().getFontSize()
                    };
                cookie(_cookie, JSON.stringify(prefs));
            },
            setTheme: function (theme) {

                var thiz = this;
                if (this.ctx && this.ctx.getResourceManager()) {
                    if (!_loadedThemes[theme]) {

                        var themeFile = null;
                        var aceRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.ACE);
                        if (!aceRoot) {

                            var webRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);

                            /*
                             if (has('debug') === true) {
                             webRoot += '/lib/ace/src-min-noconflict/';
                             } else {
                             webRoot += '/xfile/ext/ace/';
                             }*/
                            webRoot += '/xfile/ext/ace/';
                            themeFile = webRoot + '/theme-' + theme + '.js';
                        } else {
                            themeFile = aceRoot + '/theme-' + theme + '.js';
                        }

                        this.loadScript(themeFile, null, function () {
                            _loadedThemes[theme] = true;
                            thiz.aceEditor.set('theme', theme);
                            thiz.setPreferences();

                            var _ace = thiz.getAce();
                            if(_ace.cmdLine){
                                _ace.cmdLine.setTheme("ace/theme/" + theme);
                            }
                        });
                    } else {
                        thiz.aceEditor.set('theme', theme);
                    }



                } else {
                    console.error('have no resource manager!!!');
                }
            },
            _createThemeWidget: function (title, theme) {

                var thiz = this;
                var widget = new MenuItem({
                    label: title,
                    checked: false,
                    theme: theme
                });
                connect.connect(widget, "onClick", function () {
                    thiz.setTheme(theme);
                    this.setPreferences();
                });
                return widget;
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
            //////////////////////////////////////////////////////////
            //
            //  Mode related functions
            //
            setMode: function (mode) {

                if (this.ctx && this.ctx.getResourceManager()) {

                    var thiz = this;
                    if (!_loadedModes[mode]) {

                        var modeFile = null;

                        var aceRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.ACE);
                        if (!aceRoot) {
                            var webRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);

                            if (has('debug') === true) {
                                webRoot += '/lib/ace/src-min-noconflict/'
                            } else {
                                webRoot += '/xfile/ext/ace/'
                            }
                            modeFile = webRoot + '/mode-' + mode + '.js';
                        } else {
                            modeFile = aceRoot + '/mode-' + mode + '.js';
                        }

                        this.loadScript(modeFile, null, function () {
                            _loadedModes[mode] = true;//update cache
                            thiz.aceEditor.set('mode', mode);
                            if(thiz.hasTern){
                                thiz.enableTern();
                            }
                        });
                    }

                    this.aceEditor.set('mode', mode);
                } else {
                    console.error('have no resource manager!');
                }
            },
            _addModes: function (widget) {

                var _modes = [],
                    thiz = this;

                var modeOptions = [];
                var maxOptionsColumn = 15;
                var firstOption = 0;
                var max = 0;
                for (var i = 0; i < aceModes.length; i++) {
                    modeOptions.push('<li><a>' + aceModes[i] + '</a></li>');
                }
                var html = '<table class="options-menu ui-widget-content"><tr>';
                while (true) {
                    html += '<td><ul>';
                    if ((modeOptions.length - firstOption) < maxOptionsColumn) {
                        max = modeOptions.length;
                    } else {
                        max = firstOption + maxOptionsColumn;
                    }
                    var currentcolumn = modeOptions.slice(firstOption, max);

                    for (var i = 0; i < currentcolumn.length; i++) {
                        html += currentcolumn[i];
                    }

                    html += '</ul></td>';
                    firstOption = firstOption + maxOptionsColumn;
                    if (firstOption >= modeOptions.length) {
                        break;
                    }
                }

                html += '</tr></table>';

                //modeAction.widgetClass = MenuItem;

                /*
                 modeAction.widgetArgs = {
                 innerHTML:html
                 }

                 */


                var modeWidget = new MenuItem({
                    label: 'No Title'
                });
                widget.menu.addChild(modeWidget);
                modeWidget.domNode.innerHTML = html;
                domClass.add(modeWidget.domNode, 'options-menu');
                domClass.add(modeWidget.domNode, 'ui-widget-content');

                modeWidget.on('click', function (e) {
                    var newMode = e.target.text;
                    if (newMode) {
                        thiz.setMode(newMode);
                    }
                });


            },
            //////////////////////////////////////////////////////////
            //
            //  Editor protocol minimal impl.
            //
            getSession: function () {
                return this.editorSession;
            },
            /**
             * @returns {string}
             */
            getValue: function () {
                return this.aceEditor.get('value');
            },
            setValue: function (value) {

                var res = null;
                if (this.aceEditor) {
                    res = this.aceEditor.set('value', value);
                } else {
                    console.error('ACEEditor::setValue failed, invalid state');
                }
                this._emit('setContent',{
                    value:value
                });

                if(!this.didSetFirstContent){
                    this._emit('setFirstContent',{
                        value:value
                    });
                    this.didSetFirstContent=true;
                }
                return res;
            },
            //////////////////////////////////////////////////////////
            //
            //  Utils
            //
            _getMode: function (fileName) {

                fileName = fileName || this.fileName;
                var ext = 'javascript';
                if (fileName) {

                    ext = utils.getFileExtension(fileName) || 'js';

                    if (ext === 'js' || ext === 'xblox') {
                        ext = 'javascript';
                    }

                    if (ext === 'h' || ext === 'cpp') {
                        ext = 'c_cpp';
                    }

                    if (ext === 'html' || ext === 'cfhtml' || ext === 'dhtml') {
                        ext = 'html';
                    }
                    if (ext === 'cp') {
                        ext = 'xml';
                    }
                    if (ext === 'md') {
                        ext = 'markdown';
                    }
                    if (ext === 'hbs') {
                        ext = 'handlebars';
                    }
                }
                return ext;
            },
            startup: function () {
                if (this.didStart) {
                    return;
                }
                this.didStart = true;

                //save icon class normal
                this.iconClassNormal = '' + this.iconClass;
                this.set('iconClass', 'fa-spinner fa-spin');
                this.inherited(arguments);
                this.initReload();
                var thiz = this;
                if (this.value) {
                    this.attachACE(this.value);
                } else {
                    //we have no content yet, call in _TextEditor::getContent, this will be forwarded
                    //to our 'storeDelegate'
                    this.getContent(
                        function (content) {//onSuccess
                            //thiz.set('iconClass', thiz.iconClassNormal);//
                            thiz.lastSavedContent = content;
                            thiz.attachACE(content);
                        },
                        function (error) {//onError
                            thiz.attachACE();
                        }
                    );
                }
                if (!this._item) {
                    this._item = {};
                }

                this._createActions();

                this.on('click', function () {

                    /*
                     //click on our dom node will trigger item selection. this is a fake event and
                     //needed to force the applications main view to re-build the toolbar
                     this.publish(types.EVENTS.ON_ITEM_SELECTED, {
                     item: this.item,
                     owner: this
                     }
                     );
                     */

                    if (thiz.onItemClear) {
                        thiz.onItemClear();
                    }
                    if (thiz.onItemClick) {
                        thiz.onItemClick(null);
                    }
                });
            }
        };


        var Module = declare("xide.views.ACEEditor", [ContentPane,_EditorBase, ReloadMixin, SplitViewMixin,Keyboard,_AceMultiDocs,ActionProvider],Implementation);

        return Module;

    }

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
            value:'trasdfasd',
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

    function doTests(){

        var tab = TestUtils.createTab('ACE-TEST',null,module.id);

        var aceClass = createACEClass2();

        createACE(tab,{},aceClass,'asdfasdf');


        setTimeout(function(){

        },1000);
    }

    var ctx = window.sctx;

    if (ctx) {

        //return declare('a',null,{});

        doTests();

    }

    return declare('a',null,{});

});