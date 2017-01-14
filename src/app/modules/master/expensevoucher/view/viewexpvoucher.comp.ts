import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewexpvoucher.comp.html'
})

export class ViewExpenseVoucherComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    
    constructor(private _router: Router, private setActionButtons: SharedVariableService) {
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/expensevoucher/add']);
        }
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    ngOnDestroy() {
    }
}