import { NgModule, Component, forwardRef, OnInit, AfterViewInit, Input, OnChanges } from '@angular/core';
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


    @Input() iscurrency: boolean = true;
    @Input() allowdecimal: boolean = false;
    @Input() decimals: number = this._userservice.getUser()._globsettings[0].settings[0].decimals;
    @Input() css: string = "";
    @Input() min: string = "-9999999999999";
    @Input() max: string = "9999999999999";
    @Input() grpseperator: string = ",";

    decimalsArry: any = ["", ".9", ".99", ".999", ".9999", ".99999", ".999999", ".9999999"];

    private innerValue: any = '';

    @Input() id: any = "numtext_" + (new Date().valueOf()).toString();

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    get value(): any {
        return this.innerValue;
    };

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
        digitGroupSeparator: this._userservice.getUser()._globsettings[0].settings[0].digitGroupSeparator,
        decimalCharacter: this._userservice.getUser()._globsettings[0].settings[0].decimalCharacter,
        decimalCharacterAlternative: this._userservice.getUser()._globsettings[0].settings[0].decimalCharacter,
        currencySymbol: this._userservice.getUser()._globsettings[0].settings[0].currencySymbol,
        currencySymbolPlacement: this._userservice.getUser()._globsettings[0].settings[0].currencySymbolPlacement,
        
        roundingMethod: 'U',
        minimumValue: "-9999999999999.99",
        maximumValue: "9999999999999.99"
    };

    //Set touched on blur
    onBlur(e) {
        this.onTouchedCallback();
        this.updateModel();
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
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

    }

    ngAfterViewInit() {
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
            that.updateModel();
        }, 100);
    }

    // onKeyPress(e) {
    //     this.updateModel();
    // }

    updateModel() {
        var that = this;

        if ($("#" + that.id).autoNumeric()) {
            var val = $("#" + that.id).autoNumeric('get');
            that.onChangeCallback(val == "" ? 0 : val);
        }
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