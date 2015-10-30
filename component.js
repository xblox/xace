define([
    "dojo/_base/declare",
    "xide/model/Component",
    "xide/utils",
    "dojo/has",
    "require"
], function (declare,Component,utils,has,require) {

    /**
     * @class xideve.component
     * @extends module:xide/model/Component
     */
    return declare('xideve/component',[Component], {

        cmdOffset:'',
        userBaseUrl:'',
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Implement base interface
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        getDependencies:function(){
            if(has('xideve')==false){
                return [];
            }
            return [
                'dcl/dcl',
                'xdojo/declare',
                'xdojo/has',
                'xideve/types',
                'xideve/views/VisualEditor',
                'xideve/Embedded',
                'xide/widgets/ExpressionJavaScript',
                'xideve/manager/WidgetManager',
                'xideve/manager/ContextManager',
                'xideve/Templates',
                'xideve/Template'
            ];
        },
        /**
         * @inheritDoc
         */
        getLabel: function () {
            return 'xideve';
        },
        /**
         * @inheritDoc
         */
        getBeanType:function(){
            return this.getLabel();
        },
        /**
         * @inheritDoc
         */
        run:function(){
            var _re = require;
            var _em = _re('xideve/Embedded');
            var veEmbedded = new _em();

            /*
            veEmbedded.started=function(){
                has.add('xideve',function(){return true});
                this.onReady();
            }.bind(this);
            */

            if(!this.userBaseUrl){
                this.userBaseUrl = dojo.baseUrl;
            }

            veEmbedded.start(this.ctx,false,this.cmdOffset,this.userBaseUrl).then(function(embedded){
                has.add('xideve',function(){return true});
                this.onReady();
            }.bind(this));
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Post work
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Register editors and add managers to the current context
         * @callback
         */
        onReady:function(){


            var VisualEditor = utils.getObject('xideve/views/VisualEditor'),
                WidgetManager = utils.getObject('xideve/manager/WidgetManager'),
                ContextManager = utils.getObject('xideve/manager/ContextManager'),
                ctx = this.ctx;

            /**
             * Register editors
             */
            this.ctx.registerEditorExtension('Visual Editor','cfhtml','fa-laptop',this,true,null,VisualEditor,{
                updateOnSelection:false,
                leftLayoutContainer:null,
                rightLayoutContainer:null,
                ctx:this.ctx,
                mainView:this.ctx.mainView
            });

            if(has('delite')){


                //temp.
                var templateClass = utils.getObject('xideve/Template'),

                    templateRegistry = utils.getObject('xideve/Templates'),

                    templateInstance = new templateClass({
                        contextClass:'xideve/delite/Context',
                        resourceDelegate:this.ctx.getResourceManager(),
                        baseUrl:dojo.baseUrl + 'ibm-js/',
                        ctx:this.ctx,
                        getDependencies:function(){
                            return [this.contextClass];
                        },
                        templateVariables:{
                            requireUrl : dojo.baseUrl + 'ibm-js/requirejs/require.js',
                            jQueryUrl:dojo.baseUrl + 'external/jquery-1.9.1.min.js'
                        },
                        bodyStyle:{
                            width:"100%",
                            height:"100%",
                            visibility:"visible",
                            margin:"0"
                        },
                        bodyTheme:"superhero",
                        bootstrapModules:""

                    });

                templateRegistry.register('delite',templateInstance);

                this.ctx.registerEditorExtension('Visual Editor', 'dhtml', 'fa-laptop', this, true, null, VisualEditor, {
                    updateOnSelection: false,
                    leftLayoutContainer: null,
                    rightLayoutContainer: null,
                    ctx: this.ctx,
                    mainView: this.ctx.mainView,
                    beanContextName:this.ctx.mainView.beanContextName,
                    template:templateInstance

                });

                this.ctx.registerEditorExtension('Visual Editor', 'html', 'fa-laptop', this, false, null, VisualEditor, {
                    updateOnSelection: false,
                    leftLayoutContainer: null,
                    rightLayoutContainer: null,
                    ctx: this.ctx,
                    mainView: this.ctx.mainView,
                    beanContextName:this.ctx.mainView.beanContextName,
                    template:templateInstance
                });


                this.ctx.registerEditorExtension('New Window', 'html|cfhtml|dhtml', 'fa-globe', this, false, function(item,extraArgs,overrides,where){
                    var itemUrl = ctx.getFileManager().getImageUrl(item,null,{
                        viewer:'xideve'
                    });
                    window.open(itemUrl);
                });

            }

            if(!this.ctx.getWidgetManager()){
                this.ctx.widgetManager=this.ctx.createManager(WidgetManager,null);
                this.ctx.widgetManager.init();
            }

            if(!this.ctx.getContextManager()){
                this.ctx.contextManager=this.ctx.createManager(ContextManager,null);
                this.ctx.contextManager.init();
            }

        }

    });
});

