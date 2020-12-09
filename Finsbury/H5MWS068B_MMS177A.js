/*

    Author				:	Neil Johnson
    Date				:	2020-12-09
    Script name 		:	H5MWS068B_MMS177A
    Script arguments	:
    Prerequisites		:
            
    User highlight balance id in MWS068 and then clicks script button. MMS177 opens with warehouse, location, item number, lot number, container number and qty carried across to new program.
   
    *Nbr   Date   User id     Description
    *NJ01 200417  NJOHNSON    Copy of H5MMS060B_MMS177A for change from using MWS068 instead of MWS060

*/
var H5MWS068B_MMS177A = /** @class */ (function () {
    function H5MWS068B_MMS177A(scriptArgs) {
        this.allowedPanels = ["MWA068BC"];
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        //  Set debug on to be true
        this.debugOn = true;
    }
    /**
     * Script initialization function.
     */
    H5MWS068B_MMS177A.Init = function (args) {
        new H5MWS068B_MMS177A(args).run();
    };
    H5MWS068B_MMS177A.prototype.run = function () {
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
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 103) / 10;
        var eid = "h5btn_movebalid" + Math.floor(Math.random() * 10000);
        var buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Move Bal Id";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;
        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.attr("style", "width: 100px");
        this.$button.click({}, function () {
            _this.OnClickButton();
        });
    };
    H5MWS068B_MMS177A.prototype.OnClickButton = function () {
        this.$button.attr("disabled", "disabled");
        // Loop selected rows
        var validFields = true;
        var ITNO, WHSL, BANO, CAMU, WHLO;
        var list = ListControl.ListView;
        var rows = ListControl.ListView.SelectedItem();
        if (rows.length <= 0) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "No rows selected.",
                dialogType: "Error"
            });
        }
        // get ITNO
        var listITNO = list.GetValueByColumnName("ITNO");
        if (listITNO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field ITNO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get WHSL
        var listWHSL = list.GetValueByColumnName("WHSL");
        if (listWHSL == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field WHSL is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get BANO
        var listBANO = list.GetValueByColumnName("BANO");
        if (listWHSL == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field BANO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get CAMU
        var listCAMU = list.GetValueByColumnName("CAMU");
        if (listWHSL == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field CAMU is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get warehouse
        var listWHLO = list.GetValueByColumnName("WHLO");
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
                ITNO = listITNO[i];
                WHSL = listWHSL[i];
                BANO = listBANO[i];
                CAMU = listCAMU[i];
                WHLO = listWHLO[i];
                // create an instance of MFormsAutomation
                var auto = new MFormsAutomation();
                auto.addStep(ActionType.Run, "MMS177");
                auto.addStep(ActionType.Set, "WWTWSL");
                auto.addField("WWWHLO", WHLO);
                auto.addField("WWWHSL", WHSL);
                auto.addField("WWITNO", ITNO);
                auto.addField("WWBANO", BANO);
                auto.addField("WWCAMU", CAMU);
                auto.setFocus("WWTWSL");
                var uri = auto.toEncodedUri();
                ScriptUtil.Launch(uri);
            }
        }
        this.$button.removeAttr("disabled");
    };
    H5MWS068B_MMS177A.prototype.parseArgs = function (args) {
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
    H5MWS068B_MMS177A.prototype.getScreenFieldValue = function (fieldName) {
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
    H5MWS068B_MMS177A.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return H5MWS068B_MMS177A;
}());
//# sourceMappingURL=H5MWS068B_MMS177A.js.map