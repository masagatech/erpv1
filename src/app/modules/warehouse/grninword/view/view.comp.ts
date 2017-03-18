import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { grnInwordService } from "../../../../_service/grninword/grninword-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [grnInwordService, CommonService]

}) export class grnInwordView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    totalRecords: number = 0;
    inwordlist: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private grnServies: grnInwordService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    //Pagination Grid View 
    loadRBIGrid(event: LazyLoadEvent) {
        this.getInworddetails(event.first, (event.first + event.rows));
    }

    //Get all detail
    getInworddetails(from: number, to: number) {
        try {
            var that = this;
            that.grnServies.getInwordgriddetail({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "from": from,
                "to": to,
                "createdby": that.loginUser.login,
                "flag": ""
            }).subscribe(result => {
                that.totalRecords = result.data[1][0].recordstotal;
                that.inwordlist = result.data[0];
            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Row edit event
    EditItem(event) {
        try {
            var data = event.data;
            if (data != undefined) {
                data = event.data;
            }
            else {
                data = event;
            }
            if (!data.islocked) {
                this._router.navigate(['warehouse/grninword/edit', data.newdocno]);
            }
            else {
                this._msg.Show(messageType.error, "error", "this record locked");
            }

        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //expand click event
    expandDetails(event) {
        try {
            if (event.details && event.details.length > 0) { return; }
            var that = this;
            var row = event;
            row.loading = false;
            this.grnServies.getgrninworddetal({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdBy": this.loginUser.login,
                "docno": row.newdocno,
                "flag": "expanddetail",
            }).subscribe(data => {
                var dataset = data.data;
                if (dataset.length > 0) {
                    row.loading = true;
                    row.details = dataset[0];
                    this.TotalQty(row.details);
                    this.TotalAmt(row.details);
                }
                else {
                    that._msg.Show(messageType.error, "error", "Record Not Found");
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    TotalQty(details) {
        var totalqty = 0;
        for (let item of details) {
            totalqty += parseFloat(item.qty);
        }
        return totalqty;
    }

    TotalAmt(details) {
        var totalamt = 0;
        for (let item of details) {
            totalamt += parseFloat(item.amount);
        }
        return totalamt;
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['warehouse/grninword/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
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