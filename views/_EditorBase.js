define([
    "dojo/_base/declare",
    // lang.hitch
    "dojo/_base/connect",    //keyboard handler
    'xide/types',
    'xide/factory'

], function (declare, connect,types,factory) {

    // module:
    //		xide/views/_EditorBase

    return declare("xide.views._EditorBase",null,
        {
            // summary:
            //		EditorBase provides minimum functionality for editors.
            //      It also describes the editor's protocol to store actual content

            storeDelegate:null,
            // storeDelegate: {Object}
            //		- A delegate to receive and store the editor's content
            content:null,
            // item: {Object}
            //		- A store item, ususally used also a reference for delegates
            item:null,
            ctrlDown:false,
            getEditor:function(){
                return this;
            },
            focus:function(evt){
                this.getEditor().focus();
            },
            getContent:function(onSuccess,onError){

                if(!this.storeDelegate){
                    if(onError){
                        onError('Editor::getContent : Have no store delegate!');
                    }
                }else{

                    var _cb=function(content){

                        onSuccess(content);
                    };

                    this.storeDelegate.getContent(_cb,this.dataItem);
                }
            },
            saveContent:function(onSuccess,onError){

                var thiz=this;
                this.set('iconClass', 'fa-spinner fa-spin');

                var _value = this.getValue();
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
                        if(onSuccess){
                            onSuccess(arguments);
                        }
                        var struct = {
                            path:thiz.filePath,
                            item:thiz.dataItem,
                            content:_value,
                            editor:thiz
                        };
                        thiz.publish(types.EVENTS.ON_FILE_CONTENT_CHANGED,struct,thiz);
                    };
                    this.storeDelegate.saveContent(_value,_s,null,this.dataItem);
                }
            },
            getKeyboardNode:function(){

            },
            setupKeyboard:function(){
                var thiz=this;
                //click on root, try to focus
                connect.connect(this.containerNode, "onclick", function(evt)
                {
                    thiz.focus(evt);
                });
/*
                //mod key on ?
                connect.connect(this.domNode, "onkeyup", function(evt)
                {
                    if(evt.keyCode==17){
                        thiz.ctrlDown=false;
                    }
                });
*/
                /*
                connect.connect(this.containerNode, "onkeydown", function(evt)
                {

                    if(evt.keyCode==17){
                        thiz.ctrlDown=true;
                    }
                    if(thiz.ctrlDown && evt.keyCode==83)
                    {
                        evt.preventDefault();
                        thiz.saveContent();
                    }
                });
                */
            },
            startup:function(){
                this.inherited(arguments);
                this.setupKeyboard();
            }
        });

});
