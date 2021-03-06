/** @module xace/views/Editor **/
define([
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'xide/types/Types', //  <--important for build
    'xaction/types', //  <--important for build
    'xaction/ActionProvider',
    'xace/views/ACEEditor',
    'xaction/Toolbar',
    'xaction/DefaultActions',
    'dojo/Deferred',
    'xace/formatters'
], function (dcl, utils, types, Types,aTypes,ActionProvider,ACEEditor,Toolbar, DefaultActions,Deferred,formatters) {

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
        FORMAT = 'Edit/Format',
        SPLIT_MODE = types.VIEW_SPLIT_MODE,
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
            LAYOUT,
            FORMAT
        ];
    /**
     * Default Editor with all extras added : Actions, Toolbar and ACE-Features
     @class module:xgrid/Base
     */
    var Module = dcl([ACEEditor, Toolbar.dcl, ActionProvider.dcl], {
            permissions: DEFAULT_PERMISSIONS,
            _searchBoxOpen: false,
            onSingleView: function () {

            },
            setSplitMode: function (mode) {
                this.splitMode = mode;
                if (!this.doSplit) {
                    if (mode == 'Diff') {
                        this.doDiff();
                        return;
                    }
                    var isSplit = mode == SPLIT_MODE.SPLIT_HORIZONTAL || mode == SPLIT_MODE.SPLIT_VERTICAL;
                    var _ed = this.getEditor();
                    var sp = this.split;
                    if (isSplit) {
                        var newEditor = (sp.getSplits() == 1);
                        sp.setOrientation(mode == SPLIT_MODE.SPLIT_HORIZONTAL ? sp.BELOW : sp.BESIDE);
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
                var parent = this.getParent();
                if (maximized === false) {
                    if (parent && parent.resize) {
                        parent.resize();
                    }
                }
                var toolbar = this.getToolbar();
                if (toolbar) {
                    if (maximized) {
                        $(toolbar.domNode).addClass('bg-opaque');
                    } else {
                        $(toolbar.domNode).removeClass('bg-opaque');
                    }
                }
                if (maximized === false) {
                    this.resize();
                    parent && utils.resizeTo(this, parent, true, true);
                    this.publish(types.EVENTS.ON_VIEW_MAXIMIZE_END);
                }
                this.getEditor().focus();
            },
            maximize: function () {
                var node = this.domNode,
                    $node = $(node),
                    _toolbar = this.getToolbar();

                if (!this._isMaximized) {
                    this.publish(types.EVENTS.ON_VIEW_MAXIMIZE_START);
                    this._isMaximized = true;
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
                var value = this.get('value');
                var res = this.saveContent(this.get('value'), item);
                var thiz = this;
                this._emit(types.EVENTS.ON_FILE_CONTENT_CHANGED,{
                    content:value,
                    item:item
                });
                setTimeout(function () {
                    var _ed = thiz.getEditor();
                    if (_ed) {
                        _ed.focus();
                    }
                }, 600);
                return res;
            },
            reload:function(){
                var self = this;
                var dfd = new Deferred();
                this.getContent(
                    this.item,
                    function (content) {//onSuccess
                        self.lastSavedContent = content;
                        self.set('value',content);
                        dfd.resolve(content);
                    },
                    function (e) {//onError
                        logError(e, 'error loading content from file');
                        dfd.reject(e);
                    }
                );
                return dfd;
            },
            runAction: function (action) {
                action = this.getAction(action);
                if (!action) {
                    return false;
                }

                var self = this,
                    command = action.command,
                    ACTION = types.ACTION,
                    editor = this.getEditor(),
                    session = this.editorSession,
                    result = false;

                if (command.indexOf(LAYOUT) != -1) {
                    self.setSplitMode(action.option, null);
                }

                switch (command) {
                    case ACTION.RELOAD:
                    {
                        return this.reload();
                    }
                    case INCREASE_FONT_SIZE:
                    {
                        editor.setFontSize(editor.getFontSize() + 1);
                        return true;
                    }
                    case DECREASE_FONT_SIZE:
                    {
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
                        result = self.save(this.item);
                        break;
                    }
                    case ACTION.FIND:
                    {
                        var net = ace.require("ace/lib/net");
                        var webRoot = this.getWebRoot();
                        var sb = editor.searchBox;
                        function _search(sb) {
                            var shown = self._searchBoxOpen;
                            if (!shown) {
                                sb.show(editor.session.getTextRange(), null);
                                self._searchBoxOpen = true;
                            } else {
                                sb.hide();
                                self._searchBoxOpen = false;
                            }
                        }
                        if (sb) {
                            _search(sb);
                        } else {
                            net.loadScript(webRoot + '/xfile/ext/ace/ext-searchbox.js', function (what) {
                                var sbm = ace.require("ace/ext/searchbox");
                                _search(new sbm.SearchBox(editor));
                            });
                        }
                        return true;
                    }
                }

                //themes
                if (command.indexOf(EDITOR_THEMES) !==-1) {
                    self.set('theme', action.theme);
                    var parentAction = action.getParent ?  action.getParent() : null;
                    //action._originEvent = 'change';
                    if(parentAction) {
                        var rendererActions = parentAction.getChildren();
                        _.each(rendererActions, function (child) {
                            child.set('icon', child._oldIcon);
                        });
                    }
                    action.set('icon', 'fa fa-check');
                }
                //formatters :
                if (command.indexOf(FORMAT) !==-1) {
                     if (editor) {
                         var _value = formatters.format(editor, action.formatter);
                         self.set('value',_value);
                     }
                }
                /*
                if (command.indexOf(KEYBOARD) !==-1) {
                    var option = action.option,
                        keybindings = {
                        ace: null, // Null = use "default" keymapping
                        vim: ace.require("ace/keyboard/vim").handler,
                        emacs: "ace/keyboard/emacs"
                    };
                    editor.setKeyboardHandler(keybindings[action.option]);
                    return true;
                }
                */

                if (command.indexOf(EDITOR_SETTINGS) !==-1) {
                    var key = action.option,
                        option = editor.getOption(action.option),
                        isBoolean = _.isBoolean(option);
                    if (key === 'highlightActive') {
                        editor.setHighlightActiveLine(!editor.getHighlightActiveLine());
                        return;
                    }
                    if (isBoolean) {
                        editor.setOption(action.option, !option);
                    } else {
                        if (key === 'wordWrap') {
                            var mode = session.getUseWrapMode();
                            this.set('wordWrap', !mode);
                            return true;
                        }
                        if (option === 'off' || option === 'on') {
                            editor.setOption(key, option === 'off' ? 'on' : 'off');
                        } else {
                            editor.setOption(action.option, false);
                        }
                    }
                    return true;
                }

                return this.inherited(arguments);
            },
            getEditorActions: function (permissions) {

                var actions = [],
                    self = this,
                    ACTION = types.ACTION,
                    ICON = types.ACTION_ICON;

                /* @TODO: reactivate reload action
                actions.push(this.createAction({
                    label: 'Reload',
                    command: ACTION.RELOAD,
                    icon: ICON.RELOAD,
                    keycombo: 'ctrl r'
                }));
                */
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

                if (DefaultActions.hasAction(permissions, EDITOR_THEMES)) {
                    actions.push(this.createAction({
                        label: 'Themes',
                        command: EDITOR_THEMES,
                        icon: 'fa-paint-brush',
                        group: 'View',
                        mixin:{
                            closeOnClick:false,
                            value:this.defaultPrefenceTheme
                        },
                        onCreate:function(action){
                            var options = self.getDefaultOptions();
                            action.set('value',options.theme);
                        }
                    }));

                    self._addThemes && self._addThemes(actions);
                }

                actions.push(this.createAction({
                    label: 'Help',
                    command: EDITOR_HELP,
                    icon: 'fa-question',
                    keycombo: 'f1'
                }));

                ///editor settings
                actions.push(this.createAction({
                    label: 'Settings',
                    command: EDITOR_SETTINGS,
                    icon: 'fa-cogs',
                    group: "Settings"
                }));

                function _createSettings(label, command, icon, option, mixin, group, actionType, params) {
                    command = command || EDITOR_SETTINGS + '/' + label;
                    mixin = mixin || {};
                    command = command || EDITOR_SETTINGS + '/' + label;
                    mixin = mixin || {};
                    var action = self.createAction(utils.mixin({
                        label: label,
                        command: command,
                        icon: icon || 'fa-cogs',
                        group: group || "Settings",
                        mixin: utils.mixin({
                            addPermission: true,
                            option: option,
                            actionType: actionType,
                            owner: self
                        }, mixin)
                    }, params));
                    actions.push(action);
                    return action;
                }
                var _params = {
                    onCreate: function (action) {
                        var optionValue = self.getOptionsMixed()[this.option];
                        if (optionValue !== null) {
                            action.set('value', optionValue);
                        }
                    },
                    onChange: function (property, value) {
                        this.value = value;
                        self.runAction(this);
                    }
                };


                _createSettings('Show Gutters', null, null, 'showGutter', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Show Print Margin', null, null, 'showPrintMargin', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Display Intend Guides', null, null, 'displayIndentGuides', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Show Line Numbers', null, null, 'showLineNumbers', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Show Indivisibles', null, null, 'showInvisibles', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Use Soft Tabs', null, null, 'useSoftTabs', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Use Elastic Tab Stops', null, null, 'useElasticTabstops', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                //_createSettings('Use Elastic Tab Stops', null, null, 'useElasticTabstops');
                _createSettings('Animated Scroll', null, null, 'animatedScroll', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Word Wrap', null, null, 'wordWrap', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);
                _createSettings('Highlight Active Line', null, null, 'highlightActive', null, null, types.ACTION_TYPE.MULTI_TOGGLE, _params);

                /*
                 var keybindings = {
                 ace: null, // Null = use "default" keymapping
                 vim: ace.require("ace/keyboard/vim").handler,
                 emacs: "ace/keyboard/emacs"
                 };
                 */

                /*
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
                 */
                var VISIBILITY = types.ACTION_VISIBILITY;
                if (DefaultActions.hasAction(permissions, FORMAT)) {
                    actions.push(this.createAction({
                        label: 'Format',
                        command: 'Edit/Format',
                        icon: 'fa-indent',
                        group: "Edit"
                    }));

                    var modes = formatters.modes;
                    var creatorFn = function (label, icon, value) {

                        var head = self.createAction({
                            label: label,
                            command: 'Edit/Format/'+label,
                            icon: 'fa-indent',
                            group: "Edit",
                            mixin:{
                                addPermission: true,
                                formatter:value
                            },
                            onCreate:function(action){
                                /*
                                action.setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}).
                                setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                                setVisibility(VISIBILITY.CONTEXT_MENU, null);*/
                            }
                        });

                        actions.push(head);

                        /*
                        return Action.create(label, icon, 'Edit/Format/' + label, false, null, 'TEXT', 'viewActions', null, false, function () {
                            formatCode(value);
                        });
                        */
                    };

                    for (var _f in modes) {
                        actions.push(creatorFn(modes[_f], '', _f));
                    }
                    /*
                    var format = Action.createDefault('Format', 'fa-indent', 'Edit/Format', '_a', null, {
                        dummy: true
                    }).setVisibility(VISIBILITY.ACTION_TOOLBAR, {label: ''}).
                    setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                    setVisibility(VISIBILITY.CONTEXT_MENU, null);

                    this.addAction(actions,format);

                    for (var _f in modes) {
                        actions.push(creatorFn(modes[_f], '', _f));
                    }
                    */


                    /*

                    //layout
                    actions.push(_createSettings('None', 'View/Layout/None', 'fa-columns', SPLIT_MODE.SOURCE, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    actions.push(_createSettings('Horizontal', 'View/Layout/Horizontal', 'layoutIcon-horizontalSplit', SPLIT_MODE.SPLIT_HORIZONTAL, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    actions.push(_createSettings('Vertical', 'View/Layout/Vertical', 'layoutIcon-layout293', SPLIT_MODE.SPLIT_VERTICAL, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    */
                    //actions.push(_createSettings('Diff', 'View/Layout/Diff', 'fa-columns', 'Diff', null, 'View'));
                }

                if (DefaultActions.hasAction(permissions, LAYOUT)) {
                    actions.push(this.createAction({
                        label: 'Split',
                        command: 'View/Layout',
                        icon: 'fa-columns',
                        group: "View"
                    }));
                    //layout
                    actions.push(_createSettings('None', 'View/Layout/None', 'fa-columns', SPLIT_MODE.SOURCE, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    actions.push(_createSettings('Horizontal', 'View/Layout/Horizontal', 'layoutIcon-horizontalSplit', SPLIT_MODE.SPLIT_HORIZONTAL, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    actions.push(_createSettings('Vertical', 'View/Layout/Vertical', 'layoutIcon-layout293', SPLIT_MODE.SPLIT_VERTICAL, null, 'View', types.ACTION_TYPE.SINGLE_TOGGLE));
                    //actions.push(_createSettings('Diff', 'View/Layout/Diff', 'fa-columns', 'Diff', null, 'View'));
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
                        icon: icon,
                        mixin: {
                            addPermission: true,
                            value:value,
                            theme: value,
                            closeOnClick:false
                        },
                        onCreate:function(action) {
                            action._oldIcon = icon;
                            action.set('value', value);
                            action.actionType = types.ACTION_TYPE.SINGLE_TOGGLE;
                        }
                    });
                };

                //clean and complete theme data
                for (var i = 0; i < themes.length; i++) {
                    var data = themes[i];
                    var name = data[1] || data[0].replace(/ /g, "_").toLowerCase();
                    var theme = creatorFn(data[0], ' ', name);//@TODO: _MenuMixin not creating icon node, use white space for now
                    actions.push(theme);
                }
            },
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
            }
        }
    );
    Module.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;
    dcl.chainAfter('runAction',Module);
    return Module;
});