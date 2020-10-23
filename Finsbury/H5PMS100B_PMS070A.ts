/*

	Author				:	Neil Johnson
	Date				:	2020-04-20
	Script name 		:	H5PMS100B_PMS070A 
	Script arguments	:	
	Prerequisites		:	
			
	User highlight balance id in PMS100 and then clicks script button. PMS070 opens with facility, product number and MO number carried across to new program.
   
    *Nbr   Date   User id     Description
    *NJ01 200420  NJOHNSON    Re-written during uplift as used another script H5Automate which didn't work in new version

*/
class H5PMS100B_PMS070A  {
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
        new H5PMS100B_PMS070A (args).run();
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
        var left = (ScriptUtil.FindChild($(".lawsonHost:visible"), "contentBody").width() / 2 - 104) / 10;
        var eid = "h5btn_opreport" + Math.floor(Math.random() * 10000);
        const buttonElement = new ButtonElement();
        buttonElement.Name = eid;
        buttonElement.Value = "Op Report";
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
        this.controller.ListOption("53");
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