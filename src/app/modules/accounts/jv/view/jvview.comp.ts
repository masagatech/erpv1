import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service' /* add reference for view employee */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'jvview.comp.html',
    providers: [JVService]
})

export class ViewJV implements OnInit, OnDestroy {
    title: any;
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewJVDT: any[] = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _jvservice: JVService) {
        this._jvservice.getJVDetails({ "flag": "docrange", "fromdocno": "1", "todocno": "100", "fyid": "7" }).subscribe(data => {
            this.viewJVDT = data.data;
            console.log(this.viewJVDT);
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
                this._jvservice.getJVDetails({ "flag": "details", "jvmid": row.jvmid }).subscribe(data => {
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

        for (var i = 0; i < this.viewJVDT.length; i++) {
            var items = this.viewJVDT[i];
            DebitAmtTotal += parseInt(items.totdramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewJVDT.length; i++) {
            var items = this.viewJVDT[i];
            CreditAmtTotal += parseInt(items.totcramt);
        }

        return CreditAmtTotal;
    }

    openJVDetails(row) {
        if (!row.islocked) {
            this._router.navigate(['/accounts/editjv', row.jvmid]);
        }
    }

    ngOnInit() {
        this.title = "View JV";
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/addjv']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}