import { NgModule, Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;
declare var moment: any;

@Component({
    selector: '<autonumeric></autonumeric>',
    templateUrl: 'autonumeric.comp.html'
})

export class AutoNumericComp implements OnInit {
    @ViewChild("numeric")

    @Input() value: string = "";
    @Input() name: string = "";

    constructor() {

    }

    getValue() {
        return $("[name='" + this.name + "']").autoNumeric('get');
    }

    setValue(number) {
        var that = this;

        setTimeout(function () {
            $("[name='" + that.name + "']").autoNumeric('set', number);
        }, 0);
    }

    empty() {
        $("[name='" + this.name + "']").autoNumeric('set', "");
    }

    ngOnInit() {
        var that = this;

        setTimeout(function () {
            $("[name='" + that.name + "']").autoNumeric('init');
        }, 0);
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
    ],
    declarations: [
        AutoNumericComp
    ],
    exports: [AutoNumericComp]
})

export class AutoNumericModule {

}