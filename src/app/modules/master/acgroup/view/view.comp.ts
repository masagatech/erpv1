import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { acgroupview } from "../../../../_service/acgroup/view/view-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [acgroupview, CommonService]
    //,AutoService
}) export class acview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // FromDate: any;
    // ToDate: any;
    GroupName: any = "";
    Groupcode: any = 0;
    acgrouplist: any = [];
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private acgroupServies: acgroupview, private _autoservice: CommonService,
        private _userService: UserService) {
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".GroupName").focus();
        this.getAccountGroupView();
    }

    //Json Param
    jsonPram() {
        var Param = {
            "groupid": 0,
            "groupcode": "0",
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "CreatedBy": this.loginUser.login,
            "flag": "all"
        }
        return Param;
    }

    //Get Edit And View
    getAccountGroupView() {
        this.acgroupServies.acGroupView(
            this.jsonPram()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset.length > 0) {
                this.acgrouplist = dataset;
            }
            else {
                alert("Record not found");
                $(".GroupName").focus();
                return;
            }

        }, err => {
            console.log("Error");

        }, () => {
            //Done
        });
    }

    //More Button Click Event
    expandDetails(row) {
        row.Details = [];
        if (row.issh == 0) {
            row.issh = 1;
            if (row.Details.length === 0) {
                this.acgroupServies.acGroupView({
                    "flag": "",
                    "neturid": row.autoid,
                    "groupid": 0,
                    "fromdate": "",
                    "todate": "",
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fyid,
                    "createdBy": this.loginUser.login
                }).subscribe(data => {
                    var dataset = data.data;
                    row.Details = dataset;
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

    //Group Code (Edit) Group
    Editacgroup(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/master/acgroup/acedit', row.groupid]);
        }
    }

    //Auto Completed Nature
    getAutoCompleteGroupName(me: any) {
        this._autoservice.getAutoData({
            "type": "nature",
            "search": this.GroupName,
            "CmpCode": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "createdBy": this.loginUser.login
        }).subscribe(data => {
            $(".GroupName").autocomplete({
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
                    me.Groupcode = ui.item.value;
                    me.GroupName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/acgroup/acadd']);
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
    }
}