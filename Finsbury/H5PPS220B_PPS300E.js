/*

    Author				:	Neil Johnson
    Date				:	2020-04-17
    Script name 		:	H5PPS220B_PPS300E
    Script arguments	:
    Prerequisites		:
            
    User highlight PO line in PPS220, presses the script button which takes the PO number and item number across to PPS300/E automatically
   
    *Nbr   Date   User id     Description
    *NJ01 200417  NJOHNSON    Re-written during uplift as used another script H5Automate which didn't work in new version

*/
var H5PPS220B_PPS300E = /** @class */ (function () {
    function H5PPS220B_PPS300E(scriptArgs) {
        this.allowedPanels = ["PPA220BC"];
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        //  Set debug on to be true
        this.debugOn = true;
    }
    /**
     * Script initialization function.
     */
    H5PPS220B_PPS300E.Init = function (args) {
        new H5PPS220B_PPS300E(args).run();
    };
    H5PPS220B_PPS300E.prototype.run = function () {
        var _this = this;
        this.contentElement = this.controller.GetContentElement();
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
        // Add the button to panel
        var top = 5;
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 104) / 10;
        var eid = "h5btn_goodsreceiptsingle" + Math.floor(Math.random() * 10000);
        var buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Goods Receipt - Single";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = 5;
        buttonElement.Position.Left = left;
        buttonElement.Position.Width = "auto";
        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.click({}, function () {
            _this.OnClickButton();
        });
    };
    H5PPS220B_PPS300E.prototype.OnClickButton = function () {
        this.$button.attr("disabled", "disabled");
        // Loop selected rows
        var validFields = true;
        var PUNO, PNLI, WHLO;
        var list = ListControl.ListView;
        var rows = ListControl.ListView.SelectedItem();
        if (rows.length <= 0) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "No rows selected.",
                dialogType: "Error"
            });
        }
        // get PO Number
        var listPUNO = list.GetValueByColumnName("PUNO");
        this.debug("I", "" + listPUNO);
        if (listPUNO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field PUNO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get line
        var listPNLI = list.GetValueByColumnName("PNLI");
        this.debug("I", "" + listPNLI);
        if (listPNLI == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field PNLI is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get warehouse
        var listWHLO = list.GetValueByColumnName("WHLO");
        this.debug("I", "" + listWHLO);
        if (listWHLO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field WHLO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        if (validFields) {
            for (var i = 0; i < rows.length; i++) {
                var idx = rows[i];
                PUNO = listPUNO[i];
                PNLI = listPNLI[i];
                WHLO = listWHLO[i];
                this.debug("I", "" + idx);
                this.debug("I", "PUNO:" + PUNO);
                this.debug("I", "PNLI:" + PNLI);
                this.debug("I", "WHLO:" + WHLO);
                // create an instance of H5Automate
                var auto = new MFormsAutomation();
                auto.addStep(ActionType.Run, "PPS300");
                auto.addField("WWQTTP", "1");
                auto.addStep(ActionType.Key, "ENTER");
                auto.addField("WWWHLO", WHLO);
                auto.addField("WWPUNO", PUNO);
                auto.addField("WWPNLI", PNLI);
                auto.addField("W1PNLI", PNLI);
                auto.addStep(ActionType.Key, "ENTER");
                auto.addField("S1PNLI", PNLI);
                auto.addField("S1WHLO", WHLO);
                auto.addStep(ActionType.ListOption, "2");
                var uri = auto.toEncodedUri();
                ScriptUtil.Launch(uri);
            }
        }
        this.$button.removeAttr("disabled");
    };
    H5PPS220B_PPS300E.prototype.parseArgs = function (args) {
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
    H5PPS220B_PPS300E.prototype.getScreenFieldValue = function (fieldName) {
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
    H5PPS220B_PPS300E.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return H5PPS220B_PPS300E;
}());
//# sourceMappingURL=H5PPS220B_PPS300E.js.map