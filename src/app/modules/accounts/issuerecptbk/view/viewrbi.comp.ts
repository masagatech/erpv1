import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { RBService } from '../../../../_service/receiptbook/rb-service' /* add reference for receipt book */
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewrbi.comp.html',
    providers: [RBService]
})

export class ViewRBI implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    datasource: any = [];
    receiptbook: any = [];
    totalRecords: number = 0;
    selectedRB1: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _rbservice: RBService) {
        
    }

    BindRBI(from: number, to: number) {
        var that = this;
        that._rbservice.getAllRBI({ "flag":"grid", "fyid":"7", "from": from, "to": to }).subscribe(data => {
            that.totalRecords = data.data[1][0].recordstotal;
            that.receiptbook = data.data[0];
            console.log(data.data);
        });
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.BindRBI(event.first, (event.first + event.rows));
    }

    openRBIDetails(row) {
        this._router.navigate(["/accounts/receiptbookissued/edit", row.irbid]);
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/receiptbookissued/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}