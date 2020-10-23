/*

	Author				:	Neil Johnson
	Date				:	2020-04-20
	Script name 		:	H5MWS060B_MMS105E
	Script arguments	:	
	Prerequisites		:	
			
	User highlight balance id in MWS060 and then clicks script button. MMS105 opens with warehouse and container number carried across to new program.
   
    *Nbr   Date   User id     Description
    *NJ01 200417  NJOHNSON    Re-written during uplift as used another script H5Automate which didn't work in new version

*/
class H5MWS060B_MMS105E {
    private controller: IInstanceController; 
    private contentElement: IContentElement;
    private log: IScriptLog;

    private args: string;

    private debugOn: boolean;

    private panelName: string;
    private allowedPanels = ["MWA060BC"];

    private $button;

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
        new H5MWS060B_MMS105E(args).run();
    }

    private run(): void {
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
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 203) / 10;
        var eid = "h5btn_movecontainer" + Math.floor(Math.random() * 10000);
        const buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Container Move";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;
        buttonElement.Position.Width = "auto";

        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.click({}, () => {
            this.OnClickButton();
        });
    }

    private OnClickButton() {
        this.$button.attr("disabled", "disabled");

        // Loop selected rows
        var validFields = true;
        var CAMU, WHLO;
        var list = ListControl.ListView;
        var rows = ListControl.ListView.SelectedItem();
        if (rows.length <= 0) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "No rows selected.",
                dialogType: "Error"
            });
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

                // create an instance of MFormsAutomation
                var auto = new MFormsAutomation();
                auto.addStep(ActionType.Run, "MMS105");
                auto.addField("WWQTTP", "1");
                auto.addStep(ActionType.Key, "ENTER");
                auto.addField("WWWHLO", WHLO);
                auto.addField("W1CAMU", CAMU);
                auto.addStep(ActionType.Key, "ENTER");
                auto.addField("S1CAMU", CAMU);
                auto.addStep(ActionType.ListOption, "1");
                const uri = auto.toEncodedUri();
                ScriptUtil.Launch(uri);
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

    private getScreenFieldValue(fieldName: string): string {
        var fieldValue = null;
        try {
            var type = this.controller.ParentWindow.find("#" + fieldName).get(0).tagName;
            if (type === "INPUT" || type === "SELECT") {
                fieldValue = ScriptUtil.GetFieldValue(fieldName);
            } else {
                fieldValue = this.controller.ParentWindow.find("#" + fieldName).text();
            }
        } catch (err) {
            this.debug("I", "Field not found " + fieldName);
            this.debug("I", "Error in getSreenFieldValue:" + err.message);
        }


        return fieldValue;
    }

    private debug(type: string, message: string) {
        if (this.debugOn) {
            if (type == "I") this.log.Info(message);
            if (type == "D") this.log.Debug(message);
            if (type == "E") this.log.Error(message);
        }
    }

}