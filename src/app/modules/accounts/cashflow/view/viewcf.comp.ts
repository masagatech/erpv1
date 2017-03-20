import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CashFlowService } from '../../../../_service/cashflow/cf-service' /* add reference for view cash flow */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewcf.comp.html',
    providers: [CashFlowService]
})

export class ViewCashFlow implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewCFDT: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    rangewise: string = "";
    fromno: any = "";
    tono: any = "";
    status: string = "";

    statusDT: any = [];

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _cfservice: CashFlowService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetcfFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Journal Voucher");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/cashflow/add']);
        }
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "cf",
            "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetcfFields() {
        this.rangewise = "docrange";
        this.fromno = "";
        this.tono = "";
        this.status = "true";
    }

    getCashFlow(from: number, to: number) {
        var that = this;

        that._cfservice.getCashFlow({
            "flag": "docrange", "fromdocno": parseInt(that.fromno), "todocno": parseInt(that.tono),
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "from": from, "to": to, "isactive": that.status
        }).subscribe(cf => {
            that.totalRecords = cf.data[1][0].recordstotal;
            that.viewCFDT = cf.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadCFGrid(event: LazyLoadEvent) {
        this.getCashFlow(event.first, (event.first + event.rows));
    }

    searchCashFlow(dt: DataTable) {
        if (this.fromno == "") {
            this._msg.Show(messageType.info, "Info", "Please select From No");
            return;
        }
        if (this.tono == "") {
            this._msg.Show(messageType.info, "Info", "Please select To No");
            return;
        }

        dt.reset();
    }

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            that._cfservice.getCashFlow({
                "flag": "details", "docno": event.docno,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                var dataset = details.data;
                
                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                    event.totalDetailsRecords = dataset[1][0].recordstotal;
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    return;
                }
            }, err => {
                this._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } catch (error) {

        }
    }

    openCashFlow(row) {
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This Record is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This Record is Deleted");
        }
        else {
            this._router.navigate(['/accounts/cashflow/details', row.docno]);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}