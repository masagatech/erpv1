import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service'; /* add reference for view debitnote */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'viewdebitnote.comp.html',
    providers: [DNService]
})

export class ViewDebitNote implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;
    
    viewDebitNoteDT: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    rangewise: string = "";
    status: string = "";

    statusDT: any = [];

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _dnservice: DNService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetDNFields();
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("Debit Note");

        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        this.fromdate.initialize(this.loginUser);
        this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.fromdate.setDate(today);

        this.todate.initialize(this.loginUser);
        this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todate.setDate(today);

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    // click button action

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/debitnote/add']);
        }
    }

    fillStatusDropDown() {
        var that = this;

        that._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "dn",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    resetDNFields() {
        this.rangewise = "daterange";
        this.status = "true";
    }

    getDNDetails(from: number, to: number) {
        var that = this;

        var frmdt = that.fromdate.getDate();
        var todt = that.todate.getDate();

        that._dnservice.getDebitNote({
            "flag": "daterange", "fromdt": frmdt.length !== 0 ? frmdt : null, "todt": todt.length !== 0 ? todt : null,
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "from": from, "to": to, "isactive": that.status
        }).subscribe(debitnote => {
            that.totalRecords = debitnote.data[1].recordstotal;
            that.viewDebitNoteDT = debitnote.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadDebitNoteGrid(event: LazyLoadEvent) {
        this.getDNDetails(event.first, (event.first + event.rows));
    }

    searchDebitNote(dt: DataTable) {
        dt.reset();
    }

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            that._dnservice.getDebitNote({
                "flag": "details", "docno": event.docno
            }).subscribe(details => {
                var dataset = details.data;

                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.error, "Error", "Record Not Found");
                    return;
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
            }, () => {
                // console.log("Complete");
            })
        } catch (error) {

        }
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            DebitAmtTotal += parseFloat(items.totdramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            CreditAmtTotal += parseFloat(items.totcramt);
        }

        return CreditAmtTotal;
    }

    openDNDetails(row) {
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This Debit Note is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This Debit Note is Deleted");
        }
        else {
            this._router.navigate(['/accounts/debitnote/details', row.docno]);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}