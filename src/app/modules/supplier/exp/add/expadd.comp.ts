import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ExpensesaddService } from "../../../../_service/supexp/add/expadd-service"; 

declare var $: any;
@Component({
    templateUrl: 'expadd.comp.html',
    providers: [ExpensesaddService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
}) export class expadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    docdate: any;
    CustNam: any;
    address: any;
    invNo: any;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private pendingdcServies: ExpensesaddService, private _autoservice: CommonService) { //Inherit Service dcmasterService
        //this.getPendingDocNo();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            var date = new Date();
            var CurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#docdate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#docdate").datepicker('setDate', CurrentDate);
        }, 0);
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
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