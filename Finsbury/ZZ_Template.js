/*

    Author				:	Neil Johnson
    Date				:	2017-08-08
    ISO version			:	10.2.1.1.5
    Script name 		:	ZZ_Template
    Script arguments	:
    Prerequisites		:
            
    <- Enter description of script here ->

*/
var ZZ_Template = /** @class */ (function () {
    function ZZ_Template(scriptArgs) {
        this.allowedPanels = ["????????"];
        this.checkKeys = [""];
        this.checkOpts = [""];
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        //  Set debug on to be true
        this.debugOn = true;
    }
    /**
     * Script initialization function.
     */
    ZZ_Template.Init = function (args) {
        new ZZ_Template(args).run();
    };
    ZZ_Template.prototype.run = function () {
        var _this = this;
        //  Get panel name 
        this.panelName = this.controller.GetPanelName();
        //  Check panel
        if (this.allowedPanels.indexOf(this.panelName, 0) < 0) {
            this.log.Error("Script cannot be run in " + this.panelName);
            return;
        }
        // Parse the script argument string and return if the arguments are invalid.
        if (!this.parseArgs(this.args)) {
            return;
        }
        this.unsubscribeRequesting = this.controller.Requesting.On(function (e) {
            _this.onRequesting(e);
        });
        this.unsubscribeRequested = this.controller.Requested.On(function (e) {
            _this.onRequested(e);
        });
    };
    ZZ_Template.prototype.parseArgs = function (args) {
        try {
            //  Split arguments
            var split = args.split(",");
            this.debug("I", "number of args:" + split.length);
            return true;
        }
        catch (ex) {
            this.log.Error("Failed to parse argument string " + args, ex);
            return false;
        }
    };
    ZZ_Template.prototype.getScreenFieldValue = function (fieldName) {
        var fieldValue = null;
        try {
            var type = this.controller.ParentWindow.find("#" + fieldName).get(0).tagName;
            if (type === "INPUT" || type === "SELECT") {
                fieldValue = ScriptUtil.GetFieldValue(fieldName);
            }
            else {
                fieldValue = this.controller.ParentWindow.find("#" + fieldName).text();
            }
        }
        catch (err) {
            this.debug("I", "Field not found " + fieldName);
            this.debug("I", "Error in getSreenFieldValue:" + err.message);
        }
        return fieldValue;
    };
    ZZ_Template.prototype.continueProcess = function () {
        var _this = this;
        this.debug("I", "continueProcess : " + this.cmdType + " " + this.cmdValue);
        setTimeout(function () {
            _this.debug("I", "cmdType:" + _this.cmdType);
            _this.debug("I", "cmdValue:" + _this.cmdValue);
            if (_this.cmdType === "KEY") {
                _this.controller.PressKey(_this.cmdValue);
            }
            else {
                _this.controller.ListOption(_this.cmdValue);
            }
        }, 0);
    };
    ZZ_Template.prototype.onRequesting = function (args) {
        this.debug("I", "onRequesting");
        this.cmdType = args.commandType;
        this.cmdValue = args.commandValue;
        this.debug("I", "cmdType : " + this.cmdType);
        this.debug("I", "cmdValue : " + this.cmdValue);
        //  If check not required for function key or option then return
        if ((this.cmdType === "KEY" && (this.checkKeys.indexOf(this.cmdValue) === -1)) ||
            (this.cmdType === "LSTOPT" && this.checkOpts.indexOf(this.cmdValue) === -1))
            return;
        args.cancel = true;
    };
    ZZ_Template.prototype.onRequested = function (args) {
        this.unsubscribeRequested();
        this.unsubscribeRequesting();
    };
    ZZ_Template.prototype.setBusy = function (busy, delay, modal) {
        if (delay === void 0) { delay = 0; }
        if (modal === void 0) { modal = true; }
        if (busy) {
            $('body').inforBusyIndicator({ text: 'Loading...', delay: delay, modal: modal });
        }
        else {
            $('body').inforBusyIndicator('close');
        }
    };
    ZZ_Template.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return ZZ_Template;
}());
//# sourceMappingURL=ZZ_Template.js.map