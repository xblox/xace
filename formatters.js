define([
    'xace/lib_jsbeautify'
    ], function (jsbeautify) {


    function formatCode(editor, mode){
        if (this.disabled === true)
            return;

        var ace = editor;
        var sel = ace.selection;
        var session = ace.session;
        var range = sel.getRange();

        /*
        session.diffAndReplace = function(range, text) {
            var doc = this.doc;
            var start = doc.positionToIndex(range.start);
            var oldText = doc.getTextRange(range);
            merge.patchAce(oldText, text, doc, {
                offset: start,
                method: "quick"
            });
            var dl = text.replace(/\r\n|\r|\n/g, doc.getNewLineCharacter()).length;
            return doc.indexToPosition(start + dl);
        };*/

        // Load up current settings data
        /*
         var options = {
         space_before_conditional: settings.getBool("user/format/jsbeautify/@space_before_conditional"),
         keep_array_indentation: settings.getBool("user/format/jsbeautify/@keeparrayindentation"),
         preserve_newlines: settings.getBool("user/format/jsbeautify/@preserveempty"),
         unescape_strings: settings.getBool("user/format/jsbeautify/@unescape_strings"),
         jslint_happy: settings.getBool("user/format/jsbeautify/@jslinthappy"),
         brace_style: settings.get("user/format/jsbeautify/@braces")
         };
         */

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
        if(value.length==0){
            value = session.getValue();
        }
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

        //var end = session.diffAndReplace(range, value);

        //sel.setSelectionRange(Range.fromPoints(range.start, end));

        return value;
    }

    return {
        format:formatCode,
        modes : {
            "javascript" : "Javascript (JS Beautify)",
            "html"       : "HTML (JS Beautify)",
            "css"        : "CSS (JS Beautify)",
            "less"       : "Less (JS Beautify)",
            "xml"        : "XML (JS Beautify)",
            "json"       : "JSON (JS Beautify)",
            "handlebars" : "Handlebars (JS Beautify)"
        }
    }
});