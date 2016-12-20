import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { ExpensesviewService } from "../../../../_service/supexp/view/Expview-service";

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'expview.comp.html',
    providers: [ExpensesviewService]                         
})

export class expview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable Declare 
    FromDate: any;
    ToDate: any;
    FromDoc: any;
    ToDoc: any;
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BankServies: ExpensesviewService) { //Inherit Service dcmasterService
    }
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            var date = new Date();
            var Fromtoday = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
            var Totoday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
              $("#FromDate").datepicker('setDate',Fromtoday);

            //To Date
            $("#ToDate").datepicker({
                dateFormat: 'dd/mm/yy',
                 minDate: 0,
                setDate: new Date(),
                autoclose: true
            });
              $("#ToDate").datepicker('setDate',Totoday);
        }, 0);

    }
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/expadd']);
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