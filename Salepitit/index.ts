import { IInputs, IOutputs } from "./generated/ManifestTypes";

const DefaultWidth = 106, DefaultHeight = 40;

class OutputState implements IOutputs {
    private size?: IInputs['Size']['raw'];
    private preferredWidth?: number;
    private preferredHeight?: number;
    private _changed = false;

    public commit() {
        const changed = this._changed;
        this._changed = false;
        return changed;
    }
    get changed() { return this._changed; }
    get Size() { return this.size; }
    get PreferredWidth() { return this.preferredWidth; }
    get PreferredHeight() { return this.preferredHeight; }
    set Size(value: typeof this.size) { if (value !== this.size) { this._changed = true; this.size = value; } }
    set PreferredWidth(value: typeof this.preferredWidth) { if (value !== this.preferredWidth) { this._changed = true; this.preferredWidth = value; } }
    set PreferredHeight(value: typeof this.preferredHeight) { if (value !== this.preferredHeight) { this._changed = true; this.preferredHeight = value; } }
}

export class Salepitit implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private ctx!: ComponentFramework.Context<IInputs>;
    private state = new OutputState;
    private notifyOutputChanged!: () => void;
    private readonly button = document.createElement('button');

    constructor() {
        this.button.type = 'button';
        this.button.textContent = 'Salepitit';
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

        ctx.mode.trackContainerResize(true);

        this.updateView(ctx);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param ctx The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(ctx: ComponentFramework.Context<IInputs>): void {
        this.ctx = ctx;

        let size = ctx.parameters.Size.raw;

        if (size === 'default' && this.state.Size === 'default'
            && (this.state.PreferredHeight !== ctx.mode.allocatedHeight
                || this.state.PreferredWidth !== ctx.mode.allocatedWidth)) {
            size = 'fill';
        }

        if (size === 'default') {
            this.button.style.height = `${this.state.PreferredHeight = DefaultHeight}px`;
            this.button.style.width = `${this.state.PreferredWidth = DefaultWidth}px`;
        } else {
            console.log(`s${ctx.mode.allocatedWidth}w${ctx.mode.allocatedHeight}h`)
            this.button.style.height = `${this.state.PreferredHeight = ctx.mode.allocatedHeight}px`;
            this.button.style.width = `${this.state.PreferredWidth = ctx.mode.allocatedWidth}px`;
        }

        this.state.Size = size;

        if (this.state.commit()) {
            console.log('put', this.state.Size, `${this.state.PreferredWidth}w${this.state.PreferredHeight}h`)
            this.notifyOutputChanged();
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return this.state;
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
    }
}
