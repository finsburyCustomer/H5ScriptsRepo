/*

	Author				:	Neil Johnson
	Date				:	2017-08-08
	ISO version			:	10.2.1.1.5
	Script name 		:	ZZ_Template
	Script arguments	:	
	Prerequisites		:	
			
	<- Enter description of script here ->

*/
class ZZ_Template {
    private controller: IInstanceController;
    private log: IScriptLog;

    private unsubscribeRequesting: Function;
    private unsubscribeRequested: Function;

    private args: string;

    private debugOn: boolean;

    private cmdType: string;
    private cmdValue: string;

    private panelName: string;
    private allowedPanels = ["????????"];
    private checkKeys = [""];
    private checkOpts = [""];  

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
        new ZZ_Template(args).run();
    }

    private run(): void {
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
        
        this.unsubscribeRequesting = this.controller.Requesting.On((e) => {
            this.onRequesting(e);
        });
        this.unsubscribeRequested = this.controller.Requested.On((e) => {
            this.onRequested(e);
        });
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

        args.cancel = true;

    }

    private onRequested(args: RequestEventArgs): void {
        this.unsubscribeRequested();
        this.unsubscribeRequesting();
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