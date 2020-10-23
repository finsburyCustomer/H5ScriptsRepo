/*

	Author				:	Neil Johnson
	Date				:	2020-04-20
	Script name 		:	ReasonCodeLaunchLevel2
	Script arguments	:	
	Prerequisites		:	
			
	User highlight record in CRS090 or PDS044 and then clicks script button. Launches Mongoose to maintain level 2 codes

*/
class ReasonCodeLaunchLevel2 {
    private controller: IInstanceController;
    private contentElement: IContentElement;
    private log: IScriptLog;

    private args: string;

    private debugOn: boolean;

    private panelName: string;
    private program: string;
    private allowedPanels = ["CRA090BC", "PDA044BC"];

    private $button;

    private tenant: string;
    private config: string;
    private configgroup: string;

    private url: string;
    private url1: string = "https://mgeucent1ap.mtmgf.eu1.mongoosepaas.io/WSWebClient/session/open/{0}?page=formonly&form=";
    private url2: string = "(SETVARVALUES(InitialCommand=Refresh,";
    private url3: string = "))&notitle=1&=resizable&theme=Momentum&inforCurrentLocale=en-GB&inforCurrentLanguage=en-GB&forcesso=1&tenant={0}&configgroup={1}";

    private formName = "FF_ReasonCodes";

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
        new ReasonCodeLaunchLevel2(args).run();
    }

    private run(): void {
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
            let dialogPlaceholderHtml = `<div id="mongooseWindow" style="display:none"></div>`;
            this.controller.ParentWindow.append(dialogPlaceholderHtml);
        }
        // Add the button to panel
        var top = 0;
        var left = 10;
        var eid = "h5btn_launch" + Math.floor(Math.random() * 10000);
        const buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Level 2 Codes";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;

        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.attr("style", "position:absolute;top:-25px;left:-100px;width: 100px;");
        this.$button.click({}, () => {
            this.OnClickButton();
        });
    }

    private OnClickButton() {
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

    private async launchMongoose(level1: string) {

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
        this.url += "levelnumber=2" + ", ";
        this.url += "program=" + this.program + ", ";
        this.url += "level1=" + level1;
        this.url += this.url3 + `&_` + timestamp;
        this.debug("I", "url : " + this.url);
        this.buildPopup();
    }

    private buildPopup(): void {
        // Use self to get correct reference to the class in the button handlers.
        const self = this;

        this.log.Info(`buildPoup`);
        let placeHolder = this.controller.ParentWindow.find("#mongooseWindow");
        this.getCustomHTML(placeHolder);

        let dialog = this.controller.ParentWindow.find('#optionsDialog');

        let dialogButtons = [
        ];

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
        this.log.Info(`buildPoup end`);
    }

    private getCustomHTML(placeHolder: JQuery): void {
        let customHtml =
            `<div id="optionsDialog" style="display:none;"><div class="dialogFillContents"><object type="text/html" style="width:660px; height:390px;" data="${this.url}" ></object></div></div>`;
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