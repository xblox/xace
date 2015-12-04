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

    'xide/action/Toolbar',
    'xide/action/DefaultActions',


    'dojo/has!ace-formatters?xide/editor/ace/formatters'


], function (declare, lang, connect, has, domClass, domConstruct,
             domGeometry, domStyle, ContentPane, _EditorBase, TextEditor,
             utils, types, factory, ActionSelectWidget,
             MenuItem, cookie, Action, ReloadMixin, ActionProvider,
             SplitViewMixin, Deferred, AceDiff, winUtils,
             Keyboard, ActionToolbar, CheckedMenuItem, _AceMultiDocs,
             CheckBox,
             ActionValueWidget, _ActionValueWidgetMixin,
             TemplatedWidgetBase, Splitter, ACEEditor,
             Toolbar, DefaultActions,
             formatters) {


    var ACTION = types.ACTION,
        EDITOR_SETTINGS = 'Editor/Settings',
        INCREASE_FONT_SIZE = 'View/Increase Font Size',
        DECREASE_FONT_SIZE = 'View/Decrease Font Size',
        EDITOR_HELP = 'Help/Editor Shortcuts',
        EDITOR_THEMES = 'View/Themes',
        SNIPPETS = 'Editor/Snippets',
        EDITOR_CONSOLE = 'Editor/Console',
        KEYBOARD = 'Editor/Keyboard',
        LAYOUT = 'View/Layout',

        DEFAULT_PERMISSIONS = [

            ACTION.RELOAD,
            ACTION.SAVE,
            ACTION.FIND,
            ACTION.TOOLBAR,
            KEYBOARD,
            INCREASE_FONT_SIZE,
            DECREASE_FONT_SIZE,
            EDITOR_THEMES,
            'Help/Editor Shortcuts',
            SNIPPETS,
            EDITOR_CONSOLE,
            EDITOR_SETTINGS,
            ACTION.FULLSCREEN,
            LAYOUT

        ];


    /**
     * Default Editor with all extras added : Actions, Toolbar and ACE-Features
     @class module:xgrid/Base
     */
    var Module = declare('xace/views/Editor', [ACEEditor, Toolbar, ActionProvider],
        {
            permissions: DEFAULT_PERMISSIONS,
            _searchBoxOpen:false,
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

            onMaximized: function (maximized) {

                var toolbar = this.getToolbar();
                if (toolbar) {

                    if (maximized) {
                        $(toolbar.domNode).addClass('bg-opaque');
                    } else {
                        $(toolbar.domNode).removeClass('bg-opaque');
                    }
                }

                this.resize();
                this.publish(types.EVENTS.RESIZE, null, 1500);

            },
            maximize: function () {


                var node = this.domNode,
                    $node = $(node),
                    thiz = this;

                if (!this._isMaximized) {
                    var vp = $(this.domNode.ownerDocument);
                    var root = $('body')[0];
                    var container = utils.create('div', {
                        className: 'ACEContainer bg-opaque',
                        style: 'z-index:300;height:100%;width:100%'
                    });

                    this._maximizeContainer = container;


                    root.appendChild(container);

                    $(node).addClass('AceEditorPaneFullScreen');

                    $(node).css('width', vp.width());
                    $(node).css('height', vp.height());
                    this.resize();


                    this._lastParent = node.parentNode;
                    container.appendChild(node);


                    $(container).addClass('bg-opaque');

                    $(container).css('width', vp.width());
                    $(container).css('height', vp.height());


                    $(container).css({
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        border: 'none medium',
                        width: '100%',
                        height: '100%'
                    });


                    this._isMaximized = true;


                } else {
                    this._isMaximized = false;
                    $node.removeClass('AceEditorPaneFullScreen');
                    this._lastParent.appendChild(node);
                    utils.destroy(this._maximizeContainer);
                }
                this.onMaximized(this._isMaximized);
                return true;
            },
            save: function (item) {
                var res = this.saveContent(this.get('value'), item);
                var thiz = this;
                setTimeout(function() {
                	var _ed = thiz.getEditor();
                	if(_ed){
                		_ed.focus();
                	}
                }, 600);
                
                return res;
            },
            runAction: function (action) {

                action = this.getAction(action);
                if (!action) {
                    return;
                }

                var self = this,
                    command = action.command,
                    ACTION = types.ACTION,
                    editor = this.getEditor(),
                    session = this.editorSession;


                if(command.indexOf(LAYOUT)!=-1){
                    self.setSplitMode(action.option, null);
                }




                switch (command) {
                    case INCREASE_FONT_SIZE:{
                        editor.setFontSize(editor.getFontSize() + 1);
                        return true;
                    }
                    case DECREASE_FONT_SIZE:{
                        editor.setFontSize(editor.getFontSize() - 1);
                        return true;
                    }
                    case ACTION.FULLSCREEN:
                    {
                        return this.maximize();
                    }
                    case EDITOR_HELP:
                    {
                        self.showHelp();
                        break;
                    }
                    case ACTION.SAVE:
                    {
                        return self.save(this.item);
                    }
                    case ACTION.FIND:
                    {

                        var net = ace.require("ace/lib/net");
                        var webRoot = this.getWebRoot();
                        var sb = editor.searchBox;

                        function _search(sb) {
                            var shown = self._searchBoxOpen;
                            if(!shown) {
                                sb.show(editor.session.getTextRange(), null);
                                self._searchBoxOpen=true;
                            }else{
                                sb.hide();
                                self._searchBoxOpen=false;
                            }
                        }

                        if (sb) {
                            _search(sb);
                        } else {
                            net.loadScript(webRoot + '/xfile/ext/ace2/ext-searchbox.js', function (what) {
                                var sbm = ace.require("ace/ext/searchbox");
                                _search(new sbm.SearchBox(editor));
                            });
                        }
                        break;
                    }
                }

                //themes
                if (command.indexOf(EDITOR_THEMES) != -1) {
                    self.set('theme', action.theme);
                }

                if (command.indexOf(KEYBOARD) != -1) {

                    var option = action.option;
                    var keybindings = {
                        ace: null, // Null = use "default" keymapping
                        vim: ace.require("ace/keyboard/vim").handler,
                        emacs: "ace/keyboard/emacs"
                    };
                    editor.setKeyboardHandler(keybindings[action.option]);

                }


                if (command.indexOf(EDITOR_SETTINGS) != -1) {

                    var key = action.option,
                        option = editor.getOption(action.option),
                        isBoolean = _.isBoolean(option);

                    if (option == null) {
                        console.error('option does not exists! ' + action.option);
                    }

                    if (isBoolean) {
                        editor.setOption(action.option, !option);
                    } else {
                        if(key==='wrap'){
                            var mode = session.getUseWrapMode();
                            this.set('wordWrap',!mode);
                            return
                        }

                        if(option==='off' || option ==='on'){
                            editor.setOption(key, option ==='off' ? 'on' : 'off' );
                        }else {
                            editor.setOption(action.option, false);
                        }
                    }
                }

                console.log('run action : ' + action.command);
            },
            getActions: function (permissions) {

                var actions = [],
                    self = this,
                    ACTION = types.ACTION,
                    ICON = types.ACTION_ICON,
                    VISIBILITY = types.ACTION_VISIBILITY;


                actions.push(this.createAction({
                    label: 'Reload',
                    command: ACTION.RELOAD,
                    icon: ICON.RELOAD,
                    keycombo: 'ctrl r'
                }));


                actions.push(this.createAction({
                    label: 'Save',
                    command: ACTION.SAVE,
                    icon: ICON.SAVE,
                    keycombo: 'ctrl s',
                    group: 'File'
                }));

                actions.push(this.createAction({
                    label: 'Find',
                    command: ACTION.FIND,
                    icon: ICON.SEARCH,
                    keycombo: 'ctrl f',
                    group: 'Search'
                }));

                actions.push(this.createAction({
                    label: 'Fullscreen',
                    command: ACTION.FULLSCREEN,
                    icon: ICON.MAXIMIZE,
                    keycombo: 'ctrl f11',
                    group: 'View'
                }));


                actions.push(this.createAction({
                    label: 'Increase Fontsize',
                    command: INCREASE_FONT_SIZE,
                    icon: 'fa-text-height',
                    group: 'View'
                }));

                actions.push(this.createAction({
                    label: 'Decrease Fontsize',
                    command: DECREASE_FONT_SIZE,
                    icon: 'fa-text-height',
                    group: 'View'
                }));

                actions.push(this.createAction({
                    label: 'Themes',
                    command: EDITOR_THEMES,
                    icon: 'fa-paint-brush',
                    group: 'View'
                }));

                self._addThemes && self._addThemes(actions);


                actions.push(this.createAction({
                    label: 'Help',
                    command: EDITOR_HELP,
                    icon: 'fa-question',
                    keycombo: 'f1'
                }));


                actions.push(this.createAction({
                    label: 'Snippets',
                    command: SNIPPETS,
                    icon: 'fa-paper-plane',
                    group: "Show"
                }));

                actions.push(this.createAction({
                    label: 'Console',
                    command: EDITOR_CONSOLE,
                    icon: 'fa-terminal',
                    group: 'Show'
                }));


                ///editor settings
                actions.push(this.createAction({
                    label: 'Settings',
                    command: EDITOR_SETTINGS,
                    icon: 'fa-cogs',
                    group: "Settings"
                }));

                function _createSettings(label, command, icon, option, mixin,group) {

                    command = command || EDITOR_SETTINGS + '/' + label;

                    mixin = mixin || {};

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

                _createSettings('Show Gutters', null, null, 'showGutter');
                _createSettings('Show Print Margin', null, null, 'printMargin');
                _createSettings('Display Intend Guides', null, null, 'displayIndentGuides');
                _createSettings('Show Line Numbers', null, null, 'showLineNumbers');

                _createSettings('Show Invisibles', null, null, 'showInvisibles');

                _createSettings('Use Soft Tabs', null, null, 'useSoftTabs');
                //_createSettings('Use Elastic Tab Stops', null, null, 'useElasticTabstops');
                _createSettings('Animated Scroll', null, null, 'animatedScroll');
                _createSettings('Word Wrap',null,null,'wrap');


                /*
                 var keybindings = {
                 ace: null, // Null = use "default" keymapping
                 vim: ace.require("ace/keyboard/vim").handler,
                 emacs: "ace/keyboard/emacs"
                 };
                 */


                actions.push(this.createAction({
                    label: 'Keyboard',
                    command: KEYBOARD,
                    icon: 'fa-keyboard-o',
                    group: "Settings"
                }));

                if(DefaultActions.hasAction(permissions,KEYBOARD)){
                    _createSettings('Default', KEYBOARD + '/Default', null, 'ace');
                    _createSettings('Vim', KEYBOARD + '/Vim', null, 'vim');
                    _createSettings('EMacs', KEYBOARD + '/EMacs', null, 'emacs');
                }

                if(DefaultActions.hasAction(permissions,LAYOUT)) {
                    //layout
                    actions.push(_createSettings('Layout', 'View/Layout', 'fa-columns', types.VIEW_SPLIT_MODE.SOURCE, null, 'View'));
                    actions.push(_createSettings('Horizontal', 'View/Layout/Horizontal', 'layoutIcon-horizontalSplit', types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL, null, 'View'));
                    actions.push(_createSettings('Vertical', 'View/Layout/Vertical', 'layoutIcon-layout293', types.VIEW_SPLIT_MODE.SPLIT_VERTICAL, null, 'View'));
                    actions.push(_createSettings('Diff', 'View/Layout/Diff', 'fa-columns', 'Diff', null, 'View'));
                }



                return actions;

            },
            _addThemes: function (actions) {

                var themes = this.getThemeData(),
                    thiz = this;

                var creatorFn = function (label, icon, value) {
                    return thiz.createAction({
                        label: label,
                        command: EDITOR_THEMES + '/' + label,
                        group: 'View',
                        mixin: {
                            addPermission: true,
                            theme: value
                        }
                    });
                };

                //clean and complete theme data
                for (var i = 0; i < themes.length; i++) {
                    var data = themes[i];
                    var name = data[1] || data[0].replace(/ /g, "_").toLowerCase();
                    var theme = creatorFn(data[0], '', name);
                    actions.push(theme);
                }
            },

            ////////////////////////////////////////////////
            //
            //  methods - Action
            //
            //
            showHelp: function (editor) {

                editor = editor || this.getEditor();

                var config = ace.require("ace/config");
                config.loadModule("ace/ext/keybinding_menu", function (module) {
                    module.init(editor);
                    editor.showKeyboardShortcuts();
                });

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
            startup: function () {

                if (this.permissions) {
                    var _defaultActions = DefaultActions.getDefaultActions(this.permissions, this, this);
                    _defaultActions = _defaultActions.concat(this.getActions(this.permissions));
                    this.addActions(_defaultActions);
                }


                this.inherited(arguments);
            }
        }
    );


    Module.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;

    return Module;

});