import { NgModule, Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DynamicFieldsService } from '../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
    selector: '<dynamictab></dynamictab>',
    templateUrl: 'dyntab.comp.html',
    providers: [DynamicFieldsService]
})

export class DynamicTabComp implements OnInit, OnDestroy {
    keyid: number = 0;
    key: string = "";
    value: string = "";
    DuplicateFlag: boolean = false;

    @Input() atttype: string = "";
    @Input() tab: any = [];
    @Input() isdetails: boolean = false;
    @Input() cmpid: number = 0;

    constructor(private _commonservice: CommonService, private _msg: MessageService) {
    }

    ngOnInit() {
    }

    // Add Key and Value for Dynamic Tab

    existKeyAuto(tab) {
        var that = this;

        that._commonservice.getAutoData({
            "type": "attribute", "cmpid": that.cmpid, "search": tab.key, "filter": that.atttype
        }).subscribe(data => {
            if (data.data.length === 0) {
                that._msg.Show(messageType.info, "info", "This attributes not exists !!!");
                tab.key = "";
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getKeyAuto(tab) {
        var that = this;

        that._commonservice.getAutoData({
            "type": "attribute", "cmpid": that.cmpid, "search": tab.key, "filter": that.atttype
        }).subscribe(data => {
            var attdata = data.data;

            $(".key").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    tab.keyid = ui.item.value;
                    tab.key = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    AddNewKeyVal(tab) {
        var that = this;

        that.DuplicateFlag = true;

        for (var i = 0; i < tab.fldvalue.length; i++) {
            if (tab.fldvalue[i].key === tab.key && tab.fldvalue[i].value === tab.value) {
                that.DuplicateFlag = false;
            }
        }

        if (that.DuplicateFlag === true) {
            tab.fldvalue.push({
                'key': tab.key,
                'value': tab.value
            });

            tab.key = "";
            tab.value = "";
            $(".key").focus();
        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".key").focus();
            return;
        }

        tab.isedit = false;
    }

    EditKeyVal(tab, row) {
        tab.selectedrow = row;
        tab.key = row.key;
        tab.value = row.value;
        tab.isedit = true;
    }

    UpdateKeyVal(tab) {
        tab.selectedrow.key = tab.key;
        tab.selectedrow.value = tab.value;
        tab.isedit = false;
        this.ClearKeyVal(tab);
    }

    setKeyVal(tab) {
        var that = this;

        if (tab.key === "") {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus();
        }
        else if (tab.value === "") {
            that._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus();
        }
        else {
            if (tab.isedit) {
                that.UpdateKeyVal(tab);
            }
            else {
                that.AddNewKeyVal(tab);
            }
        }
    }

    ClearKeyVal(tab) {
        tab.key = "";
        tab.value = "";
        tab.isedit = false;
    }

    DeleteKeyVal(tab, row) {
        tab.fldvalue.splice(tab.fldvalue.indexOf(row), 1);
        $(".key").focus();
    }

    ngOnDestroy() {
    }
}

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [
        DynamicTabComp
    ],
    exports: [DynamicTabComp]
})

export class DynamicTabModule {

}