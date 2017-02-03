import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service'; /* add reference for view debitnote */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewdebitnote.comp.html',
    providers: [DNService]
})

export class ViewDebitNote implements OnInit, OnDestroy {
    title: any;
    loginUser: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewDebitNoteDT: any[] = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private _dnservice: DNService, private _userService: UserService) {
        this._dnservice.getDebitNote({ "flag": "docrange", "fy": "7", "DNAutoID": "0", "fromdocno": "1", "todocno": "100" }).subscribe(data => {
            this.viewDebitNoteDT = data.data;
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
                this._dnservice.getDebitNote({ "flag": "details", "docno": row.docno }).subscribe(data => {
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

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            DebitAmtTotal += parseInt(items.TotalDebitAmount);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            CreditAmtTotal += parseInt(items.TotalCreditAmount);
        }

        return CreditAmtTotal;
    }

    openDNDetails(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/accounts/debitnote/edit', row.dnid]);
        }
    }

    ngOnInit() {
        this.title = "View Debit Note";
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
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