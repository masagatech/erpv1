import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ContrService } from "../../../../_service/contrcenter/contr-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'contrview.comp.html',
    providers: [ContrService, CommonService]

}) export class contrview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    Ctrlview: any = [];
    totalRecords: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private ContrServies: ContrService, private _autoservice: CommonService, private _userService: UserService) {
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

        // this.getCtrlView();
        $(".center").focus();
    }

    getCtrlView(from: number, to: number) {
        var that = this;
        that.ContrServies.getCtrlcenter({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login,
            "from": from,
            "to": to
        }).subscribe(result => {
            that.totalRecords = result.data[1][0].recordstotal;
            //total row
            that.Ctrlview = result.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.getCtrlView(event.first, (event.first + event.rows));
    }

    EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['/setting/contrcenter/edit', row.autoid]);
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/contrcenter/add']);
        }

        if (evt === "save") {
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