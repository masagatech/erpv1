import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { accountledger } from "../../../../_service/accountledger/account-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [accountledger, CommonService]
    //,AutoService
}) export class aclview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // FromDate: any;
    // ToDate: any;
    GroupName: any = "";
    Groupcode: any = 0;
    accountledgerlist: any = [];

    //Grid Veriable
    totalRecords: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private acledgerServies: accountledger, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Account Ledger");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".GroupName").focus();
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.getAccountLedbgerView(event.first, (event.first + event.rows));
    }

    //Get Edit And View
    getAccountLedbgerView(from: number, to: number) {
        try {
            this.acledgerServies.getaccountledger({
                "groupid": 0,
                "groupcode": "0",
                "from": from,
                "to": to,
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.fy,
                "CreatedBy": this.loginUser.login,
                "flag": ""
            }).subscribe(result => {
                var dataset = result.data;
                if (dataset.length > 0) {
                    this.totalRecords = dataset[1][0].recordstotal;
                    this.accountledgerlist = dataset[0];
                }
                else {
                    $(".GroupName").focus();
                    return;
                }

            }, err => {
                console.log("Error");

            }, () => {
                //Done
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Group Code (Edit) Group
    EditItem(event) {
        try {
            var data = event.data;
            if (data != undefined) {
                data = event.data;
            }
            else {
                data = event;
            }
            if (!data.IsLocked) {
                this._router.navigate(['/master/acledger/edit', data.id]);
            }
        } catch (error) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/acledger/add']);
        }
        else if (evt === "save") {
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}