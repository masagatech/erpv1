import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for view FY */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewfy.comp.html',
    providers: [FYService]
})

export class ViewFY implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewFYDT: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _fyservice: FYService) {
        this.getFYData();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getFYData() {
        this._fyservice.getFinancialYear({ "FYID": "0" }).subscribe(data => {
            this.viewFYDT = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }    

    openFYDetails(row) {
        this._router.navigate(['/setting/editfinancialyear', row.FYID]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/addfinancialyear']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}