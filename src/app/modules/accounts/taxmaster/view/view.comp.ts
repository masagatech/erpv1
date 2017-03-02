import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { taxMasterService } from "../../../../_service/taxmaster/taxmaster-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [taxMasterService, CommonService]
    //,AutoService
}) export class taxview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private taxMasterServies: taxMasterService, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Tax Master");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }
    // //Group Code (Edit) Group
    // Editacgroup(row) {
    //     if (!row.IsLocked) {
    //         this._router.navigate(['/master/acgroup/edit', row.groupid]);
    //     }
    // }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/taxmaster/add']);
        }
        else if (evt === "save") {
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
        this.setActionButtons.setTitle("");
    }
}