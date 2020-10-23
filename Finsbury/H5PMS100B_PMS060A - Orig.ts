/*

	Author				:	Neil Johnson
	Date				:	2020-04-20
	Script name 		:	H5PMS100B_PMS060A
	Script arguments	:	
	Prerequisites		:	
			
	User highlight balance id in PMS100 and then clicks script button. PMS050 opens with facility, product number and MO number carried across to new program.
   
    *Nbr   Date   User id     Description
    *NJ01 200420  NJOHNSON    Re-written during uplift as used another script H5Automate which didn't work in new version

*/
class H5PMS100B_PMS060A  {
    private controller: IInstanceController;
    private contentElement: IContentElement;
    private log: IScriptLog;

    private args: string;

    private debugOn: boolean;

    private panelName: string;
    private allowedPanels = ["PMA100BC"];

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
        new H5PMS100B_PMS060A (args).run();
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
        var top = 8;
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 215) / 10;
        var eid = "h5btn_rmissue" + Math.floor(Math.random() * 10000);
        const buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "RM Issue";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = top;
        buttonElement.Position.Left = left;

        this.$button = this.contentElement.AddElement(buttonElement);
        this.$button.attr("style", "width: 100px");
        this.$button.click({}, () => {
            this.OnClickButton();
        });
    }

    private OnClickButton() {
        this.$button.attr("disabled", "disabled");

        // Loop selected rows
        var validFields = true;
        var PRNO = "", MFNO = "";

        var FACI = ScriptUtil.FindChild($(".lawsonHost:visible"), "WWFACI").val();
        if (FACI == "") {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field FACI is empty!",
                dialogType: "Error"
            });
            validFields = false;
        }

        var list = ListControl.ListView;
        var rows = ListControl.ListView.SelectedItem();
        if (rows.length <= 0) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "No rows selected.",
                dialogType: "Error"
            });
        }


        // get PRNO
        var listPRNO = list.GetValueByColumnName("PRNO");
        if (listPRNO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field PRNO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }

        // get MFNO
        var listMFNO = list.GetValueByColumnName("MFNO");
        if (listMFNO == null) {
            ConfirmDialog.Show({
                header: "Script Error",
                message: "Field MFNO is not in View!",
                dialogType: "Error"
            });
            validFields = false;
        }

        if (validFields) {
            for (var i = 0; i < rows.length; i++) {
                var idx = rows[i];
                PRNO = listPRNO[i];
                MFNO = listMFNO[i];

                // create an instance of MFormsAutomation
                var auto = new MFormsAutomation();
                auto.addStep(ActionType.Run, "PMS060");
                auto.addStep(ActionType.Set, "");
                auto.addField("WMFACI", FACI);
                auto.addField("WMPRNO", PRNO);
                auto.addField("WMMFNO", MFNO);
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