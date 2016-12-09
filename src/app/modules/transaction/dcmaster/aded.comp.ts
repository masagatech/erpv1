import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { dcmasterService } from "../../../_service/dcmaster/dcmaster-service";  //Service Add Refrence dcmaster-service.ts

@Component({
    templateUrl: 'aded.comp.html',
    providers: [dcmasterService]                         //Provides Add Service dcmaster-service.ts
})

export class dcADDEdit implements OnInit, OnDestroy {

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    //Declare Veriable
    Salesmanlist: any[] = [];                                   // Salesman Static veriable for dropdown
    OtherSalesmanlist: any[] = [];                              // SalesmanOther Static veriable for dropdown
    Transpoterlist: any[] = [];                                 // Trapoter Static veriable for dropdown
    CustfilteredList: any[] = [];
    getCustomerAuto:any;

    constructor(private setActionButtons: SharedVariableService, private getdcdropdown: dcmasterService) { //Inherit Service dcmasterService
        
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        if (evt === "save") {
            alert("save called");
            this.actionButton.find(a => a.id === "save").hide = true;
        } else if (evt === "edit") {
            alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
    }

    private CustomerFilter(val) {
        if (val != "") {
            this.getdcdropdown.getAutoCompleted({
            "Key":val,
            "Userid":"",
            "Type":"Custcode",
            "Flag":"",
            "Flag1":""
        }).subscribe(data1=>{
            var dataset1= JSON.parse(data1.data);
           this.CustfilteredList=dataset1;
        }, err=> {
            console.log("Error");
        },()=> {
            console.log("Done");
        });
        }
    }
}