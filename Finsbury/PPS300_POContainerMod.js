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
    Date				:	2020-04-17
    Script name 		:	PPS300_POContainerMod
    Script arguments	:
    Prerequisites		:
            
    This script will launch a Mongoose form to replace XPP001

*/
var PPS300_POContainerMod = /** @class */ (function () {
    function PPS300_POContainerMod(scriptArgs) {
        this.allowedPanels = ["PPA300BC", "PPA300E0", "PPA300E1"];
        this.checkKeys = ["ENTER"];
        this.checkOpts = [""];
        this.url1 = "https://mgeucent1ap.mtmgf.eu1.mongoosepaas.io/WSWebClient/session/open/{0}?page=formonly&form=";
        this.url2 = "(SETVARVALUES(InitialCommand=Refresh,";
        this.url3 = "))&notitle=1&=resizable&theme=Momentum&inforCurrentLocale=en-GB&inforCurrentLanguage=en-GB&forcesso=1&tenant={0}&configgroup={1}";
        this.formName = "FF_XPP001";
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        //  Set debug on to be true
        this.debugOn = true;
    }
    /**
     * Script initialization function.
     */
    PPS300_POContainerMod.Init = function (args) {
        new PPS300_POContainerMod(args).run();
    };
    PPS300_POContainerMod.prototype.run = function () {
        var _this = this;
        //  Get panel name 
        this.panelName = this.controller.GetPanelName();
        //  Check panel
        if (this.allowedPanels.indexOf(this.panelName, 0) < 0) {
            this.log.Error("Script cannot be run in " + this.panelName);
            return;
        }
        if (this.panelName == "PPA300BC") {
            var ForceF5 = InstanceCache.Get(this.controller, "ForceF5");
            if (ForceF5 == "Yes") {
                this.debug("I", "F5 pressed");
                InstanceCache.Remove(this.controller, "ForceF5");
                this.controller.PressKey("F5");
                return;
            }
            this.debug("I", "F5 not pressed");
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
        //  Get static fields upon entry
        this.CONO = ScriptUtil.GetUserContext("CONO");
        this.DTFM = ScriptUtil.GetUserContext("DTFM");
        this.DCFM = ScriptUtil.GetUserContext("DCFM");
        this.RESP = ScriptUtil.GetUserContext("USID");
        this.PUNO = this.getScreenFieldValue("IBPUNO");
        this.PNLI = this.getScreenFieldValue("IBPNLI");
        this.PNLS = this.getScreenFieldValue("IBPNLS");
        this.WHLO = this.getScreenFieldValue("IBWHLO");
        this.SUNO = this.getScreenFieldValue("IASUNO");
        this.ITNO = this.getScreenFieldValue("IBITNO");
        this.PUUN = this.getScreenFieldValue("IBPUUN");
        this.DCCD = "";
        //  Check contianer mangament flag to see if script is required
        this.setBusy(true);
        this.getItemWareHouse(this.WHLO, this.ITNO)
            .then(function (item) { return item.COMG; })
            .then(function (COMG) {
            if (COMG != "7") {
                _this.debug("I", "Item not container managed script will end");
                _this.setBusy(false);
                return;
            }
            else {
                _this.unsubscribeRequesting = _this.controller.Requesting.On(function (e) {
                    _this.onRequesting(e);
                });
                _this.unsubscribeRequested = _this.controller.Requested.On(function (e) {
                    _this.onRequested(e);
                });
            }
            _this.getItem(_this.ITNO)
                .then(function (itemData) {
                _this.DCCD = itemData.DCCD;
                _this.debug("I", "Number of decimal places for " + itemData.UNMS + " = " + _this.DCCD);
                if (_this.PUUN != itemData.UNMS) {
                    _this.getAltUom(_this.ITNO, "1", _this.PUUN)
                        .then(function (DCCD) {
                        _this.DCCD = DCCD.DCCD;
                        _this.debug("I", "Number of decimal places for " + _this.PUUN + " = " + _this.DCCD);
                    });
                }
            })
                .catch(function (err) { return _this.log.Error(err.errorMessage); })
                .then(function () { return _this.setBusy(false); });
        })
            .catch(function (err) {
            _this.debug("I", "Item not container managed script will end");
            _this.log.Error(err.errorMessage);
            _this.setBusy(false);
            return;
        });
    };
    PPS300_POContainerMod.prototype.parseArgs = function (args) {
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
    PPS300_POContainerMod.prototype.checkInputs = function () {
        var _this = this;
        this.debug("I", "Start of check Inputs");
        // Check time fields
        var zeros = "0000";
        var length = this.TRTM.length;
        if (length < 4) {
            this.TRTM = zeros.substring(0, 4 - length) + this.TRTM;
        }
        var TRTM_hours = this.TRTM.substring(0, 2);
        var TRTM_minutes = this.TRTM.substring(2, 4);
        if (TRTM_hours > "23" ||
            TRTM_hours < "00" ||
            TRTM_minutes > "59" ||
            TRTM_minutes < "00" ||
            length > 4) {
            this.controller.ShowMessage("Transaction time is invalid");
            return;
        }
        // Received qty must be entered
        if (this.RVQA.length == 0) {
            this.controller.ShowMessage("Received qty must be entered");
            return;
        }
        // Received qty must be a valid number
        var rvqa = parseFloat(this.RVQA);
        if (isNaN(rvqa)) {
            this.controller.ShowMessage("Received qty must be a number");
            return;
        }
        // Received qty must have correct number of decimal places
        if (this.RVQA.indexOf(".") >= 0) {
            var decs = this.RVQA.split(this.DCFM)[1].length;
            if (parseInt(this.DCCD) > decs) {
                this.controller.ShowMessage("Received qty has too many decimal places");
                return;
            }
        }
        // Get readonly attribute of lot number field
        var bano_readOnly = this.controller.ParentWindow.find("#WRBANO").get(0).getAttribute("readonly");
        // Lot number must be entered if on screen and not readonly
        if (this.BANO == "" && this.BANO != null && bano_readOnly == null) {
            this.controller.ShowMessage("Lot number must be entered");
            return;
        }
        /*
        // Lot ref 1 must be entered
        if (this.BREF == "" && this.BREF != null) {
            this.controller.ShowMessage("Supplier Lot Number must be entered");
            return;
        }
        // Lot ref 2 must be entered
        if (this.BRE2 == "" && this.BRE2 != null) {
            this.controller.ShowMessage("Site of Manufacture must be entered");
            return;
        }
        */
        // Location must be entered
        if (this.WHSL == "" && this.WHSL != null) {
            this.controller.ShowMessage("Location must be entered");
            return;
        }
        // Location must be valid
        this.getLocation(this.WHLO, this.WHSL)
            .then(function (item) {
            _this.debug("I", "Location is valid");
        })
            .catch(function (err) {
            _this.controller.ShowMessage("Invalid Location");
            return;
        })
            .then(function () {
            _this.debug("I", "End of input checks");
            _this.launchMongoose();
        });
    };
    PPS300_POContainerMod.prototype.getLocation = function (WHLO, WHSL) {
        var request = {
            program: "MMS010MI",
            transaction: "GetLocation",
            record: {
                WHLO: WHLO,
                WHSL: WHSL
            },
            outputFields: ["WHLO"]
        };
        return MIService.Current.executeRequest(request)
            .then(function (response) { return response.item; })
            .catch(function (err) { return Promise.reject(err); });
    };
    PPS300_POContainerMod.prototype.getItemWareHouse = function (WHLO, ITNO) {
        var request = {
            program: "MMS200MI",
            transaction: "GetItmWhsBasic",
            record: {
                WHLO: WHLO,
                ITNO: ITNO
            },
            outputFields: ["COMG"]
        };
        return MIService.Current.executeRequest(request)
            .then(function (response) { return response.item; })
            .catch(function (err) { return Promise.reject(err); });
    };
    PPS300_POContainerMod.prototype.getItem = function (ITNO) {
        var request = {
            program: "MMS200MI",
            transaction: "GetItmBasic",
            record: {
                ITNO: ITNO
            },
            outputFields: ["UNMS", "DCCD"]
        };
        return MIService.Current.executeRequest(request)
            .then(function (response) { return response.item; })
            .catch(function (err) { return Promise.reject(err); });
    };
    PPS300_POContainerMod.prototype.getAltUom = function (ITNO, AUTP, ALUN) {
        var request = {
            program: "MMS015MI",
            transaction: "Get",
            record: {
                ITNO: ITNO,
                AUTP: AUTP,
                ALUN: ALUN
            },
            outputFields: ["DCCD"]
        };
        return MIService.Current.executeRequest(request)
            .then(function (response) { return response.item; })
            .catch(function (err) { return Promise.reject(err); });
    };
    PPS300_POContainerMod.prototype.launchMongoose = function () {
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
                        this.url += "CONO=" + this.CONO + ", ";
                        this.url += "PUNO=" + this.PUNO + ", ";
                        this.url += "PNLI=" + this.PNLI + ", ";
                        this.url += "PNLS=" + this.PNLS + ", ";
                        this.url += "WHSL=" + this.WHSL + ", ";
                        this.url += "WHLO=" + this.WHLO + ", ";
                        this.url += "NOPK=" + this.NOPK + ", ";
                        this.url += "REPN=" + this.REPN + ", ";
                        this.url += "BANO=" + this.BANO + ", ";
                        this.url += "SUNO=" + this.SUNO + ", ";
                        this.url += "ITNO=" + this.ITNO + ", ";
                        this.url += "RVQA=" + this.RVQA + ", ";
                        this.url += "BREF=" + this.BREF + ", ";
                        this.url += "BRE2=" + this.BRE2 + ", ";
                        this.url += "RPDT=" + this.convertDate(this.LPUD) + ", ";
                        this.url += "RPTM=" + this.TRTM + ", ";
                        this.url += "PRDT=" + this.convertDate(this.PRDT) + ", ";
                        this.url += "PUUN=" + this.PUUN + ", ";
                        this.url += "OEND=" + this.OEND + ", ";
                        this.url += "SUDO=" + this.SUDO + ", ";
                        this.url += "RESP=" + this.RESP + ", ";
                        this.url += "DCCD=" + this.DCCD;
                        this.url += this.url3 + "&_" + timestamp;
                        this.debug("I", "url : " + this.url);
                        InstanceCache.Add(this.controller, "ForceF5", "Yes");
                        this.buildPopup();
                        return [2 /*return*/];
                }
            });
        });
    };
    PPS300_POContainerMod.prototype.convertDate = function (dateIn) {
        var dateOut = "";
        var DD = "";
        var MM = "";
        var YY = "";
        if (this.DTFM == "DMY") {
            DD = dateIn.substring(0, 2);
            MM = dateIn.substring(2, 4);
            YY = dateIn.substring(4, 6);
            this.debug("D", "DTFM = DMY");
        }
        if (this.DTFM == "YMD") {
            YY = dateIn.substring(0, 2);
            MM = dateIn.substring(2, 4);
            DD = dateIn.substring(4, 6);
            this.debug("I", "DTFM = YMD");
        }
        if (this.DTFM == "MDY") {
            MM = dateIn.substring(0, 2);
            DD = dateIn.substring(2, 4);
            YY = dateIn.substring(4, 6);
            this.debug("I", "DTFM = MDY");
        }
        dateOut = YY + MM + DD;
        return dateOut;
    };
    PPS300_POContainerMod.prototype.buildPopup = function () {
        // Use self to get correct reference to the class in the button handlers.
        var self = this;
        this.log.Info("buildPoup");
        var placeHolder = this.controller.ParentWindow.find("#mongooseWindow");
        this.getCustomHTML(placeHolder);
        var dialog = this.controller.ParentWindow.find('#optionsDialog');
        var dialogButtons = [
        /*            {
                        text: "OK",
                        isDefault: true,
                        width: 80,
                        click: function () {
                            $("#optionsDialog").remove();
                        }
                    },
                    {
                        text: "Cancel",
                        width: 80,
                        click: function () {
                            $("#optionsDialog").remove();
                        }
                    } */
        ];
        dialog.inforMessageDialog({
            title: '<center><b>Goods Receipt Work Bench</b></center>',
            dialogType: 'General',
            width: 870,
            height: 690,
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
                self.setBusy(true);
                $("#optionsDialog").remove();
                self.controller.PressKey("F12");
            }
        });
        this.setBusy(false);
        this.log.Info("buildPoup end");
    };
    PPS300_POContainerMod.prototype.getCustomHTML = function (placeHolder) {
        var customHtml = "<div id=\"optionsDialog\" style=\"display:none;\"><div class=\"dialogFillContents\"><object type=\"text/html\" style=\"width:870px; height:650px;\" data=\"" + this.url + "\" ></object></div></div>";
        placeHolder.append(customHtml);
    };
    PPS300_POContainerMod.prototype.getTenant = function () {
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
    PPS300_POContainerMod.prototype.getScreenFieldValue = function (fieldName) {
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
    PPS300_POContainerMod.prototype.continueProcess = function () {
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
    PPS300_POContainerMod.prototype.onRequesting = function (args) {
        this.debug("I", "onRequesting");
        this.cmdType = args.commandType;
        this.cmdValue = args.commandValue;
        this.debug("I", "cmdType : " + this.cmdType);
        this.debug("I", "cmdValue : " + this.cmdValue);
        //  If check not required for function key or option then return
        if ((this.cmdType === "KEY" && (this.checkKeys.indexOf(this.cmdValue) === -1)) ||
            (this.cmdType === "LSTOPT" && this.checkOpts.indexOf(this.cmdValue) === -1))
            return;
        //  Get input fields
        this.WHSL = this.getScreenFieldValue("WLWHSL");
        this.NOPK = this.getScreenFieldValue("WBNOPK");
        this.REPN = this.getScreenFieldValue("WWREPN");
        this.BANO = this.getScreenFieldValue("WRBANO");
        this.RVQA = this.getScreenFieldValue("WBRVQA");
        this.BREF = this.getScreenFieldValue("WLBREF");
        this.BRE2 = this.getScreenFieldValue("WLBRE2");
        this.LPUD = this.getScreenFieldValue("WBLPUD");
        this.TRTM = this.getScreenFieldValue("W4TRTM");
        this.PRDT = this.getScreenFieldValue("WLPRDT");
        this.OEND = "0";
        if (this.getScreenFieldValue("WBOEND")) {
            this.OEND = "1";
        }
        this.SUDO = this.getScreenFieldValue("WESUDO");
        this.checkInputs();
        args.cancel = true;
    };
    PPS300_POContainerMod.prototype.onRequested = function (args) {
        this.unsubscribeRequested();
        this.unsubscribeRequesting();
        this.setBusy(false);
    };
    PPS300_POContainerMod.prototype.setBusy = function (busy, delay, modal) {
        if (delay === void 0) { delay = 0; }
        if (modal === void 0) { modal = true; }
        if (busy) {
            $('body').inforBusyIndicator({ text: 'Loading...', delay: delay, modal: modal });
        }
        else {
            $('body').inforBusyIndicator('close');
        }
    };
    PPS300_POContainerMod.prototype.debug = function (type, message) {
        if (this.debugOn) {
            if (type == "I")
                this.log.Info(message);
            if (type == "D")
                this.log.Debug(message);
            if (type == "E")
                this.log.Error(message);
        }
    };
    return PPS300_POContainerMod;
}());
//# sourceMappingURL=PPS300_POContainerMod.js.map