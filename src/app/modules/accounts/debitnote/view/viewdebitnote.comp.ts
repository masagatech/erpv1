import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service'; /* add reference for view debitnote */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
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

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _dnservice: DNService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Debit Note");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getDNDetails(from: number, to: number) {
        var that = this;

        this._dnservice.getDebitNote({
            "flag": "docrange", "fromdocno": "1", "todocno": "100",
            "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy,
            "from": from, "to": to
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
        if (!row.IsLocked) {
            this._router.navigate(['/accounts/debitnote/edit', row.dnid]);
        }
        else {
            this._msg.Show(messageType.info, "Info", "This Debi Note is Locked");
        }
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/debitnote/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
    }
}