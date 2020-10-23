var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/*

    Author				:	Neil Johnson
    Date				:	2020-04-20
    Script name 		:	ReasonCodeLaunchLevel2
    Script arguments	:
    Prerequisites		:
            
    User highlight record in CRS090 or PDS044 and then clicks script button. Launches Mongoose to maintain level 2 codes

*/
var ReasonCodeLaunchLevel2 = /** @class */ (function () {
    function ReasonCodeLaunchLevel2(scriptArgs) {
        this.allowedPanels = ["CRA090BC", "PDA044BC"];
        this.url1 = "https://mgeucent1ap.mtmgf.eu1.mongoosepaas.io/WSWebClient/session/open/{0}?page=formonly&form=";
        this.url2 = "(SETVARVALUES(InitialCommand=Refresh,";
        this.url3 = "))&notitle=1&=resizable&theme=Momentum&inforCurrentLocale=en-GB&inforCurrentLanguage=en-GB&forcesso=1&tenant={0}&configgroup={1}";
        this.formName = "FF_ReasonCodes";
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        //  Set debug on to be true
        this.debugOn = true;
    }
    /**
     * Script initialization function.
     */
    ReasonCodeLaunchLevel2.Init = function (args) {
        new ReasonCodeLaunchLevel2(args).run();
    };
    ReasonCodeLaunchLevel2.prototype.run = function () {
        var _this = this;
        this.contentElement = this.controller.GetContentElement();
        //  Get program name
        this.program = this.controller.GetProgramName();
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
        // Add placeholder div for the dialog if not already exist
        if (this.controller.ParentWindow.find("#mongooseWindowHtml").length < 1) {
            var dialogPlaceholderHtml = "<div id=\"mongooseWindow\" style=\"display:none\"></div>";
            this.controller.ParentWindow.append(dialogPlaceholderHtml);
        }
        // Add the button to panel
        var top = 0;
        var left = 10;
        var eid = "h5btn_launch" + Math.floor(Math.random() * 10000);
        var buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Level 2 Codes";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;
        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.attr("style", "position:absolute;top:-25px;left:-100px;width: 100px;");
        this.$button.click({}, function () {
            _this.OnClickButton();
        });
    };
    ReasonCodeLaunchLevel2.prototype.OnClickButton = function () {
        this.$button.attr("disabled", "disabled");
        // Loop selected rows
        var validFields = true;
        var level1;
        var list = ListControl.ListView;
        var rows = ListControl.ListView.SelectedItem();
        if (rows.length <= 0) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "No rows selected.",
                dialogType: "Error"
            });
        }
        if (this.program == "CRS090") {
            // get Reason code
            var listSCRE = list.GetValueByColumnName("SCRE");
            if (listSCRE == null) {
                ConfirmDialog.Show({
                    header: "Script Error",
                    message: "Field SCRE is not in View!",
                    dialogType: "Error"
                });
                validFields = false;
            }
        }
        if (this.program == "PDS044") {
            // get Reason code
            var listDICE = list.GetValueByColumnName("DICE");
            if (listDICE == null) {
                ConfirmDialog.Show({
                    header: "Script Error",
                    message: "Field DICE is not in View!",
                    dialogType: "Error"
                });
                validFields = false;
            }
        }
        if (validFields) {
            for (var i = 0; i < rows.length; i++) {
                if (this.program == "CRS090") {
                    level1 = listSCRE[i];
                }
                if (this.program == "PDS044") {
                    level1 = listDICE[i];
                }
                this.launchMongoose(level1);
            }
        }
        this.$button.removeAttr("disabled");
    };
    ReasonCodeLaunchLevel2.prototype.parseArgs = function (args) {
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
    ReasonCodeLaunchLevel2.prototype.launchMongoose = function (level1) {
        return __awaiter(this, void 0, void 0, function () {
            var split, id, dt, timestamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTenant()];
                    case 1:
                        _a.sent();
                        split = this.tenant.split("_");
                        id = split[1];
                        this.config = "FINSBURYFOODSCO_MONGOOSE_" + id + "_DEFAULT";
                        this.configgroup = "FINSBURYFOODSCO_MONGOOSE_" + id;
                        this.url1 = this.url1.replace("{0}", this.config);
                        this.url3 = this.url3.replace("{0}", this.tenant);
                        this.url3 = this.url3.replace("{1}", this.configgroup);
                        dt = new Date();
                        timestamp = Math.round(dt.getTime());
                        this.url = this.url1 + this.formName + this.url2;
                        this.url += "levelnumber=2" + ", ";
                        this.url += "program=" + this.program + ", ";
                        this.url += "level1=" + level1;
                        this.url += this.url3 + "&_" + timestamp;
                        this.debug("I", "url : " + this.url);
                        this.buildPopup();
                        return [2 /*return*/];
                }
            });
        });
    };
    ReasonCodeLaunchLevel2.prototype.buildPopup = function () {
        // Use self to get correct reference to the class in the button handlers.
        var self = this;
        this.log.Info("buildPoup");
        var placeHolder = this.controller.ParentWindow.find("#mongooseWindow");
        this.getCustomHTML(placeHolder);
        var dialog = this.controller.ParentWindow.find('#optionsDialog');
        var dialogButtons = [];
        dialog.inforMessageDialog({
            title: '<center><b>Reason Code Maintenance</b></center>',
            dialogType: 'General',
            width: 660,
            height: 410,
            position: "absolute",
            left: 778,
            top: 230,
            closeOnEscape: false,
            buttons: dialogButtons,
            open: function (e) {
            },
            beforeClose: function (e) {
            },
            close: function (e) {
                $("#optionsDialog").remove();
            }
        });
        this.log.Info("buildPoup end");
    };
    ReasonCodeLaunchLevel2.prototype.getCustomHTML = function (placeHolder) {
        var customHtml = "<div id=\"optionsDialog\" style=\"display:none;\"><div class=\"dialogFillContents\"><object type=\"text/html\" style=\"width:660px; height:390px;\" data=\"" + this.url + "\" ></object></div></div>";
        placeHolder.append(customHtml);
    };
    ReasonCodeLaunchLevel2.prototype.getTenant = function () {
        var _this = this;
        this.tenant = "";
        var myRequest = new MIRequest();
        myRequest.program = "GENERAL";
        myRequest.transaction = "GetCurrentUser";
        //Fields that should be returned by the transaction
        myRequest.outputFields = ["TEID"];
        //Input to the transaction
        myRequest.record = {};
        return MIService.Current.executeRequest(myRequest).then(function (response) {
            //Read results here
            for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
                var item = _a[_i];
                _this.tenant = item.TEID;
            }
        }).catch(function (response) {
            //Handle errors here
            _this.debug("E", response.errorMessage);
        });
    };
    ReasonCodeLaunchLevel2.prototype.setBusy = function (busy, delay, modal) {
        if (delay === void 0) { delay = 0; }
        if (modal === void 0) { modal = true; }
        if (busy) {
            $('body').inforBusyIndicator({ text: 'Loading...', delay: delay, modal: modal });
        }
        else {
            $('body').inforBusyIndicator('close');
        }
    };
    ReasonCodeLaunchLevel2.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return ReasonCodeLaunchLevel2;
}());
//# sourceMappingURL=ReasonCodeLaunchLevel2.js.map