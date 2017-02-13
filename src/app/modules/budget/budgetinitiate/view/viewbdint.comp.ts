import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewbdint.comp.html'
})

export class ViewBudgetInitiateComponent implements OnInit {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    constructor(private _router: Router, private setActionButtons: SharedVariableService) {

    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Inititate");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/budgetinitiate/add']);
        }
    }
}