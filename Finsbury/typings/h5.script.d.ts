interface IPositionElement {
	Top?: any;
	Left?: any;
	Width?: any;
	Height?: any;
}

declare class PositionElement implements IPositionElement {
	Top: any;
	Left: any;
	Width: any;
	Height: any;
}

interface IConstraintElement {
	IsNumeric: boolean;
	IsUpper: boolean;
	MaxLength: number;
	MaxDecimals: number;
	MaxRow: number;
	MaxColumn: number;
}

interface IBaseElement {
	Name?: string;
	Value?: string;
	IsEnabled?: boolean;
	IsVisible?: boolean;
	IsReadDisabled?: boolean;
	TabIndex?: number;
	FieldHelp?: string;
	ReferenceFile?: string;
	ReferenceField?: string;
	Position?: IPositionElement;
	Constraint?: IConstraintElement;
	MNEAI?: any;
}

interface IContentElement {
    Add(element: IBaseElement): void;
    AddElement(element: IBaseElement): any;
    CreateElement(element: IBaseElement): JQuery;
    GetContentBody(): JQuery;
    GetElement(elementName: string): JQuery;
    GetPrevContainer(elementContainer: JQuery): JQuery;
    OnUnload(callback: Function): void;
    Unload(): void;
}

interface IButtonElement extends IBaseElement {
	Command?: string;
	CommandValue?: string;
}

declare class ButtonElement implements IButtonElement {
	// Base
	Name: string;
	Value: string;
	IsEnabled: boolean;
	IsVisible: boolean;
	IsReadDisabled: boolean;
	TabIndex: number;
	FieldHelp: string;
	ReferenceFile: string;
	ReferenceField: string;
	Position: IPositionElement;
	Constraint: IConstraintElement;
	MNEAI: any;
	// Button
	Command: string;
	CommandValue: string;
}


interface ICheckBoxElement extends IBaseElement {
	IsChecked?: boolean;
}

declare class CheckBoxElement implements ICheckBoxElement { }

interface IComboBoxElement extends IBaseElement {
	Items?: any[];
	Command?: string;
	CommandValue?: string;
	IsEditable?: boolean;
}

declare class ComboBoxElement implements IComboBoxElement { }

interface ILabelElement extends IBaseElement {
	Id?: string;
	ToolTip?: string;
	IsFixed?: boolean;
	IsAdditionalInfo?: boolean;
	IsEmphasized?: boolean;
	IsColon?: boolean;
	CssClass?: string;
}

declare class LabelElement implements ILabelElement {
    // Base
    Name: string;
    Value: string;
    IsEnabled: boolean;
    IsVisible: boolean;
    IsReadDisabled: boolean;
    TabIndex: number;
    FieldHelp: string;
    ReferenceFile: string;
    ReferenceField: string;
    Position: IPositionElement;
    Constraint: IConstraintElement;
    MNEAI: any;
    //Label 
    Id: string;
    ToolTip: string;
    IsFixed: boolean;
    IsAdditionalInfo: boolean;
    IsEmphasized: boolean;
    IsColon: boolean;
    CssClass: string;
}

interface ITextBoxElement extends IBaseElement {
	IsReverse?: boolean;
	IsHighIntensity?: boolean;
	IsRightJustified?: boolean;
	IsBrowsable?: boolean;
	IsFixedFont?: boolean;
	IsPosition?: boolean;
	DateFormat?: string;
}

declare class TextBoxElement implements ITextBoxElement {
    // Base
    Name: string;
    Value: string;
    IsEnabled: boolean;
    IsVisible: boolean;
    IsReadDisabled: boolean;
    TabIndex: number;
    FieldHelp: string;
    ReferenceFile: string;
    ReferenceField: string;
    Position: IPositionElement;
    Constraint: IConstraintElement;
    MNEAI: any;
    //TextBox
    IsReverse: boolean;
    IsHighIntensity: boolean;
    IsRightJustified: boolean;
    IsBrowsable: boolean;
    IsFixedFont: boolean;
    IsPosition: boolean;
    DateFormat: string;
}

interface IListElement extends IBaseElement {
    Columns: Object[];
}

declare class ListElement implements IListElement {
    // Base
    Name: string;
    Value: string;
    IsEnabled: boolean;
    IsVisible: boolean;
    IsReadDisabled: boolean;
    TabIndex: number;
    FieldHelp: string;
    ReferenceFile: string;
    ReferenceField: string;
    Position: IPositionElement;
    Constraint: IConstraintElement;
    MNEAI: any;
    // List
    Columns: Object[];
}

interface IResponseElement {
    RawContent: any;
}

interface IButton extends JQuery {
	Position?: IPositionElement;
}

interface IList extends JQuery {
    Position?: IPositionElement;
}

declare class ControlFactory {
	public static CreateButton(element: IButtonElement): IButton;
	public static CreateLabel(element: ILabelElement): JQuery;
	public static CreateTextBox(element: ITextBoxElement): JQuery;
	public static CreateCheckBox(element: ICheckBoxElement): JQuery;
	public static CreateComboBox(element: IComboBoxElement): JQuery;
}

interface IConfirmDialogButton {
	text: string;
	click: Function;
	isDefault?: boolean;
}

interface IConfirmDialogCloseArgs {
	ok: boolean;
	cancel: boolean;
}

interface IConfirmDialogOptions {
	header: string;
	message: string;
	dialogType?: string;
	closed?: (arg: IConfirmDialogCloseArgs) => void;
	isCancelDefault?: boolean;
	withCancelButton?: boolean;
	canHide?: boolean;
	buttons?: IConfirmDialogButton[];
}

declare class ConfirmDialog {
	public static Show(options: IConfirmDialogOptions): void;
	public static ShowMessageDialog(options: IConfirmDialogOptions): void;
}

/**
 * This interface has been deprecated. See IScriptLog instead.
 * @deprecated
 */
interface IScriptDebugConsole {
	WriteLine(text): void;
	Clear(): void;
}

declare class InstanceCache {
	public static Add(controller: IInstanceController, key: string, val: any): void;
	public static Get<T>(controller: IInstanceController, key: string): T;
	public static Remove(controller: IInstanceController, key: string): boolean;
	public static ContainsKey(controller: IInstanceController, key: string): boolean;
}

declare class SessionCache {
    public static Add(key: string, val: any): void;
    public static Get<T>(key: string): T;
    public static Remove(key: string): boolean;
    public static ContainsKey(key: string): boolean;
}

interface IScriptLog {
	Error(message: string, ex?: Error): void;
	Warning(message: string, ex?: Error): void;
	Info(message: string, ex?: Error): void;
	Debug(message: string, ex?: Error): void;
	Trace(message: string, ex?: Error): void;
	SetDefault(): void;
	SetDebug(): void;
	SetTrace(): void;
}

interface RequestEventArgs {
	controller: IInstanceController;
	commandType: string;
    commandValue: string;
}

interface CancelRequestEventArgs extends RequestEventArgs {
	cancel: boolean;
}

interface IInstanceEvent {
	On(handler: Function): Function;
    Off(handler: Function): Function;
    Clear(): void;
}

interface IInstanceController {
	GetInstanceId(): string;
	GetGrid(): IActiveGrid;
	GetContentElement(): IContentElement;
	GetContent(): JQuery;
	GetValue(name: string): any;
	SetValue(name: string, val: any): void;
    GetElement(name: string): any;
    GetMode(): string;
	GetProgramName(): string;
	GetPanelName(): string;
	GetSortingOrder(): string;
	GetView(): string;
	ListOption(option: string): void;
	PageDown(): void;
	PressKey(key: string): void;
	ShowMessage(message: string): void;
	ShowMessageInStatusBar(message: string): void;

    ParentWindow: JQuery;
    RenderEngine: IRenderEngine;
	Requesting: IInstanceEvent;
	Requested: IInstanceEvent;
    RequestCompleted: IInstanceEvent;
    Response: IResponseElement;
}

interface IRenderEngine {
    Content: IContentElement;
    OpenFieldHelp(resp: IResponseElement, host: any, cont: IInstanceController, element: JQuery): void;
    ShowMessage(msg: string): void;
}

interface IActiveGrid {
    getColumns(): any[];
    setColumns(columns: any[]): void;
    getData();

    onSelectedRowsChanged: any;
    setSelectedRows(rows: any[]): void;
}

/**
 * Represent initialization arguments for an H5 script.
 */
interface IScriptArgs {
	/**
	 * Gets the instance controller for the current program.
	 */
	controller: IInstanceController;

	/**
	 * Gets the element or null if the script is not connected to an element.
	 */
	elem: any;

	/**
	 * Gets the script argument string or null if no script arguments were specified.
	 */
	args: string;

	/**
	 * Gets a log object for logging to the browser console.
	 */
	log: IScriptLog;

	/**
	 * The log property should be used instead of the debug property which has been deprecated.
	 * @deprecated
	 */
	debug: IScriptDebugConsole;
}

interface IMIOptions {
    company?: string;
    division?: string;
    excludeEmptyValues?: boolean;
    maxReturnedRecords?: number;
    includeMetadata?: boolean;
    typedOutput?: boolean;
    timeout?: number;
}

interface IMIRequest extends IMIOptions {
    program?: string;
    transaction?: string;
    record?: any;
    outputFields?: string[];
}

interface IMIResponse {
    program?: string;
    transaction?: string;
    item?: any;
    items?: any[];
    metadata: any;
    tag?: any;
    errorField?: string;
    errorType?: MIErrorType;
    error?: any;
    errorMessage?: string;
    errorCode?: string;
    hasError(): boolean;
}

declare class MIRequest implements IMIRequest {
    //MIOptions
    company: string;
    division: string;
    excludeEmptyValues: boolean;
    maxReturnedRecords: number;
    includeMetadata: boolean;
    typedOutput: boolean;
    timeout: number;
    //Request
    program: string;
    transaction: string;
    record: any;
    outputFields: string[];
}

declare enum MIErrorType {
    Http, MI, Parse
}

declare class MIService {
    public static Current: MIService;
    public executeRequest(request: IMIRequest): Promise<{}>;
	public execute(program: string, transaction: string, record?: any, outputfields?: string[], timeout?: number): Promise<{}>
}

interface IMIMetadataMap {
    [name: string]: IMIMetadataInfo;
}

declare enum MIDataType {
    String, Numeric, Date,
}

interface IMIMetadataInfo {
    name: string;
    type: MIDataType;
    length: number;
    description: string;
    setType(value: string): void;
}

declare class MIMetadataInfo implements IMIMetadataInfo {
    name: string;
    type: MIDataType;
    length: number;
    description: string;
    public setType(value: string): void;
}

declare class ListControl {
    public static ListView: any;
    public static Columns(): any[];
    public static GetPositionFieldValue(colName): string;
}

declare enum ActionType {
    Run, Key, ListOption, Set
}

declare class MFormsAutomation {
    addStep(action: ActionType, parameter: string, expected?: string): void;
    addField(name: string, value: string): void;
    setFocus(name: string);
    toEncodedUri(): string;
}

declare class H5ControlUtil {
    public static H5Dialog;
}

declare class ScriptUtil {
    /**
	 * The MIService should be used for MI calls instead.
	 * @deprecated
	 */
    public static ApiRequest(URL: string, onSuccess: Function, onFail: Function): void;
    /**
	 * The MIService should be used for MI calls instead.
	 * @deprecated
	 */
    public static ApiRequest(URL: string): void;
    public static FindChild(parent: JQuery, elementName: string): JQuery;
    public static GetFieldValue(fieldName: string, controller: IInstanceController): string;
    public static GetFieldValue(fieldName: string): string;
    public static SetFieldValue(fieldName: string, controller: IInstanceController): string;
    public static SetFieldValue(fieldName: string): string;
    public static Launch(task: string): void;
    public static AddEventHandler(element: JQuery, eventType: string, callback: Function, paramData: any): void;
    public static AddEventHandler(element: JQuery, eventType: string, callback: Function): void;
    public static RemoveEventHandler(element: JQuery, eventType: string);
    public static GetUserContext(contextProp: string): string;
    public static GetUserContext(): any;
    public static OpenMenu(name: string, controller: IInstanceController): void;
    public static OpenMenu(name: string): void;
    public static DoEnterpriseSearch(query: string, controller: IInstanceController): void;
    public static DoEnterpriseSearch(query: string): void;
}
declare var Configuration;

declare module infor.companyon {
    class client {
        public static sendPrepareDrillbackMessage(drillback: string): void;
    }
}