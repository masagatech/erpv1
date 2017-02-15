import { NgModule, Component, OnInit, AfterViewInit, Input } from '@angular/core';
// import { MessageService, messageType } from '../../../_service/messages/message-service';
import { FormControl } from '@angular/forms';
import { UserService } from '../../../_service/user/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

//get accessor

@Component({
    selector: '<numlabel></numlabel>',
    templateUrl: 'numlabel.comp.html'
})

export class NumLabelComp implements OnInit {


    @Input() iscurrency: boolean = true;
    @Input() allowdecimal: boolean = false;
    @Input() decimals: number = this._userservice.getUser()._globsettings[0].decimals;
    @Input() css: string = "";
    @Input() min: string = "-9999999999999";
    @Input() max: string = "9999999999999";
    @Input() grpseperator: string = ",";
    @Input() value: string = ",";

    decimalsArry: any = ["", ".9", ".99", ".999", ".9999", ".99999", ".999999", ".9999999"];

    private innerValue: any = '';

    @Input() id: any = "numtext_" + (new Date().valueOf()).toString();
 

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

    

    ngOnInit() {

    }

    ngAfterViewInit() {
        var that = this;

        setTimeout(function () {
            that.autoNumericOptionsEuro.minimumValue = parseFloat(that.min) > 0.1 ? "0" : that.min;
            that.autoNumericOptionsEuro.maximumValue = that.max + that.decimalsArry[that.decimals];

            if (that.iscurrency) {
                $("#label_" + that.id).autoNumeric('init', that.autoNumericOptionsEuro);
            }
            else {
                that.autoNumericOptionsEuro.digitGroupSeparator = that.grpseperator;
                that.autoNumericOptionsEuro.currencySymbol = '';
                $("#label_" + that.id).autoNumeric('init', that.autoNumericOptionsEuro);
            }
         
        }, 100);
    }

 
}

@NgModule({
    imports: [FormsModule, CommonModule],
    declarations: [
        NumLabelComp
    ],
    exports: [NumLabelComp]
})

export class NumLabelModule {

}