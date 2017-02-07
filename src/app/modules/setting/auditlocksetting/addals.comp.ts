import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { ALSService } from '../../../_service/auditlock/als-service'; /* add reference for audit lock setting */
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: 'addals.comp.html',
    providers: [ALSService]
})

export class ALSAddEdit implements OnInit, OnDestroy {
    title: any;
    remarks: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    alsRowData: any = [];

    minDate: Date;
    maxDate: Date;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _alsservice: ALSService, private _msg: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.getAuditLockSetting();
    }

    ngOnInit() {
        this.title = "Add dn";
        console.log('ngOnInit');

        let today = new Date();
        let month = today.getMonth();
        let prevMonth = (month === 0) ? 11 : month - 1;
        let nextMonth = (month === 11) ? 0 : month + 1;
        this.minDate = new Date();
        this.minDate.setMonth(nextMonth);
        this.maxDate = new Date();
        this.maxDate.setMonth(prevMonth);

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            this.actionButton.find(a => a.id === "edit").hide = true;
            this.actionButton.find(a => a.id === "delete").hide = true;
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveALSData();
        } else if (evt === "edit") {
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    getAuditLockSetting() {
        this._alsservice.getAuditLockSetting({ "flag": "" }).subscribe(data => {
            this.alsRowData = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    expandDetails(row) {
        if (row.issh == 0) {
            row.issh = 1;
            if (row.details.length === 0) {
                this._alsservice.getAuditLockSetting({ "flag": "details", "alsid": row.alsid }).subscribe(data => {
                    row.details = data.data;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.issh = 0;
        }
    }

    saveALSData() {
        var that = this;
        var auditlockdt = [];
        var lockDate: any;

        for (var i = 0; i < that.alsRowData.length; i++) {
            var field = that.alsRowData[i];
            lockDate = field.lockdate;

            if (lockDate != "") {
                auditlockdt.push({
                    "alaid": 0,
                    "dispnm": field.dispcd,
                    "auditdt": field.lockdate,
                    "prevauditdt": field.currlockdate,
                    "fy": that.loginUser.fy,
                    "cmpid": that.loginUser.cmpid,
                    "uidcode": that.loginUser.login,
                    "remarks": that.remarks
                });
            }
        }

        console.log(JSON.stringify(auditlockdt));

        var saveDR = {
            "auditlockaction": auditlockdt
        }

        that._alsservice.saveAuditLockAction(saveDR).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].msgid != "-1") {
                that._msg.Show(messageType.success, "Success", dataResult[0].msg);
                that._router.navigate(['/setting']);
            }
            else {
                that._msg.Show(messageType.error, "Error", dataResult[0].msg);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}