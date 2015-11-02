/** @module xace/views/Editor **/
define([
    "dojo/_base/declare",
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
    'xide/utils',
    'xide/types',
    'xide/factory',
    'xide/widgets/ActionSelectWidget',
    'dijit/MenuItem',
    "dojo/cookie",
    'xide/bean/Action',
    'xide/mixins/ReloadMixin',
    'xide/mixins/ActionProvider',
    'xide/views/SplitViewMixin',
    'dojo/Deferred',
    './AceDiff',
    "dojo/window", // winUtils.getBox winUtils.scrollIntoView
    'xide/Keyboard',
    'xide/widgets/ActionToolbar',
    'dijit/CheckedMenuItem',
    './_AceMultiDocs',

    'dijit/form/CheckBox',
    'xide/widgets/ActionValueWidget',
    'xide/widgets/_ActionValueWidgetMixin',
    'xide/widgets/TemplatedWidgetBase',
    './_Split',

    './ACEEditor',
    './_Actions',

    'xide/action/Toolbar',
    'xide/action/DefaultActions',


    'dojo/has!ace-formatters?xide/editor/ace/formatters'


], function (declare, lang,connect,has, domClass, domConstruct,
             domGeometry, domStyle, ContentPane, _EditorBase, TextEditor,
             utils, types, factory, ActionSelectWidget,
             MenuItem, cookie, Action, ReloadMixin,ActionProvider,
             SplitViewMixin, Deferred, AceDiff, winUtils,
             Keyboard,ActionToolbar,CheckedMenuItem,_AceMultiDocs,
             CheckBox,
             ActionValueWidget,_ActionValueWidgetMixin,
             TemplatedWidgetBase,Splitter,ACEEditor,

             _Actions,Toolbar,DefaultActions,

             formatters)
{


    var ACTION = types.ACTION,
        EDITOR_SETTINGS = 'Editor/Settings',
        INCREASE_FONT_SIZE = 'View/Increase Font Size',
        DECREASE_FONT_SIZE = 'View/Decrease Font Size',
        EDITOR_HELP = 'Help/Editor Shortcuts',
        EDITOR_THEMES = 'View/Themes',
        SNIPPETS = 'Editor/Snippets',
        EDITOR_CONSOLE = 'Editor/Console',
        KEYBOARD = 'Editor/Keyboard';



    /**
     * Default Editor with all extras added : Actions, Toolbar and ACE-Features
     @class module:xgrid/Base
     */
    var Module = declare('xace/views/Editor',[ACEEditor,_Actions,Toolbar,ActionProvider],
        {

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
            //////////////////////////////////////////////////////////////////
            //
            //
            //
            templateString: '<div data-dojo-attach-point="template" class="grid-template widget" style="width: 100%;height: 100%;overflow: hidden;position: relative;padding: 0px;margin: 0px">' +
            '<div data-dojo-attach-point="header" class="view-header row" style="height: 30px;"></div>' +
            '<div data-dojo-attach-point="aceNode" class="view-body row" style="height:100%;width: 100%;position: absolute;top:0;left: 0;"></div>' +
            '<div data-dojo-attach-point="footer" class="view-footer" style="position: absolute;bottom: 0px;width: 100%"></div>' +
            '</div>',

            getContent:function(item,onSuccess,onError){

                if(!this.storeDelegate){

                    onError && onError('Editor::getContent : Have no store delegate!');
                }else{
                    var _cb=function(content){
                        onSuccess(content);
                    };

                    this.storeDelegate.getContent(_cb,item||this.item);
                }
            },
            saveContent:function(value,onSuccess,onError){

                var thiz=this;

                this.set('iconClass', 'fa-spinner fa-spin');

                var _value = value || this.get('value');
                if(!_value){
                    console.log('Editor::saveContent : Have nothing to save, editor seems empty');
                }
                if(!this.storeDelegate){
                    if(onError){
                        onError('Editor::saveContent : Have no store delegate!');
                    }
                }else{
                    var _s = function(){

                        thiz.set('iconClass',thiz.iconClassNormal);

                        thiz.lastSavedContent=_value;

                        thiz.onContentChange(false);

                        /*
                        if(onSuccess){
                            onSuccess(arguments);
                        }
                        */

                        var struct = {
                            path:thiz.options.filePath,
                            item:thiz.item,
                            content:_value,
                            editor:thiz
                        };

                        thiz.publish(types.EVENTS.ON_FILE_CONTENT_CHANGED,struct,thiz);
                    };
                    return this.storeDelegate.saveContent(_value,_s,null,thiz.item);
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
                var webRoot = this.ctx.getResourceManager().getVariable(types.RESOURCE_VARIABLES.APP_URL);
                return webRoot;
            },

            resize:function(){

                var thiz = this,
                    toolbar = this.getToolbar(),
                    noToolbar = false,
                    topOffset = 0,
                    aceNode = $(this.aceNode);

                if(!toolbar ||  (toolbar && toolbar.isEmpty())){
                    //$(thiz.header).css('display','none');
                    noToolbar = true;
                }else{

                    if(toolbar) {
                        var $toolbar = $(toolbar.domNode);
                        topOffset = $toolbar.position().top + $toolbar.outerHeight(true);
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

                aceNode.css('top',topOffset);

                return this.inherited(arguments);
            },
            startup:function(){

                this.inherited(arguments);
                var toolbar  = this.getToolbar();
                if(toolbar){

                }
            }

        }
    );



    return Module;

});