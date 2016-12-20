import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { SupplierDetailsService } from "../../../_service/supplierdetails/supplierdetails-service";  //Service Add Refrence Bankpay-service.ts

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'supplierdetails.comp.html',
    providers: [SupplierDetailsService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})

export class supplierdetailsview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    PODetails: any[];
    SupplierName: any;
    //Veriable Declare
    private subscribeParameters: any;
    supplierid:any;
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private supdetails: SupplierDetailsService, private _routeParams: ActivatedRoute) {

    }
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.supplierid = params['id'];
                this.GetSupplierDetails(this.supplierid)

            }
        });
    }

    // Get Supplier Details
    GetSupplierDetails(supplierid) {
        var that = this;
        this.supdetails.getSupplierDetails({
            "CmpCode": "MTech",
            "FY": 5,
            "FilterType": "",
            "PurOrId": 0,
            "CreatedBy": "",
            "FromDate":null,
            "ToDate":null,
            "SupplierId": supplierid,
            "flag": "",
            "flag1": ""
        }).subscribe(details => {
            var dataset = JSON.parse(details.data);
            that.SupplierName = dataset.Table[0].SuppNam;
            this.PODetails = dataset.Table;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Total AMount 
    TotalAmt() {
        if (this.PODetails != undefined) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Amount);
            }
            return total;
        }
    }

    //Total Qunatity
    TotalQty() {
        if (this.PODetails != undefined) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Qty);
            }
            return total;
        }
    }

    expandDetails(row) {
        if (row.IsCollapse == 0) {
            row.IsCollapse = 1;
            if (row.Details.length === 0) {
                this.supdetails.getSupplierDetails({
                    "FilterType": "Details",
                    "PurOrId": row.PoId,
                    "CmpCode": "Mtech",
                    "FY": 5
                }).subscribe(data => {
                    var dataset = JSON.parse(data.data);
                    row.Details = dataset.Table;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.IsCollapse = 0;
        }
    }

    EditPO(row) {
         if (!row.IsLocked) {
        this._router.navigate(['/supplier/purchaseedit', row.PoId]);
         }
    }

    //Open Edit Mode 
    actionBarEvt(evt) {
        if (evt === "add") {
           this._router.navigate(['/supplier/purchaseadd']);
        }
        else if (evt === "save") {
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