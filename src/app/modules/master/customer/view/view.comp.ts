import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { CustomerViewService } from "../../../../_service/customer/view/view-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';
declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [CustomerViewService, CommonService]
    //,AutoService
}) export class CustView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    customerlist: any = [];
    totalRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private CustViewServies: CustomerViewService, private _autoservice: CommonService) {
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getcustomer(from: number, to: number) {
        var that = this;
        that.CustViewServies.getcustomer({
            "cmpid": 1,
            "from": from,
            "to": to
        }).subscribe(result => {
            that.totalRecords = result.data[1][0].recordstotal;
            that.customerlist = result.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.getcustomer(event.first, (event.first + event.rows));
    }

    EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['master/customer/edit', row.autoid]);
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/customer/add']);
        }
        if (evt === "save") {
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}