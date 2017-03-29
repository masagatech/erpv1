import { NgModule, Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserService } from '../../../_service/user/user-service' /* add reference for user */
import { LoginUserModel } from '../../../_model/user_model';
import { MessageService, messageType } from '../../../_service/messages/message-service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule, CheckboxModule } from 'primeng/primeng';

declare var $: any;

@Component({
    selector: '<usermorerights></usermorerights>',
    templateUrl: 'addumr.comp.html'
})

export class UserMoreRightsComp implements OnInit, OnDestroy {
    @Input() umrrow: any = [];

    @Input() refuid: number = 0;
    @Input() fy: number = 0;
    
    @Input() morerights: boolean = false;
    @Input() menuname: string = "";

    fliterAPARDT: any = [];
    fliterBankDT: any = [];
    fliterBankTypeDT: any = [];
    fliterCCDT: any = [];

    fliterExtraAPARDT: any = [];
    fliterExtraBankDT: any = [];
    fliterExtraBankTypeDT: any = [];
    fliterExtraCCDT: any = [];

    loginUser: any = {};

    // @Input() selectedAPARType: string[] = [];
    // @Input() selectedBankType: string[] = [];
    // @Input() selectedBank: string[] = [];
    // @Input() selectedCC: string[] = [];

    constructor(private _userservice: UserService, private _msg: MessageService) {
    }

    ngOnInit() {
    }

    getExistsRights() {
        var that = this;

        that._userservice.getUserRights({
            "flag": "existsrights", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.refuid
        }).subscribe(data => {
            try {
                that.fliterAPARDT = data.data.filter(a => a.group === "apar");
                that.fliterBankDT = data.data.filter(a => a.group === "bank");
                that.fliterBankTypeDT = data.data.filter(a => a.group === "banktype");
                that.fliterCCDT = data.data.filter(a => a.group === "cc");
            }
            catch (e) {
                //that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    getMoreRights() {
        var that = this;

        that._userservice.getUserRights({
            "flag": "morerights", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.refuid
        }).subscribe(data => {
            try {
                that.fliterExtraAPARDT = data.data.filter(a => a.group === "apar");
                that.fliterExtraBankDT = data.data.filter(a => a.group === "bank");
                that.fliterExtraBankTypeDT = data.data.filter(a => a.group === "banktype");
                that.fliterExtraCCDT = data.data.filter(a => a.group === "cc");
            }
            catch (e) {
                //that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    editMoreRights(row) {
        var that = this;

        that._userservice.getUserRights({
            "flag": "editmorerights", "menuid": row.menucode, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.refuid
        }).subscribe(data => {
            try {
                if (data.data.length !== 0) {
                    row.selectedAPARType = data.data[0].apar;
                    row.selectedBank = data.data[0].bank;
                    row.selectedBankType = data.data[0].banktype;
                    row.selectedCC = data.data[0].cc;
                }
                else {
                    row.selectedAPARType = [];
                    row.selectedBank = [];
                    row.selectedBankType = [];
                    row.selectedCC = [];
                }

                // that.selectedAPARType = Object.keys(that.fliterExtraAPARDT).map(function (k) { return that.fliterExtraAPARDT[k].key });
                // that.selectedBank = Object.keys(that.fliterExtraBankDT).map(function (k) { return that.fliterExtraBankDT[k].key });
                // that.selectedBankType = Object.keys(that.fliterExtraBankTypeDT).map(function (k) { return that.fliterExtraBankTypeDT[k].key });
                // that.selectedCC = Object.keys(that.fliterExtraCCDT).map(function (k) { return that.fliterExtraCCDT[k].key });
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
    }
}

@NgModule({
    imports: [CommonModule, FormsModule, DialogModule, CheckboxModule],
    declarations: [
        UserMoreRightsComp
    ],
    exports: [UserMoreRightsComp]
})

export class UserMoreRightsModule {

}