/*

    Author				:	Neil Johnson
    Date				:	2020-12-09
    Script name 		:	H5MWS068B_PrintLbl
    Script arguments	:
    Prerequisites		:
            
    User highlight balance id in MWS068 and then clicks script button. Execute MMS060MI.PrtPutAwayLbl API with warehouse, item number, location, lot number, and container number assigned to the API fields.
   
    *Nbr   Date   User id     Description
    *NJ01 201209  NJOHNSON    Copy of H5MMS060B_PrintLbl for change from using MWS068 instead of MWS060

*/
var H5MWS068B_PrintLbl = /** @class */ (function () {
    function H5MWS068B_PrintLbl(scriptArgs) {
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
    H5MWS068B_PrintLbl.Init = function (args) {
        new H5MWS068B_PrintLbl(args).run();
    };
    H5MWS068B_PrintLbl.prototype.run = function () {
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
        var top = 9;
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 3) / 10;
        var eid = "h5btn_movecontainer" + Math.floor(Math.random() * 10000);
        var buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Print Pallet Label";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;
        buttonElement.Position.Width = "auto";
        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.click({}, function () {
            var self = _this;
            _this.OnClickButton();
        });
    };
    H5MWS068B_PrintLbl.prototype.OnClickButton = function () {
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
        if (listBANO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field BANO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }
        // get CAMU
        var listCAMU = list.GetValueByColumnName("CAMU");
        if (listCAMU == null) {
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
                CAMU = listCAMU[i];
                WHLO = listWHLO[i];
                ITNO = listITNO[i];
                WHSL = listWHSL[i];
                BANO = listBANO[i];
                // API Call to retreive package quantity
                var record = {
                    "CAMU": CAMU,
                    "WHLO": WHLO,
                    "ITNO": ITNO,
                    "WHSL": WHSL,
                    "BANO": BANO,
                    "COPY": "1"
                };
                var url = this.createAPIRequestUrl("MMS060MI", "PrtPutAwayLbl", record);
                console.log("URL = " + url);
                ScriptUtil.ApiRequest(url, this.OnSuccess, this.OnFail);
            }
        }
        this.$button.removeAttr("disabled");
    };
    H5MWS068B_PrintLbl.prototype.createAPIRequestUrl = function (program, transaction, input) {
        var url = "/execute/" + program + "/" + transaction + "?";
        var keys = $.map(input, function (value, key) {
            url += key + "=" + value + "&";
        });
        return url;
    };
    H5MWS068B_PrintLbl.prototype.OnFail = function (e, msg) {
        console.log("On Fail; " + msg);
        ConfirmDialog.Show({
            header: "MIAccess error",
            message: msg,
            dialogType: "Error"
        });
    };
    H5MWS068B_PrintLbl.prototype.OnSuccess = function (response) {
        console.log("On Success");
        ConfirmDialog.Show({
            header: "MIAccess success",
            message: "Putaway Label Printed!",
            dialogType: "Information"
        });
    };
    H5MWS068B_PrintLbl.prototype.parseArgs = function (args) {
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
    H5MWS068B_PrintLbl.prototype.getScreenFieldValue = function (fieldName) {
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
    H5MWS068B_PrintLbl.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return H5MWS068B_PrintLbl;
}());
//# sourceMappingURL=H5MWS068B_PrintLbl.js.map