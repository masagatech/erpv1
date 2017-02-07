import { NgModule, Component, OnInit, Input, ViewChild } from '@angular/core';
import { InputMaskModule, InputMask } from 'primeng/primeng';
import { MessageService, messageType } from '../../../_service/messages/message-service';

declare var $: any;
declare var moment: any;

@Component({
    selector: '<calendar></calendar>',
    templateUrl: 'calendar.comp.html'
})

export class CalendarComp implements OnInit {
    @ViewChild("docdate")
    docdate: InputMask;

    @Input() name: string = "";
    @Input() module: string = "";

    loginUser: any = {};

    constructor(private _msg: MessageService) {

    }

    setDate(date) {
        var that = this;

        setTimeout(function () {
            var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("[name='" + that.name + "']").datepicker('setDate', today);
        }, 0);
    }

    getDate() {
        return $("[name='" + this.name + "']").datepicker('getDate');
    }

    setMinMaxDate(min: any, max: any) {
        var that = this;
        
        setTimeout(function () {
            if (min != null)
                $("[name='" + that.name + "']").datepicker('option', 'minDate', min);
            if (max != null)
                $("[name='" + that.name + "']").datepicker('option', 'maxDate', max);
        }, 0)
    }

    isValid() {
        var isValidDT = moment($("[name='" + this.name + "']").val(), this.loginUser._globsettings[0].dateformat.replace(/y/g, "yy").toUpperCase(), true).isValid();
        var minDt = moment($("[name='" + this.name + "']").datepicker('option', 'minDate')).format('YYYY-MM-DD').toString();
        var maxDt = moment($("[name='" + this.name + "']").datepicker('option', 'maxDate')).format('YYYY-MM-DD').toString();
        var selDate = $("[name='" + this.name + "']").val();

        if (isValidDT) {
            var range = moment(selDate, this.loginUser._globsettings[0].dateformat.replace(/y/g, "yy").toUpperCase()).isBetween(minDt, maxDt, null, '[]');
            if (range) { return true; }
        }

        return false;
    }

    initialize(loginUser) {
        var that = this;

        this.loginUser = loginUser;
        this.docdate.name = that.name;
        this.docdate.mask = loginUser._globsettings[0].dateformat.replace(/d/g, "9").replace(/m/g, "9").replace(/y/g, "99");
        this.docdate.slotChar = loginUser._globsettings[0].dateformat.replace(/y/g, "yy");
        this.docdate.placeholder = loginUser._globsettings[0].dateformat.replace(/y/g, "yy");

        setTimeout(function () {
            $("[name='" + that.name + "']").datepicker({
                dateFormat: that.loginUser._globsettings[0].dateformat,
                // minDate: new Date('2016/04/01'),
                // maxDate: new Date('2017/03/31'),
                showAnim: "slide",
                changeYear: true,
                changeMonth: true,
                autoclose: true,
                onClose: function () {
                    if (!that.isValid()) {
                        $(this).val("").focus();
                        that._msg.Show(messageType.error, "error", "Invalid Date");
                    }
                }
            });
        }, 0);
    }

    ngOnInit() {
    }
}

@NgModule({
    imports: [InputMaskModule],
    declarations: [
        CalendarComp
    ],
    exports: [CalendarComp]
})

export class CalendarModule {

}