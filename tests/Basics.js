/** @module xgrid/Base **/
define([
    "xdojo/declare",
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xgrid/Grid',
    'xide/factory',
    "xide/views/CIViewMixin",
    'xide/layout/TabContainer',
    'xide/views/CIGroupedSettingsView',
    "xide/widgets/TemplatedWidgetBase"

], function (declare,dcl,types,
             utils, Grid, factory,CIViewMixin,TabContainer,

             CIGroupedSettingsView,
             TemplatedWidgetBase) {



    var actions = [],
        thiz = this,
        ACTION_TYPE = types.ACTION,
        ACTION_ICON = types.ACTION_ICON,
        grid,
        ribbon,
        CIS;




    var propertyStruct = {
        currentCIView:null,
        targetTop:null,
        _lastItem:null
    };


    function createTabClass(){
        return declare(TemplatedWidgetBase,{
            iconClass:null,
            open:true,
            titleBar:null,
            toggleNode:null,
            containerNode:null,
            show:function(){

                var container = $(this.containerRoot),
                    toggleNode = $(this.toggleNode);

                toggleNode.removeClass('collapsed');
                toggleNode.attr('aria-expanded',true);


                container.removeClass('collapse');
                container.addClass('collapse in');
                container.attr('aria-expanded',true);

            },
            hide:function(){

                var container = $(this.containerRoot),
                    toggleNode= $(this.toggleNode);

                toggleNode.addClass('collapsed');
                toggleNode.attr('aria-expanded',false);


                container.removeClass('collapse in');
                container.addClass('collapse');
                container.attr('aria-expanded',false);
            },
            postMixInProperties:function(){


                var closed = !this.open;
                this.ariaOpen = closed ? 'true' : 'false';
                this.containerClass = closed ? 'collapse' : 'collapse in';
                this.titleClass = closed ? 'collapsed' : '';

                var iconStr = this.iconClass ? '<span class="${!iconClass}"/>' : '';


                var toggleNodeStr =
                    '<a data-dojo-attach-point="toggleNode" href="#${!id}-Collapse" data-toggle="collapse" class="accordion-toggle ${!titleClass}" aria-expanded="${!ariaOpen}">'+
                        iconStr +   ' ${!title}'+
                    '</a>';

                this.templateString = '<div class="panel widget">'+

                    '<div class="panel-heading" data-dojo-attach-point="titleBar">'+

                        toggleNodeStr +

                    '</div>'+

                    '<div data-dojo-attach-point="containerRoot" class="panel-collapse ${!containerClass}" id="${!id}-Collapse" aria-expanded="${!ariaOpen}" style="">'+
                        '<div class="panel-body" data-dojo-attach-point="containerNode">'+
                    '</div>'+
                    '</div>'+

                    '</div>';

                this.inherited(arguments);
            }
        });
    };

    function _createTemplateBaseClass(){


        var templated = dcl(null,{

            templateUrl:'xide/tests/accordion_test.html',
            buildRenderering:function(){

                var _templateText = this._getTemplate();

                var root = $('div');
                var node = root.loadTemplate(require.toUrl(this.templateUrl));
                this.domNode = root;
            },
            _getTemplate:function(){
                return this.templateString || this._getText(this.templateUrl);
            },
            startup:function(){

                this.buildRenderering();

            },
            _getText:function(url){

                url = require.toUrl(url);
                var text = $.ajax({
                    url: url,
                    async:false
                });
                return text.responseText;
            }
        });

        return templated;

    }

    function doTests(tabContainer){

        var pane = tabContainer.createTab('bla bla');
        var pane2 = tabContainer.createTab('bla bla2','fa-cogs');

        //pane.hide();
        setTimeout(function(){
            //pane.show();
        },1000);


/*
        setTimeout(function(){
            pane.hide();
        },5000);
*/

    }


    function _createTabContainer(){

        var tabClass = declare(TemplatedWidgetBase,{
            templateString:'<div class="panel-group" data-dojo-attach-point="containerNode"/>',
            createTab:function(title,icon){

                return utils.addWidget(createTabClass(),{
                    title:title,
                    iconClass:icon
                },null,this.domNode,true);

            }

        });

        return tabClass;

    }


    function _createAccContainer(){

        var tabClass = declare(TemplatedWidgetBase,{
            templateString:'<div class="panel-group" data-dojo-attach-point="containerNode"/>',
            createTab:function(title,icon){

                return utils.addWidget(createTabClass(),{
                    title:title,
                    iconClass:icon
                },null,this.domNode,true);





/*
                '<div class="widget-controls">'+
                '<a data-widgster="load" title="Reload" href="#"><i class="glyphicon glyphicon-refresh"></i></a>'+
                '<a data-widgster="expand" title="Expand" href="#"><i class="fa fa-code"></i></a>'+
                '<a data-widgster="collapse" title="Collapse" href="#"><i class="glyphicon glyphicon-minus"></i></a>'+
                '<a data-widgster="fullscreen" title="Full Screen" href="#"><i class="glyphicon glyphicon-resize-full"></i></a>'+
                '<a data-widgster="restore" title="Restore" href="#"><i class="glyphicon glyphicon-resize-small"></i></a>'+
                '<a data-widgster="close" title="Close" href="#"><i class="glyphicon glyphicon-remove"></i></a>'+
                '</div>'+
                    */

                var closed = true;

                var ariaOpen = closed ? 'true' : 'false';
                var containerClass = closed ? 'collapse' : 'collapse in';
                var titleClass = closed ? 'collapsed' : '';

                var toggleNodeStr =
                    '<a data-dojo-attach-point="toggleNode" href="#collapseOneTwo" data-toggle="collapse" class="accordion-toggle ${!titleClass}" aria-expanded="${!ariaOpen}">'+
                        '${!title}'+
                    '</a>';
                    //'<a data-widgster="expand" title="Expand" href="#"><i class="fa fa-arrow-down"></i></a>';

                var panelTemplate = '<div class="panel widget">'+

                    '<div class="panel-heading" data-dojo-attach-point="titleBar">'+

                        toggleNodeStr +

                    '</div>'+

                    '<div data-dojo-attach-point="containerRoot" class="panel-collapse ${!containerClass}" id="collapseOneTwo" aria-expanded="${!ariaOpen}" style="">'+
                        '<div class="panel-body" data-dojo-attach-point="containerNode">'+
                            'asdfasdf'+
                        '</div>'+
                    '</div>'+

                '</div>'


                var pane  = utils.templatify(null,panelTemplate, this.domNode , {
                    iconClass:'fa-play',
                    title:title,
                    ariaOpen : ariaOpen,
                    containerClass:containerClass,
                    titleClass:titleClass,
                    show:function(){

                        var container = $(this.containerRoot),
                            toggleNode= $(this.toggleNode);

                        toggleNode.removeClass('collapsed');
                        toggleNode.attr('aria-expanded',true);


                        container.removeClass('collapse');
                        container.addClass('collapse in');
                        container.attr('aria-expanded',true);

                    },
                    hide:function(){

                        var container = $(this.containerRoot),
                            toggleNode= $(this.toggleNode);

                        toggleNode.addClass('collapsed');
                        toggleNode.attr('aria-expanded',false);


                        container.removeClass('collapse in');
                        container.addClass('collapse');
                        container.attr('aria-expanded',false);
                    }
                });


                return pane;

                /*
                var panel = $(panelTemplate);

                $(this.domNode).append(panel);*/


            }
        });

        return tabClass;

    }





    var createDelegate = function(){

        return {

        }


    }


    /*
     * playground
     */
    var _lastGrid = window._lastBoot;
    var ctx = window.sctx,
        ACTION = types.ACTION,
        root,
        scope,
        blockManager,
        driverManager,
        marantz;



    var _actions = [
        ACTION.RENAME
    ];

    if (ctx) {







        blockManager = ctx.getBlockManager();
        driverManager = ctx.getDriverManager();
        //marantz  = driverManager.getItemById("235eb680-cb87-11e3-9c1a-0800200c9a66");
        //scope = createScope();

        //openDriverSettings(marantz);

        var toolbar = ctx.mainView.getToolbar();
        var docker = ctx.mainView.getDocker();
        var parent  = window.bootTab;
        if(parent){
            docker.removePanel(parent);
        }



        parent = docker.addTab(null, {
            title: 'Marantz/Marantz',
            icon: 'fa-exchange'
        });

        window.bootTab = parent;

        var _accHTML = require.toUrl('xide/tests/accordion_test.html');


        var cls = _createTabContainer();

        var widget = utils.addWidget(cls,{},null,parent,true);

        doTests(widget);






        //var _accHTML = require.toUrl('xide/tests/breadcrumb_test.html');

        //var _accHTML = require.toUrl('xide/tests/acc_test.html');



        //var _accHTML = require.toUrl('xide/tests/notification_test.html');




        /*
         template.startup();

         var domNode = template.domNode;
         console.log(domNode);*/




        //console.log(templateText);




        /*
         var widget = declare('x',TemplatedWidgetBase,{
         templateString:template
         });



         utils.addWidget(widget,{},null,parent,true);
         */


        return declare('a',null,{});

    }

    return Grid;

});