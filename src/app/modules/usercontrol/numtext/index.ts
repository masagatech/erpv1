import { NgModule, Component, forwardRef, OnInit, Output, EventEmitter, AfterViewInit, Input, OnChanges } from '@angular/core';
// import { MessageService, messageType } from '../../../_service/messages/message-service';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { UserService } from '../../../_service/user/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NumTextComp),
    useValue: (c) => {
        return c.value;
    },
    multi: true
};



//get accessor

@Component({
    selector: '<numtext></numtext>',
    templateUrl: 'numtext.comp.html',
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})

export class NumTextComp implements OnInit, ControlValueAccessor {
    //The internal data model

    //Placeholders for the callbacks which are later providesd
    //by the Control Value Accessor

    // autoNumericOptionsEuro: any = {
    //     digitGroupSeparator: ',',
    //     decimalCharacter: '.',
    //     decimalCharacterAlternative: '.',
    //     currencySymbol: 'Rs',
    //     currencySymbolPlacement: 'p',
    //     roundingMethod: 'U',
    //     minimumValue: "-9999999999999.99",
    //     maximumValue: "9999999999999.99"
    // };

    isReady: boolean = false;
    @Input() iscurrency: boolean = true;
    @Input() allowdecimal: boolean = false;
    @Input() decimals: number = this._userservice.getUser()._globsettings[0].decimals;
    @Input() css: string = "";
    @Input() min: string = "-9999999999999";
    @Input() max: string = "9999999999999";
    @Input() grpseperator: string = ",";
    @Input() islabel: boolean = false;
    @Input() tabindex: number = 500;
    @Input() val: any;

    @Output() blur = new EventEmitter<any>();

    decimalsArry: any = ["", ".9", ".99", ".999", ".9999", ".99999", ".999999", ".9999999"];

    private innerValue: any = '';

    @Input() id: any = "numtext_" + (new Date().valueOf()).toString();

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    // get value(): any {
    //     return this.innerValue;
    // };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.updateModel();
            //this.onChangeCallback(v);
        }
    }

    constructor(private _userservice: UserService) {
    }

    autoNumericOptionsEuro: any = {
        digitGroupSeparator: this._userservice.getUser()._globsettings[0].thsep,
        decimalCharacter: this._userservice.getUser()._globsettings[0].decsep,
        decimalCharacterAlternative: this._userservice.getUser()._globsettings[0].thsep,
        currencySymbol: this._userservice.getUser()._globsettings[0].currsym,
        currencySymbolPlacement: this._userservice.getUser()._globsettings[0].currsymplace,

        roundingMethod: 'U',
        minimumValue: "-9999999999999.99",
        maximumValue: "9999999999999.99"
    };

    //Set touched on blur
    onBlur(e) {
        this.onTouchedCallback();
        this.updateModel();
        this.blur.emit({ "value": this.innerValue });
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
            var that = this;
            if (that.isReady) {
                setTimeout(function () {
                    $("#" + that.id).autoNumeric('set', value == "" ? 0 : value);
                }, 10)
            }
            // if ($("#" + this.id).autoNumeric('init')) {
            //     $("#" + this.id).autoNumeric('reSet');
            // }
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    ngOnInit() {
        var that = this;

        setTimeout(function () {
            that.autoNumericOptionsEuro.minimumValue = parseFloat(that.min) > 0.1 ? "0" : that.min;
            that.autoNumericOptionsEuro.maximumValue = that.max + that.decimalsArry[that.decimals];

            if (that.iscurrency) {
                $("#" + that.id).autoNumeric('init', that.autoNumericOptionsEuro);
            }
            else {
                that.autoNumericOptionsEuro.digitGroupSeparator = that.grpseperator;
                that.autoNumericOptionsEuro.currencySymbol = '';
                $("#" + that.id).autoNumeric('init', that.autoNumericOptionsEuro);
            }
            $("#" + that.id).autoNumeric('set', that.innerValue);
            that.isReady = true;
            that.updateModel();
            if(that.val !== undefined){
                that.innerValue = that.val;
                that.updateVal();
                 $("#" + that.id).autoNumeric('set', that.innerValue);
            }
        }, 100);
    }

    ngAfterViewInit() {

    }

    // onKeyPress(e) {
    //     this.updateModel();
    // }

    updateModel() {
        var that = this;

        if ($("#" + that.id).autoNumeric()) {
            var val = $("#" + that.id + "," + "label_" + that.id).autoNumeric('get');
            that.onChangeCallback(val == "" ? 0 : val);
        }
    }

    updateVal(){
        this.onChangeCallback(this.val == "" ? 0 : this.val);
    }
}

@NgModule({
    imports: [FormsModule, CommonModule],
    declarations: [
        NumTextComp
    ],
    exports: [NumTextComp]
})

export class NumTextModule {

}