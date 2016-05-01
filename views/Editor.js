/** @module xace/views/Editor **/
define([
    'dcl/dcl',
    'xide/types',
    'xide/utils',
    'xaction/ActionProvider',
    'xace/views/ACEEditor',
    'xace/views/_Actions',
    'xaction/Toolbar',
    "xide/mixins/PersistenceMixin"
], function (dcl,types,utils,ActionProvider,ACEEditor,_Actions,Toolbar,PersistenceMixin){

    var Persistence = dcl([PersistenceMixin.dcl], {
        declaredClass:'xace.views.EditorPersistence',
        defaultPrefenceTheme: 'idle_fingers',
        defaultPrefenceFontSize: 14,
        saveValueInPreferences: true,
        getDefaultPreferences: function () {
            return utils.mixin(
                {
                    theme: this.defaultPrefenceTheme,
                    fontSize: this.defaultPrefenceFontSize
                },
                this.saveValueInPreferences ? {value: this.get('value')} : null);
        },
        onAfterAction: function (action) {
            var _theme = this.getEditor().getTheme();
            this.savePreferences({
                theme: _theme.replace('ace/theme/', ''),
                fontSize: this.getEditor().getFontSize()
            });
            return this.inherited(arguments);
        },
        /**
         * Override id for pref store:
         * know factors:
         *
         * - IDE theme
         * - per bean description and context
         * - by container class string
         * - app / plugins | product / package or whatever this got into
         * -
         **/
        toPreferenceId: function (prefix) {
            prefix = prefix || ($('body').hasClass('xTheme-transparent') ? 'xTheme-transparent' : 'xTheme-white' );
            return (prefix || this.cookiePrefix || '') + '_xace';
        },
        getDefaultOptions: function () {

            //take our defaults, then mix with prefs from store,
            var _super = this.inherited(arguments),

                _prefs = this.loadPreferences(null);

            (_prefs && utils.mixin(_super, _prefs) ||
                //else store defaults
            this.savePreferences(this.getDefaultPreferences()));
            return _super;
        }
    });
    /**
     * Default Editor with all extras added : Actions, Toolbar and ACE-Features
     @class module:xgrid/Base
     */
    var Module = dcl([_Actions,ACEEditor,ActionProvider.dcl,Persistence,Toolbar.dcl],{
            getBreadcrumbPath:function(){
                if(this.item){
                    return {
                        //root:utils.replaceAll('/','',this.item.mount),
                        path:utils.replaceAll('/','',this.item.mount) + ':/' + this.item.path.replace('./','/')
                    }
                }
            },
            tabOrder: {
                'Home': 100,
                'View': 50,
                'Settings': 20
            },
            menuOrder: {
                'File': 110,
                'Edit': 100,
                'View': 90,
                'Block': 50,
                'Settings': 20,
                'Navigation': 10,
                'Editor':9,
                'Step': 5,
                'New': 4,
                'Window': 3,
                'Help':2
            },
            declaredClass:'xace/views/Editor',
            options:null,
            /**
             * The icon class when doing any storage operation
             * @member loadingIcon {string}
             */
            loadingIcon:'fa-spinner fa-spin',
            /**
             * The original icon class
             * @member iconClassNormal {string}
             */
            iconClassNormal:'fa-code',
            templateString: '<div attachTo="template" class="grid-template widget" style="width: 100%;height: 100%;overflow: hidden !important;position: relative;padding: 0px;margin: 0px">' +
            '<div attachTo="header" class="view-header row bg-opaque" style="height: auto;"></div>' +
            '<div attachTo="aceNode" class="view-body row" style="height:100%;width: 100%;position: relative;"></div>' +
            '<div attachTo="footer" class="view-footer" style="position: absolute;bottom: 0px;width: 100%"></div></div>',
            getContent:function(item,onSuccess,onError){
                if(!this.storeDelegate){
                    onError && onError('Editor::getContent : Have no store delegate!');
                }else{
                    this.storeDelegate.getContent(function(content){
                        onSuccess(content);
                    },item||this.item);
                }
            },
            saveContent:function(value,onSuccess,onError){
                var thiz=this;
                this.set('iconClass', 'fa-spinner fa-spin');
                var _value = value || this.get('value');
                if(!_value){
                    console.warn('Editor::saveContent : Have nothing to save, editor seems empty');
                }
                if(!this.storeDelegate){
                    if(onError){
                        onError('Editor::saveContent : Have no store delegate!');
                    }
                    return false;
                }else{
                    return this.storeDelegate.saveContent(_value,function(){
                        thiz.set('iconClass',thiz.iconClassNormal);
                        thiz.lastSavedContent=_value;
                        thiz.onContentChange(false);
                        var struct = {
                            path:thiz.options.filePath,
                            item:thiz.item,
                            content:_value,
                            editor:thiz
                        };
                        thiz.publish(types.EVENTS.ON_FILE_CONTENT_CHANGED,struct,thiz);
                    },null,thiz.item);
                }
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
                return this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);
            },
            resize:function(){
                return this._resize();
            },
            onResize:function(){
                return this._resize();
            },
            _resize:function(){

                var parent = this.getParent();
                //console.log('resize editor');

                if(!this._isMaximized) {
                    parent && utils.resizeTo(this, parent, true, true);
                }else{
                    utils.resizeTo(this, this._maximizeContainer, true, true);
                }

                var thiz = this,
                    toolbar = this.getToolbar(),
                    noToolbar = false,
                    topOffset = 0,
                    aceNode = $(this.aceNode);

                if(this._isMaximized && toolbar) {
                    utils.resizeTo(toolbar, this.header, true, true);
                }

                if(!toolbar ||  (toolbar && toolbar.isEmpty())){
                    //$(thiz.header).css('display','none');
                    noToolbar = true;
                }else{
                    if(toolbar) {
                        toolbar.resize();
                        var $toolbar = $(toolbar.domNode);
                        //topOffset = $toolbar.position().top + $toolbar.outerHeight(true);
                    }
                }

                var totalHeight = $(thiz.domNode).height(),
                    topHeight = noToolbar==true ? 0 : $(thiz.header).height(),
                    footerHeight = $(thiz.footer).height(),
                    finalHeight = totalHeight - topHeight - footerHeight;

                if(toolbar){
                    finalHeight-=4;
                }

                if (finalHeight > 50) {
                    aceNode.height(finalHeight + 'px');
                } else {
                    aceNode.height('inherited');
                }
            },
            __set:function(what,value){
                var _res = this.inherited(arguments);
                if(what ==='iconClass'){
                    var _parent = this._parent;
                    if(_parent && _parent.icon){
                        this._parent.icon(value);
                    }
                }
                return _res;
            },
            __get:function(what){
                if(what==='value'){
                    var self = this,
                        editor = self.getEditor(),

                        session = editor ? editor.session : null;

                        return session ? session.getValue() : null;

                }
                return this.inherited(arguments);
            }

        });

    //pass through defaults
    Module.DEFAULT_PERMISSIONS = _Actions.DEFAULT_PERMISSIONS;

    return Module;

});