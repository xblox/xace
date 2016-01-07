define([
    'dcl/dcl',
    'dojo/has',
    'dojo/dom-construct',
    'xide/utils',
    'xide/types',
    'xide/widgets/TemplatedWidgetBase',
    './_Split',
    'xide/action/DefaultActions'

], function (dcl,has,domConstruct,
             utils, types, TemplatedWidgetBase,Splitter,DefaultActions)
{

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

    var containerClass = dcl([TemplatedWidgetBase],{
        resizeToParent:true,
        templateString:'<div attachTo="aceNode" style="width: 100%;height: 100%" class=""></div>'
    });

    /**
     *
     */
    var EditorInterfaceImplementation = dcl(null,{
        declaredClass:'xace/views/EditorInterface',
        editorSession:null,
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
        setMode: function (mode,_ctx,cb) {

            var ctx = _ctx || this.ctx;

            if (ctx && ctx.getResourceManager()) {

                var thiz = this;


                if (!_loadedModes[mode]) {

                    var modeFile = null;

                    var aceRoot = ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.ACE);
                    if (!aceRoot) {

                        var webRoot = ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);

                        if (has('debug') === true) {
                            //webRoot += '/lib/ace/src-min-noconflict/'
                            webRoot += '/xfile/ext/ace/';
                        } else {
                            webRoot += '/xfile/ext/ace/'
                        }
                        modeFile = webRoot + '/mode-' + mode + '.js';
                    } else {
                        modeFile = aceRoot + '/mode-' + mode + '.js';
                    }

                    this.loadScript(modeFile, null, function () {
                        _loadedModes[mode] = true;//update cache

                        thiz.set('mode', mode);
                        cb && cb(mode);

                    });
                }else {
                    thiz.set('mode', mode);
                    cb && cb(mode);
                }

            } else {
                console.error('have no resource manager!');
            }
        },
        get:function(what){
            if(what==='value'){
                var self = this,
                    editor = self.getEditor(),

                    session = editor ? editor.session : null;

                return session ? session.getValue() : null;

            }
            return this.inherited(arguments);
        },
        set: function (key, value) {

            var self = this,
                editor = this.getEditor(),
                session = this.editorSession;

            if(key ==='iconClass'){
                var _parent = this._parent;
                if(_parent && _parent.icon){
                    this._parent.icon(value);
                }
            }

            if(editor && session) {
                //console.log('set ace option ' + key,value);
                var node = editor.container;
                if(key =='item'){
                    session.setUseWorker(false);
                    self.getContent(value,
                        function (content) {
                            //console.error('update edito!' + file.path);
                            var newMode = self._getMode(value.path);
                            self.set('value',content);
                            //self.set('mode',newMode);
                            self.setMode(newMode);
                            session.setUseWorker(self.options.useWorker);
                        });
                }

                if (key == "value" && value) {
                    session.setValue(value);
                }
                else if (key == "theme") {
                    if (typeof value == "string") {
                        value = "ace/theme/" + value;
                    }
                    editor.setTheme(value);
                    if (this.split) {
                        this.split.setTheme(value);
                    }
                }
                else if (key == "mode") {
                    try {
                        if (has('host-browser')) {
                            ace.require(["ace/mode/" + value], function (modeModule) {
                                if (modeModule && modeModule.Mode) {
                                    self.split.$editors.forEach(function (editor) {
                                        editor.session.setMode(new modeModule.Mode());
                                    });
                                }
                            });
                        }

                    } catch (e) {
                        console.error('ace mode failed : ' + value);
                    }


                }
                else if (key == "readOnly") {
                    editor.setReadOnly(value);
                }
                else if (key == "tabSize") {
                    session.setTabSize(value);
                }
                else if (key == "softTabs") {
                    session.setUseSoftTabs(value);
                }
                else if (key == "wordWrap") {
                    session.setUseWrapMode(value);
                }
                else if (key == "printMargin") {
                    editor.renderer.setPrintMarginColumn(value);
                }
                else if (key == "showPrintMargin") {
                    editor.setShowPrintMargin(value);
                }
                else if (key == "highlightActiveLine") {
                    editor.setHighlightActiveLine(value);
                }
                else if (key == "fontSize") {
                    $(node).css(key, value);
                }
                else if (key == "showIntentGuides") {
                    editor.setDisplayIndentGuides(value);
                }
                else if (key == "elasticTabstops") {
                    editor.setOption("useElasticTabstops", value);
                }
                else if (key == "useIncrementalSearch") {
                    editor.setOption("useIncrementalSearch", value);
                }
                else if (key == "showGutter") {
                    editor.renderer.setShowGutter(value);
                }
            }else{

                console.warn('have no editor or session');

            }
            return this.inherited("set", arguments);

        },
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
        setOptions:function(options){
            this.options = options;

            _.each(options,function(value,name){
                this.set(name,value);
            },this);

            var editor = this.getEditor();
            if(editor && options.aceOptions){
                editor.setOptions(options.aceOptions);
                editor.session.setUseWorker(options.useWorker);
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });
                this.setMode(options.mode);
            }
            return this.options;
        },
        getOptions:function(){
            return this.options;
        },
        onContentChange:function(){

        },
        onDidChange: function () {
            this.onContentChange(this.get('value') !== this.lastSavedContent);
        },
        getDefaultOptions:function(value,mixin){

            var thiz = this;
            return utils.mixin({
                region: "center",
                /*value: value,*/
                style: "margin: 0; padding: 0; position:relative;overflow: auto;height:inherit;width:inherit;text-align:left;",
                readOnly: false,
                tabSize: 2,
                softTabs: false,
                wordWrap: false,
                showPrintMargin: false,
                highlightActiveLine: true,
                fontSize: 16,
                showGutter: true,
                useWorker: true,
                //className: 'editor-ace ace_editor',
                fileName:'none',
                mode:'javascript',
                value:value || this.value || 'No value',
                theme:'idle_fingers',
                splits:1,
                aceOptions: {
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                },
                onLoad: function (_editor) {
                    // This is to remove following warning message on console:
                    // Automatically scrolling cursor into view after selection change this will be disabled in the next version
                    // set editor.$blockScrolling = Infinity to disable this message
                    _editor.$blockScrolling = Infinity;
                },

                onDidChange: function () {
                    thiz.onContentChange(thiz.get('value') !== thiz.lastSavedContent);
                },
                onPrefsChanged: function () {
                    thiz.setPreferences && thiz.setPreferences();
                }
            },mixin || {});
        },
        getEditor:function(index){

            if(this.split){
                return index==null ? this.split.getCurrentEditor() : this.split.getEditor(index !=null ? index : 0 );
            }else if(this.editor){
                return this.editor;
            }
        },
        resize:function(what,target,event){

            var options = this.options || {};

            function _resize() {

                //this.inherited('resize',[what,target]);

                var editor = this.getEditor(),
                    widget = this.split || this.editor;


                if( !editor || !this.aceNode || !editor.container){
                    console.error('invalid DOM! ' + this.id + ' ' + this.value);
                    this['resize_debounced'].cancel();
                    this['resize_debounced']=null;
                    return;
                }

                editor && utils.resizeTo(editor.container,this.aceNode, true, true);
                return widget ? widget.resize() : null;
            }
            return this.debounce('resize',_resize.bind(this),options.resizeDelay||300,null);

        },
        getAce:function(){
            return this.getEditor();
        },
        addBasicCommands:function(editor){

            editor = editor  || this.getEditor();

            var config = this._aceConfig,
                thiz = this;

            editor.commands.addCommands([
                {
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
                },
                {
                    name: "snippet",
                    bindKey: {win: "Alt-C", mac: "Command-Alt-C"},
                    exec: function (editor, needle) {
                        if (typeof needle == "object") {
                            editor.cmdLine.setValue("snippet ", 1);
                            editor.cmdLine.focus();
                            return;
                        }
                        var s = snippetManager.getSnippetByName(needle, editor);
                        if (s)
                            snippetManager.insertSnippet(editor, s.content);
                    },
                    readOnly: true
                },
                {
                    name: "increaseFontSize",
                    bindKey: "Ctrl-+",
                    exec: function (editor) {
                        editor.setFontSize(editor.getFontSize() + 1);
                        thiz.onPrefsChanged();
                    }
                }, {
                    name: "decreaseFontSize",
                    bindKey: "Ctrl+-",
                    exec: function (editor) {
                        editor.setFontSize(editor.getFontSize() - 1);
                        thiz.onPrefsChanged();
                    }
                }, {
                    name: "resetFontSize",
                    bindKey: "Ctrl+0",
                    exec: function (editor) {
                        editor.setFontSize(12);
                    }
                }
            ]);
        },
        onEditorCreated:function(editor,options){

            var thiz = this;
            editor.getSelectedText = function () {
                return thiz.editorSession.getTextRange(this.getSelectionRange());
            };
            editor.on('change', function () {
                thiz.onDidChange(arguments);
            });
            this.addBasicCommands(editor);

            editor.setFontSize(options.fontSize);

            editor.$blockScrolling = true;

        },
        destroy:function(){

            //this.inherited(arguments);
            var editor = this.getEditor();
            editor && editor.destroy();
            var _resize = this['resize_debounced'];
            if(_resize){
                _resize.cancel();
            }
        },
        createEditor:function(_options,value){

            this.set('iconClass', this.iconClassNormal);

            if(this.editor || this.split){
                return this.editor || this.split;
            }
            console.log('create editor!',this);

            ///////////////////////////////////////////////////////////////////
            //
            //  Build Options
            //
            //
            var settings = this.getPreferences ? this.getPreferences() : {},
                thiz = this;

            var options = this.getDefaultOptions(value);

            //apply overrides
            utils.mixin(options,_options);

            //apply settings from persistence store
            utils.mixin(options,settings);

            options.mode = this._getMode(options.fileName);



            //console.log('create editor with options! ' + options.mode,options);
            ///////////////////////////////////////////////////////////////////
            //
            //  DOM & ACE
            //
            //


            var node = options.targetNode  ||  domConstruct.create('div');

            $(node).css({
                padding: "0",
                margin: "0",
                height:'100%',
                width:'100%'
                //"className": "editor-ace ace_editor ace-codebox-dark ace_dark"
            });


            this.aceNode.appendChild(node);

            //var editor = this.getEditor();

            var config = ace.require("ace/config"),
                split = null,
                editor = null,
                container = null;

            try {
                var Split = Splitter.getSplitter();

                split = new Split(node, null, 1);

                this.split = split;

                this._aceConfig = config;

                config.init();
                ace.require('ace/ext/language_tools');

                this.editor = editor = split.getEditor(0);
                this.editorSession = this.editor.getSession();

                if(value){
                    this.editorSession.setValue(value);
                }
                //container = editor.container;
                //utils.resizeTo(container,this.domNode);
                //split && split.resize();
                split && split.setSplits(options.splits);
            }catch(e){
                debugger;
            }



            //console.log('split',this.split);
            //console.log('editor',this.editor);


            this.setOptions(options);
            this.onEditorCreated(editor,options);
            return editor;
        },
        addAutoCompleter: function (list) {
            var editor = this.getEditor();
            var langTools = ace.require("ace/ext/language_tools");
            var rhymeCompleter = {
                getCompletions: function (editor, session, pos, prefix, callback) {

                    if (prefix.length === 0) {
                        callback(null, []);
                        return;
                    }

                    if (!list) {
                        callback(null, []);
                        return;
                    }

                    callback(null, list.map(function (ea) {
                        return {name: ea.value, value: ea.word, meta:ea.meta}
                    }));
                }
            };
            langTools.addCompleter(rhymeCompleter);
        }
    });

    /**
     *
     */
    var EditorClass = dcl(null,{
        declaredClass:'xace/views/ACE',
        onLoaded:function(){
            this.set('iconClass', this.iconClassNormal);
        },
        startup: function () {

            if (this.permissions) {
                var _defaultActions = DefaultActions.getDefaultActions(this.permissions, this, this);
                _defaultActions = _defaultActions.concat(this.getActions(this.permissions));
                this.addActions(_defaultActions);
            }


            //save icon class normal
            this.iconClassNormal = '' + this.iconClass;

            this.set('iconClass', 'fa-spinner fa-spin');

            var self = this,
                options = this.options || {};

            if(!this.item && this.value==null){
                console.error('invalid editor args ');
                //this.value = "";
                return;
            }


            function createEditor(options,value){
                self.createEditor(self.options || options,value);
            }


            if (this.value!=null) {
                createEditor(null,this.value);
            } else {

                //we have no content yet, call in _TextEditor::getContent, this will be forwarded
                //to our 'storeDelegate'
                this.getContent(
                    this.item,
                    function (content) {//onSuccess
                        //thiz.set('iconClass', thiz.iconClassNormal);//
                        self.lastSavedContent = content;
                        createEditor(options,content);
                    },
                    function (e) {//onError

                        createEditor(null,'');
                        logError(e,'error loading content from file');
                    }
                );
            }

        }
    });


    var Module = dcl([containerClass,EditorClass,EditorInterfaceImplementation],{});

    Module.EditorImplementation = EditorInterfaceImplementation;
    Module.Editor = EditorClass;
    Module.Container = containerClass;
    Module.Splitter = Splitter;
    return Module;

});