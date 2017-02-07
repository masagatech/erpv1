import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { TranspoterViewService } from "../../../../_service/transpoter/view/view-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [TranspoterViewService, CommonService]

}) export class transview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;



    //user details
    loginUser: LoginUserModel;
    loginUserName: string;
    transpoterlist: any = [];
    totalRecords: number = 0;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private transpoter_service: TranspoterViewService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Transpoter");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

    }

    //Get Customer Details
    getTranspoter(from: number, to: number) {
        var that = this;
        that.transpoter_service.getTranspoter({
            "cmpid": this.loginUser.cmpid ,
            "from": from,
            "to": to,
            "createdby":this.loginUser.login
        }).subscribe(result => {
            that.totalRecords = result.data[1][0].recordstotal;
            that.transpoterlist = result.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    //Pagination Grid View 
    loadRBIGrid(event: LazyLoadEvent) {
        this.getTranspoter(event.first, (event.first + event.rows));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/transpoter/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {

        } else if (evt === "delete") {
            alert("delete called");
        }
    }

     EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['master/transpoter/edit', row.autoid]);
        }
    }


    
    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}