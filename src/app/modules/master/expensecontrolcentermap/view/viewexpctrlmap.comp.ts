import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { ECMService } from "../../../../_service/expensecontrolcentermap/ecm-service" /* add reference for master of master */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewexpctrlmap.comp.html',
    providers: [ECMService]
})

export class ViewExpenseComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewECMDT: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    fromno: any = "";
    tono: any = "";
    status: string = "";

    statusDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _ecmservice: ECMService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        //this.fillStatusDropDown();
        this.resetECMFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Expense Control Mapping");

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/expensecontrolcentermap/add']);
        }
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "mst", "mtype": "ecm",
            "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    getExpenseCtrlMap(from: number, to: number) {
        var that = this;

        this._ecmservice.getAllExpenseCtrlMap({
            "flag": "grid", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "from": from, "to": to
        }).subscribe(expctrlmap => {
            that.totalRecords = expctrlmap.data[1][0].recordstotal;
            that.viewECMDT = expctrlmap.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadECMGrid(event: LazyLoadEvent) {
        this.getExpenseCtrlMap(event.first, (event.first + event.rows));
    }

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            this._ecmservice.getExpenseCtrlMap({
                "flag": "ccdetails", "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy, "expid": event.expid
            }).subscribe(details => {
                if (details.data.length > 0) {
                    event.loading = true;
                    event.details = details.data;
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

    openECMDetails(row) {
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This Record is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This , ecm.isactive is Deleted");
        }
        else {
            this._router.navigate(['/master/expensecontrolcentermap/edit', row.expid]);
        }
    }

    resetECMFields() {
        this.fromno = "";
        this.tono = "";
        this.status = "true";
    }

    ngOnDestroy() {
    }
}