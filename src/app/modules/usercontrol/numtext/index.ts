import { NgModule, Component, forwardRef, OnInit, Input, OnChanges } from '@angular/core';
// import { MessageService, messageType } from '../../../_service/messages/message-service';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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

export const autoNumericOptionsEuro = {
    digitGroupSeparator: '.',
    decimalCharacter: ',',
    decimalCharacterAlternative: '.',
    currencySymbol: '\u202f€',
    currencySymbolPlacement: 's',
    roundingMethod: 'U',
};
//get accessor

@Component({
    selector: '<numtext></numtext>',
    templateUrl: 'numtext.comp.html',
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})

export class NumTextComp implements OnInit, ControlValueAccessor {
    //The internal data model
    private innerValue: any = '';
    private id: any = "numtext_" + (new Date().valueOf()).toString();
    //Placeholders for the callbacks which are later providesd
    //by the Control Value Accessor
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
        var that = this;
        setTimeout(function () {
            $("#" + that.id).autoNumeric('init', autoNumericOptionsEuro);
            that.updateModel();
        }, 0);
    }

    // onKeyPress(e) {
    //     this.updateModel();
    // }

    updateModel() {
        if ($("#" + this.id).autoNumeric()) {
            var val = $("#" + this.id).autoNumeric('get');
            this.onChangeCallback(val == "" ? 0 : val);
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