define(function(require, exports, module) {

    function _main(options, imports, register){


        var Plugin = imports.Plugin;
        var format = imports.format;
        var settings = imports.settings;
        var prefs = imports.preferences;
        var jsbeautify = require("./lib_jsbeautify");
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        // var emit = plugin.getEmitter();
        
        var MODES = {
            "javascript" : "Javascript (JS Beautify)",
            "html"       : "HTML (JS Beautify)",
            "css"        : "CSS (JS Beautify)",
            "less"       : "Less (JS Beautify)",
            "xml"        : "XML (JS Beautify)",
            "json"       : "JSON (JS Beautify)",
            "handlebars" : "Handlebars (JS Beautify)"
        };
        
        var loaded = false;

        function load() {
            if (loaded) return false;
            loaded = true;
            
            Object.keys(MODES).forEach(function(name) {
                format.addFormatter(MODES[name], name, plugin);
            });
            
            settings.on("read", function(){
                settings.setDefaults("user/format/jsbeautify", [
                    ["preserveempty", "true"],
                    ["keeparrayindentation", "false"],
                    ["jslinthappy", "false"],
                    ["braces", "end-expand"],
                    ["space_before_conditional", "true"],
                    ["unescape_strings", "true"]
                ]);
            });
            
            format.on("format", function(e) {
                if (MODES[e.mode])
                    return formatCode(e.editor, e.mode);
            });
        }

        

        function formatCode(editor, mode) {
            if (this.disabled === true)
                return;
    
            var ace = editor.ace;
            var sel = ace.selection;
            var session = ace.session;
            var range = sel.getRange();
            var options = {
                space_before_conditional: true,
                keep_array_indentation: false,
                preserve_newlines: true,
                unescape_strings: true,
                jslint_happy: false,
                brace_style: "end-expand"
            };
            var useSoftTabs = true;
            if (useSoftTabs) {
                options.indent_char = " ";
                options.indent_size = session.getTabSize();
            } else {
                options.indent_char = "\t";
                options.indent_size = 1;
            }
    
            var line = session.getLine(range.start.row);
            var indent = line.match(/^\s*/)[0];
            var trim = false;
    
            if (range.start.column < indent.length)
                range.start.column = 0;
            else
                trim = true;
    
            var value = session.getTextRange(range);
            var type = null;
    
            if (mode == "javascript" || mode == "json") {
                type = "js";
            } else if (mode == "css" || mode == "less"){
                type = "css";
            } else if (/^\s*<!?\w/.test(value)) {
                type = "html";
            } else if (mode == "xml") {
                type = "html";
            } else if (mode == "html") {
                if (/[^<]+?{[\s\-\w]+:[^}]+;/.test(value))
                    type = "css";
                else if (/<\w+[ \/>]/.test(value))
                    type = "html";
                else
                    type = "js";
            } else if (mode == "handlebars") {
                options.indent_handlebars = true;
                type = "html";
            }
    
            try {
                value = jsbeautify[type + "_beautify"](value, options);
                if (trim)
                    value = value.replace(/^/gm, indent).trim();
                if (range.end.column === 0)
                    value += "\n" + indent;
            }
            catch (e) {
                return false;
            }
    
            var end = session.diffAndReplace(range, value);

            sel.setSelectionRange(Range.fromPoints(range.start, end));
            
            return true;
        }
    }
});