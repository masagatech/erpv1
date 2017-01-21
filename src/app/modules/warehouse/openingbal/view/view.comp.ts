import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { WarViewOpbal } from "../../../../_service/wareopeningbal/view/view-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [WarViewOpbal, CommonService]

}) export class WareopebalView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    Openinglist: any = [];


    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarViewOpbal, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.getopeningBal();
    }

    getopeningBal() {
        this.wareServies.getopeningstock({
            "flag": "",
            "cmpid": 1,
            "fy": 5
        }).subscribe(result => {
            this.Openinglist = result.data;
        }, err => {
            console.log("Error");
        }, () => {
            //console.log("Done");
        });
    }

    EditItem(row: any = []) {
        console.log(row);
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        var that = this;
        if (evt === "add") {
            this._router.navigate(['warehouse/openingbal/add']);
        }
        //Save Button Click 
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
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