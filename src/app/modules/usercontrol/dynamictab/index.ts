import { NgModule, Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { DynamicFieldsService } from '../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
    selector: '<dynamictab></dynamictab>',
    templateUrl: 'dyn_tab.comp.html',
    providers: [DynamicFieldsService]
})

export class DynamicTabComp implements OnInit, OnDestroy {
    @ViewChild("docdate")

    loginUser: LoginUserModel;
    DuplicateFlag: boolean = false;

    @Input() isdetails: boolean = false;
    @Input() tab: any = [];

    constructor(private _dynfldserive: DynamicFieldsService, private _commonservice: CommonService, private _userservice: UserService,
        private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
    }

    ngOnInit() {
    }

    // Add Key and Value for Dynamic Tab

    getKeyAuto(tab) {
        var that = this;

        that._commonservice.getAutoData({
            "type": "attribute", "cmpid": that.loginUser.cmpid, "search": tab.key, "filter": "Employee Attribute"
        }).subscribe(data => {
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

        if (tab.key === "") {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus();
        }
        else if (tab.value === "") {
            that._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus();
        }
        else {
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