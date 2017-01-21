import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseViewService } from "../../../../_service/warehousestock/view/view-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [WarehouseViewService, CommonService]                         //Provides Add Service

}) export class WarehouseView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    name: any = "";
    code: any = "";
    remark: any = "";
    wareid: any = 0;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, 
    private wareServies: WarehouseViewService, private _autoservice: CommonService, 
    private _routeParams: ActivatedRoute) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    // EditItem(row) {
    //     if (!row.islocked) {
    //         this._router.navigate(['/warehouse/warehousestock/edit', row.id]);
    //     }
    // }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['warehouse/warestock/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // $('input').removeAttr('disabled');
            // $('select').removeAttr('disabled');
            // $('textarea').removeAttr('disabled');
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "edit").hide = true;
            // $(".warehouse").focus();
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