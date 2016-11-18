define([
    "dcl/dcl",
    "xide/model/Component",
    "xide/utils",
    "dojo/has",
    "require"
], function (declare, Component, utils, has, require) {
    /**
     * @class xideve.component
     * @extends module:xide/model/Component
     */
    return dcl(Component, {
        declaredClass: 'xace/component',
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Implement base interface
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        getDependencies: function () {
            if (has('xace') === false) {
                return [];
            }
            return [];
        },
        /**
         * @inheritDoc
         */
        getLabel: function () {
            return 'xace';
        },
        /**
         * @inheritDoc
         */
        run: function () {
            var _re = require;
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
        onReady: function () {
        }
    });
});
