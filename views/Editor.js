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

    'xide/mixins/ActionProvider',

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

             ActionProvider,

             formatters)
{



    /**
     * Default Editor with all extras added : Actions, Toolbar and ACE-Features
     @class module:xgrid/Base
     */
    var Module = declare('xace/views/Editor',[ACEEditor,ActionProvider],{

    });



    return Module;

});