import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { PurchaseviewService } from "../../../../_service/suppurchase/view/purchaseview-service";
import { CommonService } from '../../../../_service/common/common-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'purchaseview.comp.html',
    providers: [PurchaseviewService, CommonService]
})

export class purchaseview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable Declare 
    FromDate: any = "";
    ToDate: any = "";
    FromDoc: any = "";
    ToDoc: any = "";
    PODetails: any = [];
    SupplierName: any = "";
    SupplierID: any = "";
    TableHide: any;
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
    private _autoservice: CommonService, private PurchaseServies: PurchaseviewService,
    private _userService: UserService) {
    }
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        //Get All Record
        $(".SupplierName").focus();
        this.TableHide = true;
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
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/purchaseadd']);
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

    //Supplier Change Event Bind Supplier
    getAutoCompleteSupplier(me: any) {
        this._autoservice.getAutoData({ 
            "type": "supplier", "key": this.SupplierName }).subscribe(data => {
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

    //More Button Click Event
    GetSupplierDetails() {
        if($(".SupplierName").val()=="")
        {
            this.SupplierID=0;
        }
        this.FromDate=$("#FromDate").val();
        this.ToDate=$("#ToDate").val();
        this.PurchaseServies.getSupplierDetails({
            "CmpCode": "MTech",
            "FY": 5,
            "FilterType": "",
            "PurOrId": 0,
            "CreatedBy": "",
            "FromDate":this.FromDate,
            "ToDate":this.ToDate,
            "SupplierId": this.SupplierID == "" ? 0 : this.SupplierID,
            "flag": "",
            "flag1": ""
        }).subscribe(details => {
            var dataset = JSON.parse(details.data);
            if (dataset.Table.length > 0) {
                this.PODetails = dataset.Table;
                this.TableHide = false;
            }
            else
            {
                this.PODetails=[];
                this.TableHide = true;
                alert("Record not found");
                $(".SupplierName").focus();
            }

        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Edit Row
    EditPO(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/supplier/purchaseedit', row.PoId]);
        }
    }

    //More Button Click
    expandDetails(row) {
        if (row.IsCollapse == 0) {
            row.IsCollapse = 1;
            if (row.Details.length === 0) {
                this.PurchaseServies.getSupplierDetails({
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

    //Total AMount 
    TotalAmt() {
        if (this.PODetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Amount);
            }
            return total;
        }
    }

    //Total Qunatity
    TotalQty() {
        if (this.PODetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Qty);
            }
            return total;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }

}