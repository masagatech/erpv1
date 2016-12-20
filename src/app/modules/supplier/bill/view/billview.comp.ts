import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { BillviewService } from "../../../../_service/supbill/view/billview-service";

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'billview.comp.html',
    providers: [BillviewService,CommonService]
})

export class billview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable Declare 
    BillDetails: any = [];
    FromDate: any = "";
    ToDate: any = "";
    FromDoc: any = 0;
    ToDoc: any = 0;
    SupplierName: any = "";
    SupplierID: any = "";
    TableHide:any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BillViewServies: BillviewService,private _autoservice: CommonService) { //Inherit Service
    }
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.TableHide=true;
        $('.SupplierName').focus();
        setTimeout(function () {
            var date = new Date();
            var Fromtoday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var Totoday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            //From Date 
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#FromDate").datepicker('setDate', Fromtoday);

            //To Date
            $("#ToDate").datepicker({
                dateFormat: 'dd/mm/yy',
                minDate: 0,
                setDate: new Date(),
                autoclose: true
            });
            $("#ToDate").datepicker('setDate', Totoday);
        }, 0);

    }

    //Auto Completed Supplier
    getAutoCompleteSupplier(me: any) {
        this._autoservice.getAutoData({ "type": "supplier", "search": this.SupplierName }).subscribe(data => {
            $(".SupplierName").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.SupplierID = ui.item.value;
                    me.SupplierName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

     //Edit Row
     EditPO(row) {
         if (!row.IsLocked) {
        this._router.navigate(['/supplier/billedit', row.InvNo]);
         }
    }

    //Get Details
    GetBillDetails() {
          if($(".SupplierName").val()=="")
        {
            this.SupplierID=0;
        }
        this.FromDate=$("#FromDate").val();
        this.ToDate=$("#ToDate").val();
        this.BillViewServies.getBillDetails({
            "cmpid": 1,
            "fy": 5,
            "InvId": 0,
            "createdby": "",
            "fromdate":this.FromDate,
            "todate":this.ToDate,
            "suppid": this.SupplierID == "" ? 0 : this.SupplierID,
            "flag": "",
            "flag1": ""
        }).subscribe(details => {
            var dataset = details.data;
            if(dataset.Table.length>0)
            {
                this.BillDetails = dataset.Table;
                this.TableHide=false;
            }
            else    
            {
                alert('Record not found');
                this.BillDetails=[];
                this.TableHide=true;
                $(".SupplierName").focus();
                return;
            }

            
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //More Button Click
    expandDetails(row) {
        if (row.IsCollapse == 0) {
            row.IsCollapse = 1;
            if (row.Details.length === 0) {
                this.BillViewServies.getBillDetails({
                    "FilterType": "Details",
                    "InvNo": row.InvNo,
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

    //Total AMount 
    TotalAmt() {
        if (this.BillDetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.BillDetails.length; i++) {
                total += parseInt(this.BillDetails[i].Amount);
            }
            return total;
        }
    }

    //Total Qunatity
    TotalQty() {
        if (this.BillDetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.BillDetails.length; i++) {
                total += parseInt(this.BillDetails[i].Qty);
            }
            return total;
        }
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/billadd']);
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