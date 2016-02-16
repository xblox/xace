define([
    "dcl/dcl",
    "xdojo/declare",
    "module",
    "xace/base_handler",
    "xace/complete_util"
],function (dcl,declare,module,baseLanguageHandler,completeUtil){

    var analysisCache = {}; // path => {identifier: 3, ...}
    var globalWordIndex = {}; // word => frequency
    var globalWordFiles = {}; // word => [path]
    var precachedPath;
    var precachedDoc;

    var completer = module.exports = Object.create(baseLanguageHandler);

    completer.handlesLanguage = function(language) {
        return true;
    };

    completer.handlesEditor = function() {
        return this.HANDLES_ANY;
    };

    completer.getMaxFileSizeSupported = function() {
        return 1000 * 1000;
    };

    function frequencyAnalyzer(path, text, identDict, fileDict) {
        var identifiers = text.split(/[^a-zA-Z_0-9\$]+/);
        for (var i = 0; i < identifiers.length; i++) {
            var ident = identifiers[i];
            if (!ident)
                continue;

            if (Object.prototype.hasOwnProperty.call(identDict, ident)) {
                identDict[ident]++;
                fileDict[ident][path] = true;
            }
            else {
                identDict[ident] = 1;
                fileDict[ident] = {};
                fileDict[ident][path] = true;
            }
        }
        return identDict;
    }

    function removeDocumentFromCache(path) {
        var analysis = analysisCache[path];
        if (!analysis) return;

        for (var id in analysis) {
            globalWordIndex[id] -= analysis[id];
            delete globalWordFiles[id][path];
            if (globalWordIndex[id] === 0) {
                delete globalWordIndex[id];
                delete globalWordFiles[id];
            }
        }
        delete analysisCache[path];
    }

    function analyzeDocument(path, allCode) {
        if (!analysisCache[path]) {
            if (allCode.size > 80 * 10000) {
                delete analysisCache[path];
                return;
            }
            // Delay this slightly, because in Firefox document.value is not immediately filled
            analysisCache[path] = frequencyAnalyzer(path, allCode, {}, {});
            // may be a bit redundant to do this twice, but alright...
            frequencyAnalyzer(path, allCode, globalWordIndex, globalWordFiles);
        }
    }

    completer.onDocumentOpen = function(path, doc, oldPath, callback) {
        if (!analysisCache[path]) {
            analyzeDocument(path, doc.getValue());
        }
        callback();
    };

    completer.addDocument = function(path, value) {
        if (!analysisCache[path]) {
            analyzeDocument(path, value);
        }

    };

    completer.onDocumentClose = function(path, callback) {
        removeDocumentFromCache(path);
        if (path == precachedPath)
            precachedDoc = null;
        callback();
    };

    completer.analyze = function(doc, ast, callback, minimalAnalysis) {
        if (precachedDoc && this.path !== precachedPath) {
            removeDocumentFromCache(precachedPath);
            analyzeDocument(precachedPath, precachedDoc);
            precachedDoc = null;
        }
        precachedPath = this.path;
        precachedDoc = doc;
        callback();
    };

    completer.complete = function(editor, fullAst, pos, currentNode, callback) {

        var doc = editor.getSession();
        var line = doc.getLine(pos.row);
        var identifier = completeUtil.retrievePrecedingIdentifier(line, pos.column, this.$getIdentifierRegex());
        var identDict = globalWordIndex;

        var allIdentifiers = [];
        for (var ident in identDict) {
            allIdentifiers.push(ident);
        }
        var matches = completeUtil.findCompletions(identifier, allIdentifiers);

        var currentPath = this.path;
        matches = matches.filter(function(m) {
            return !globalWordFiles[m][currentPath];
        });

        matches = matches.slice(0, 100); // limits results for performance

        callback(matches.filter(function(m) {
            return !m.match(/^[0-9$_\/]/);
        }).map(function(m) {
            var path = Object.keys(globalWordFiles[m])[0] || "[unknown]";
            var pathParts = path.split("/");
            var foundInFile = pathParts[pathParts.length-1];
            return {
                name: m,
                value: m,
                icon: null,
                score: identDict[m],
                meta: foundInFile,
                priority: 0,
                isGeneric: true
            };
        }));
    };

    completer.getCompletions=function (editor, session, pos, prefix, callback) {
        var completions = null;
        var _c = function(_completions){
            completions = _completions;
        };
        completer.complete(editor,null,pos,null,_c);
        callback(null,completions);
    };

    var Module  = dcl(null,{

        declaredClass:"xide.views._AceMultiDocs",
        didAddMCompleter:false,
        multiFileCompleter:null,
        addFileCompleter:function(){
            var compl = null;
            if(!this.didAddMCompleter) {
                compl = completer;
                this.multiFileCompleter= compl;
                var langTools = ace.require("ace/ext/language_tools");
                langTools.addCompleter(compl);
                this.didAddMCompleter=true;
            }
            return compl;
        }
    });

    Module.completer = completer;

    return Module;
});