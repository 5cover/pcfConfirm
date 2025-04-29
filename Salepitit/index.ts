import { IInputs, IOutputs } from "./generated/ManifestTypes";

const DefaultWidth = 106, DefaultHeight = 40;

class OutputState {
    private _preferredWidth?: number;
    private _preferredHeight?: number;
    private _changed = false;

    public commit() {
        const changed = this._changed;
        this._changed = false;
        return changed;
    }
    get changed() { return this._changed; }
    get preferredWidth() { return this._preferredWidth; }
    get preferredHeight() { return this._preferredHeight; }
    set preferredWidth(value: typeof this._preferredWidth) { if (value !== this._preferredWidth) { this._changed = true; this._preferredWidth = value; } }
    set preferredHeight(value: typeof this._preferredHeight) { if (value !== this._preferredHeight) { this._changed = true; this._preferredHeight = value; } }
}

export class Salepitit implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private ctx?: ComponentFramework.Context<IInputs>;
    private state = new OutputState;
    private size?: IInputs['Size']['raw'];
    private notifyOutputChanged!: () => void;
    private readonly button = document.createElement('button');

    constructor() {
        this.button.type = 'button';
        this.button.textContent = 'Salepitit';
        this.button.style.boxSizing = 'border-box';
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param ctx The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        ctx: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        // control initialization code
        this.notifyOutputChanged = notifyOutputChanged;

        // add elements
        container.appendChild(this.button);

        this.updateView(ctx);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param ctx The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(ctx: ComponentFramework.Context<IInputs>): void {
        this.ctx = ctx;

        const isFill = 'fill' === ctx.parameters.Size.raw;
        const changedToFill = 'fill' !== this.size && isFill;
        
        this.size = ctx.parameters.Size.raw;
        ctx.mode.trackContainerResize(isFill);

        if (isFill) {
            this.button.style.width = `${ctx.mode.allocatedWidth === -1 ? this.state.preferredWidth : (this.state.preferredWidth = ctx.mode.allocatedWidth)}px`;
            this.button.style.height = `${ctx.mode.allocatedHeight === -1 ? this.state.preferredHeight : (this.state.preferredHeight = ctx.mode.allocatedHeight)}px`;
        } else {
            this.button.style.height = `${this.state.preferredHeight = DefaultHeight}px`;
            this.button.style.width = `${this.state.preferredWidth = DefaultWidth}px`;
        }

        if (changedToFill || this.state.commit()) {
            this.notifyOutputChanged();
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            PreferredHeight: this.state.preferredHeight,
            PreferredWidth: this.state.preferredWidth,
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
    }
}
