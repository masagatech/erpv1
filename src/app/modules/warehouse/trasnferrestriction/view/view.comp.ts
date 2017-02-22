import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { TransferrestrictionService } from "../../../../_service/transferrestriction/transferres-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [TransferrestrictionService, CommonService]

}) export class TRView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 


    //user details
    loginUser: LoginUserModel;
    loginUserName: string;
    totalRecords: number;
    whlist: any = [];



    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private TRServies: TransferrestrictionService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Transfer Restriction");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                // this.warehouseid = params['id'];
                //this.editMode(this.warehouseid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    getTransferRes(from: number, to: number) {
        var that = this;
        that.TRServies.getTransferRes({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "from": from,
            "to": to,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            that.totalRecords = result.data[1][0].recordstotal;
            that.whlist = result.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    EditItem(dt, event) {
        var data = event.data;
        if (!data.islocked) {
            this._router.navigate(['warehouse/transferres/edit', data.trid]);
        }
    }

    loadRBIGrid(event: LazyLoadEvent) {
        this.getTransferRes(event.first, (event.first + event.rows));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['warehouse/transferres/add']);
        }

        if (evt === "clear") {

        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
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