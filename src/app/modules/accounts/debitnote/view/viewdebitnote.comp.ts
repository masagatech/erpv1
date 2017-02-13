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
    fromno: any = "";
    tono: any = "";
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
        // this.fromdate.initialize(this.loginUser);
        // this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        // this.fromdate.setDate(new Date(this.loginUser.fyfrom));

        // this.todate.initialize(this.loginUser);
        // this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        // this.todate.setDate(new Date(this.loginUser.fyto));

        this.setActionButtons.setTitle("Accounts > Debit Note");

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "dn",
            "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetDNFields() {
        this.rangewise = "docrange";
        this.fromno = "";
        this.tono = "";
        this.status = "true";
    }

    getDNDetails(from: number, to: number) {
        var that = this;

        that._dnservice.getDebitNote({
            "flag": "docrange", "fromdocno": parseInt(that.fromno), "todocno": parseInt(that.tono),
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy,
            "from": from, "to": to, "isactive": that.status
        }).subscribe(debitnote => {
            that.totalRecords = debitnote.data[1].recordstotal;
            that.viewDebitNoteDT = debitnote.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadDebitNoteGrid(event: LazyLoadEvent) {
        this.getDNDetails(event.first, (event.first + event.rows));
    }

    searchDebitNote(dt: DataTable) {
        // if (this.rangewise == "docrange") {

        // }
        // if (this.rangewise == "daterange") {
        //     if (this.fromdate.setDate("")) {
        //         this._msg.Show(messageType.info, "Info", "Please select From Date");
        //         return;
        //     }
        //     if (this.todate.setDate("")) {
        //         this._msg.Show(messageType.info, "Info", "Please select To Date");
        //         return;
        //     }
        // }

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

    expandDetails(dt, event) {
        var that = this;
        var row = event.data;

        if (row.details.length === 0) {
            this._dnservice.getDebitNote({
                "flag": "details", "docno": row.docno,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                that.totalDetailsRecords = details.data[1][0].recordstotal;
                row.details = details.data[0];

                dt.toggleRow(event.data);
            }, err => {
                this._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } else {
            dt.toggleRow(event.data);
        }
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            DebitAmtTotal += parseInt(items.totdramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            CreditAmtTotal += parseInt(items.totcramt);
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

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/debitnote/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}