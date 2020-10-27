/*

	Author				:	Neil Johnson
	Date				:	2020-04-17
	Script name 		:	PPS300_POContainerMod
	Script arguments	:	
	Prerequisites		:	
			
	This script will launch a Mongoose form to replace XPP001

*/
class PPS300_POContainerMod {
    private controller: IInstanceController;
    private log: IScriptLog;

    private unsubscribeRequesting: Function;
    private unsubscribeRequested: Function;

    private args: string;

    private debugOn: boolean;

    private cmdType: string;
    private cmdValue: string;

    private panelName: string;
    private allowedPanels = ["PPA300BC", "PPA300E0", "PPA300E1"];
    private checkKeys = ["ENTER"];
    private checkOpts = [""];  

    // System context fields
    private CONO: string;
    private DTFM: string;
    private DCFM: string;
    private RESP: string;

    // Parameters for Mongoose launch
    private PUNO: string;
    private PNLI: string;
    private PNLS: string;
    private WHLO: string;
    private SUNO: string;
    private ITNO: string;
    private WHSL: string;
    private NOPK: string;
    private REPN: string;
    private BANO: string;
    private RVQA: string;
    private BREF: string;
    private BRE2: string;
    private LPUD: string;
    private TRTM: string;
    private PRDT: string;
    private OEND: string;
    private PUUN: string;
    private DCCD: string;
    private SUDO: string;

    private tenant: string;
    private config: string;
    private configgroup: string;

    private url: string;
    private url1: string = "https://mgeucent1ap.mtmgf.eu1.mongoosepaas.io/WSWebClient/session/open/{0}?page=formonly&form=";
    private url2: string = "(SETVARVALUES(InitialCommand=Refresh,";
    private url3: string = "))&notitle=1&=resizable&theme=Momentum&inforCurrentLocale=en-GB&inforCurrentLanguage=en-GB&forcesso=1&tenant={0}&configgroup={1}";

    private formName = "FF_XPP001";


    constructor(scriptArgs: IScriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;

        //  Set debug on to be true
        this.debugOn = true;
    }

    /**
	 * Script initialization function.
	 */
    public static Init(args: IScriptArgs): void {
        new PPS300_POContainerMod(args).run();
    }

    private run(): void {
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
            let dialogPlaceholderHtml = `<div id="mongooseWindow" style="display:none"></div>`;
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
            .then(item => item.COMG)
            .then(COMG => {
                if (COMG != "7") {
                    this.debug("I", "Item not container managed script will end");
                    this.setBusy(false)
                    return
                } else {
                    this.unsubscribeRequesting = this.controller.Requesting.On((e) => {
                        this.onRequesting(e);
                    });
                    this.unsubscribeRequested = this.controller.Requested.On((e) => {
                        this.onRequested(e);
                    });
                }
                this.getItem(this.ITNO)
                .then(itemData => {
                    this.DCCD = itemData.DCCD
                    this.debug("I", "Number of decimal places for " + itemData.UNMS + " = " + this.DCCD);
                    if (this.PUUN != itemData.UNMS) {
                        this.getAltUom(this.ITNO, "1", this.PUUN)
                            .then(DCCD => {
                                this.DCCD = DCCD.DCCD
                                this.debug("I", "Number of decimal places for " + this.PUUN + " = " + this.DCCD);
                            })
                }
            })
            .catch(err => this.log.Error(err.errorMessage))
            .then(() => this.setBusy(false));
            })
            .catch(err => {
                this.debug("I", "Item not container managed script will end");
                this.log.Error(err.errorMessage)
                this.setBusy(false)
                return
            })
    }

    private parseArgs(args: string): boolean {
        try {
            //  Split arguments
            var split = args.split(",");

            this.debug("I", "number of args:" + split.length);

            return true;
        } catch (ex) {
            this.log.Error("Failed to parse argument string " + args, ex);
            return false;
        }
    }

    private checkInputs() {
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
        debugger;
        // Received qty must have correct number of decimal places
        if (this.RVQA.indexOf(".") >= 0) {
            var decs = this.RVQA.split(this.DCFM)[1].length;
            if (decs > parseInt(this.DCCD)) {
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
            .then(item => {
                this.debug("I", "Location is valid");
            })
            .catch(err => {
                this.controller.ShowMessage("Invalid Location")
                return;
            })
            .then(() => {
                this.debug("I", "End of input checks")
                this.launchMongoose();
            });
    }

    private getLocation(WHLO: string, WHSL: string) {
        const request: IMIRequest = {
            program: `MMS010MI`,
            transaction: `GetLocation`,
            record: {
                WHLO: WHLO,
                WHSL: WHSL
            },
            outputFields: [`WHLO`]
        };
        return MIService.Current.executeRequest(request)
            .then((response: IMIResponse) => response.item)
            .catch(err => Promise.reject(err));
    }

    private getItemWareHouse(WHLO: string, ITNO: string) {
        const request: IMIRequest = {
            program: `MMS200MI`,
            transaction: `GetItmWhsBasic`,
            record: {
                WHLO: WHLO,
                ITNO: ITNO
            },
            outputFields: [`COMG`]
        };
        return MIService.Current.executeRequest(request)
            .then((response: IMIResponse) => response.item)
            .catch(err => Promise.reject(err));
    }

    private getItem(ITNO: string) {
        const request: IMIRequest = {
            program: `MMS200MI`,
            transaction: `GetItmBasic`,
            record: {
                ITNO: ITNO
            },
            outputFields: [`UNMS`, `DCCD`]
        };
        return MIService.Current.executeRequest(request)
            .then((response: IMIResponse) => response.item)
            .catch(err => Promise.reject(err));
    }

    private getAltUom(ITNO: string, AUTP: string, ALUN: string) {
        const request: IMIRequest = {
            program: `MMS015MI`,
            transaction: `Get`,
            record: {
                ITNO: ITNO,
                AUTP: AUTP,
                ALUN: ALUN
            },
            outputFields: [`DCCD`]
        };
        return MIService.Current.executeRequest(request)
            .then((response: IMIResponse) => response.item)
            .catch(err => Promise.reject(err));
    }

    private async launchMongoose() {

        await this.getTenant();

        var split = this.tenant.split("_");

        var id = split[1];

        this.config = "FINSBURYFOODSCO_MONGOOSE_" + id + "_DEFAULT";
        this.configgroup = "FINSBURYFOODSCO_MONGOOSE_" + id;
        
        this.url1 = this.url1.replace("{0}", this.config);
        this.url3 = this.url3.replace("{0}", this.tenant);
        this.url3 = this.url3.replace("{1}", this.configgroup);

        let dt = new Date();
        let timestamp = Math.round(dt.getTime());

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
        this.url += this.url3 + `&_` + timestamp;
        this.debug("I", "url : " + this.url);
        InstanceCache.Add(this.controller, "ForceF5", "Yes");
        this.buildPopup();
    }

    private convertDate(dateIn: string): string {
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
    }

    private buildPopup(): void {
        // Use self to get correct reference to the class in the button handlers.
        const self = this;

        this.log.Info(`buildPoup`);
        let placeHolder = this.controller.ParentWindow.find("#mongooseWindow");
        this.getCustomHTML(placeHolder);

        let dialog = this.controller.ParentWindow.find('#optionsDialog');

        let dialogButtons = [
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
        this.log.Info(`buildPoup end`);
    }

    private getCustomHTML(placeHolder: JQuery): void {
        let customHtml =
            `<div id="optionsDialog" style="display:none;"><div class="dialogFillContents"><object type="text/html" style="width:870px; height:650px;" data="${this.url}" ></object></div></div>`;
        placeHolder.append(customHtml);
    }

    private getTenant() {
        this.tenant = "";
        const myRequest = new MIRequest();
        myRequest.program = "GENERAL";
        myRequest.transaction = "GetCurrentUser";
        //Fields that should be returned by the transaction
        myRequest.outputFields = ["TEID"];
        //Input to the transaction
        myRequest.record = {};

        return MIService.Current.executeRequest(myRequest).then(
            (response: IMIResponse) => {
                //Read results here
                for (let item of response.items) {
                    this.tenant = item.TEID;
                }
            }).catch((response: IMIResponse) => {
                //Handle errors here
                this.debug("E", response.errorMessage);
            });
    }

    private getScreenFieldValue(fieldName: string): string {
        var fieldValue = null;
        try {
            var type = this.controller.ParentWindow.find("#" + fieldName).get(0).tagName;
            if (type === "INPUT" || type === "SELECT") {
                fieldValue = ScriptUtil.GetFieldValue(fieldName);
            } else {
                fieldValue = this.controller.ParentWindow.find("#" + fieldName).text();
            }
        } catch(err) {
            this.debug("I", "Field not found " + fieldName);
            this.debug("I", "Error in getSreenFieldValue:" + err.message);
        }

        return fieldValue;
    }

    private continueProcess(): void {
        this.debug("I", "continueProcess : " + this.cmdType + " " + this.cmdValue);
        setTimeout(() => {
            this.debug("I", "cmdType:" + this.cmdType);
            this.debug("I", "cmdValue:" + this.cmdValue);
            if (this.cmdType === "KEY") {
                this.controller.PressKey(this.cmdValue);
            } else {
                this.controller.ListOption(this.cmdValue);
            }

        }, 0);
    }

    private onRequesting(args: CancelRequestEventArgs) {
        this.debug("I", "onRequesting");

        this.cmdType = args.commandType;
        this.cmdValue = args.commandValue;
        this.debug("I", "cmdType : " + this.cmdType);
        this.debug("I", "cmdValue : " + this.cmdValue);


        //  If check not required for function key or option then return
        if ((this.cmdType === "KEY" && (this.checkKeys.indexOf(this.cmdValue) === -1)) ||
            (this.cmdType === "LSTOPT" && this.checkOpts.indexOf(this.cmdValue) === -1)) return;

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

    }

    private onRequested(args: RequestEventArgs): void {
        this.unsubscribeRequested();
        this.unsubscribeRequesting();
        this.setBusy(false);
    }

    private setBusy(busy: boolean, delay = 0, modal = true) {
        if (busy) {
            $('body').inforBusyIndicator({ text: 'Loading...', delay: delay, modal: modal });
        } else {
            $('body').inforBusyIndicator('close');
        }
    }

    private debug(type: string, message: string) {
        if (this.debugOn) {
            if (type == "I") this.log.Info(message);
            if (type == "D") this.log.Debug(message);
            if (type == "E") this.log.Error(message);
        }
    }

}