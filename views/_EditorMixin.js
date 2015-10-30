define([
        "dojo/_base/declare"
    ],function (declare){
        /**
         * Adds minimum comfort to an editor ready to be used in xide/xfile
         */
        return declare("xide.views._EditorMixin",null,{

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
            /**
             *
             */
            onLoaded:function(){
                this.set('iconClass', this.iconClassNormal);
            },
            /**
             * getContent reads the remote file's content and passes it onto onSuccess
             * @param item
             * @param onSuccess
             */
            getContent:function(item,onSuccess){

                var thiz=this;
                this.set('iconClass', this.loadingIcon);
                var _ready = function(content){
                    thiz.onLoaded();
                    onSuccess(content);
                };
                this.ctx.getFileManager().getContent(item.mount,item.path,_ready);
            },

            saveContent:function(value,item,onSuccess,onError){
                this.ctx.getFileManager().setContent(item.mount,item.path,value,onSuccess);
            },
            startup:function(){

                //save icon class normal
                this.iconClassNormal = '' + this.iconClass;
                this.set('iconClass', this.loadingIcon);
                this.inherited(arguments);
            }
        });
    });