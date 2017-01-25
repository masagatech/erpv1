import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseViewService } from "../../../../_service/warehouse/view/view-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [WarehouseViewService, CommonService]
    //,AutoService
}) export class WarehouseView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    Warehaouselist: any = [];
    totalRecords: number = 0;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private warehouseServies: WarehouseViewService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
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


    getWarehouse(from: number, to: number) {
        var that = this;
        that.warehouseServies.getwarehouse({
            "cmpid": this.loginUser.cmpid,
            "from": from,
            "to": to,
            "flag":""
        }).subscribe(result => {
            var dataset = result.data;
            that.totalRecords = dataset[1][0].recordstotal;
            //total row
            that.Warehaouselist = dataset[0];
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.getWarehouse(event.first, (event.first + event.rows));
    }

    EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['/warehouse/warehouse/edit', row.id]);
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['warehouse/warehouse/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}