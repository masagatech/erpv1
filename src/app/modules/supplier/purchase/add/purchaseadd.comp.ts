import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { PurchaseaddService } from "../../../../_service/suppurchase/add/purchaseadd-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'purchaseadd.comp.html',
    providers: [PurchaseaddService, CommonService]                         //Provides Add Service dcmaster-service.ts
}) export class purchaseadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    PurOrId: any = 0;
    docdate: any = '';
    InvNostr: any = '';
    OtherRef: any = '';
    Adr: any = '';
    Remark: any = '';
    CustNam: any = '';
    ItemsName: any = '';
    ItemsCode: any = '';
    NewItemsName: any;
    NewItemsCode: any;
    AccountID: any = '';
    AccountName: any = '';
    SupplierName: any = '';
    SupplierID: any = '';
    Dis: any = 0;
    Rate: any = 0;
    Amount: any = 0;
    Qty: any = 0;
    Total: any = 0;
    DisTotal: any = 0;
    newAddRow: any=[];
    counter: any = 0;
    totalQty: any = 0;
    totalAmt: any = 0;
    SupplierTitle:any;
    Duplicateflag: boolean = true;
    Directinvoice: any = 0;
    private subscribeParameters: any;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private PurchaseServies: PurchaseaddService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) { //Inherit Service dcmasterService
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $('#docdate').focus();
        this.newAddRow = [];
        this.counter = 0;
        this.totalQty = 0;
        this.totalAmt = 0;
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

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.PurOrId = params['id'];
                this.EditPO(this.PurOrId);

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
    //Edit Param
    EditParamJson(PurOrid) {
        var Param = {
            "CmpCode": "Mtech",
            "FY": 5,
            "PurOrId": PurOrid,
            "CreatedBy": "",
            "SupplierId": 0,
            "FilterType": "Edit",
            "flag": "",
            "flag1": ""
        }
        return Param;
    }

    //Edit PO
    EditPO(PurOrid) {
        var that=this;
        this.PurchaseServies.EditPO(
            this.EditParamJson(PurOrid)
        ).subscribe(result => {
            var returndata = JSON.parse(result.data);
            this.docdate = returndata.Table[0].DocDate;
            this.InvNostr = returndata.Table[0].InvNo;
            this.OtherRef = returndata.Table[0].OtherRef;
            this.SupplierName = returndata.Table[0].SupplierName;
            this.SupplierID = returndata.Table[0].Supplierid;
            this.AccountName = returndata.Table[0].AccountName;
            this.AccountID = returndata.Table[0].Account;
            this.Adr = returndata.Table[0].Addresss;
            this.Remark = returndata.Table[0].Remark;
            this.newAddRow = returndata.Table1;
            that.SupplierTitle= "(" + returndata.Table[0].SupplierName + ")";
        }, err => {
            console.log(err);
        }, () => {
            //Complete
        })
    }

    //Clear Method
    ClearControll() {
        this.InvNostr = "";
        this.OtherRef = "";
        this.SupplierName = "";
        this.AccountName = "";
        this.Adr = "";
        this.Remark = "";
        this.newAddRow = [];
        $("#docdate").focus();
    }

    //Return To xml
    Paramxml() {
        var xml = "<r>";
        this.newAddRow.forEach(items => {
            xml += "<i>"
            xml += "<it>" + items.ItemsName.split(':')[0] + "</it>";
            xml += "<itn>" + items.ItemsName.split(':')[1] + "</itn>";
            xml += "<q>" + items.Qty + "</q>";
            xml += "<r>" + items.Rate + "</r>";
            xml += "<d>" + items.Dis + "</d>";
            xml += "<a>" + items.Amount + "</a>";
            xml += "<cre>" + 'Admin' + "</cre>"
            xml += "<dirc>" + this.Directinvoice + "</dirc>";
            xml += "<typ>" + "Pur" + "</typ>";
            xml += "</i>"
        });
        xml += "</r>";
        return xml;
    }
    //Return To Json
    ParamJson() {
        var Param = {
            "PurOrId": this.PurOrId,
            "CmpCode": "Mtech",
            "FY": 5,
            "InvNostr": this.InvNostr,
            "DocDate": this.docdate,
            "OtherRef": this.OtherRef,
            "SupplierId": this.SupplierID,
            "AccountId": this.AccountID,
            "Directinvoice": this.Directinvoice,
            "Address": this.Adr,
            "Remark": this.Remark,
            "xmldata": this.Paramxml(),
            "Status": "Status",
            "CreatedBy": "admin",
            "Remark1": "Remark1",
            "Remark2": "Remark2",
            "Remark3": "Remark3",
            "flag": "Flag",
            "flag1": "Flag1"
        }
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        this.Directinvoice = 1;
        if (evt === "save") {
            this.docdate = $('#docdate').val();
            if (this.docdate === "" || this.docdate == undefined) {
                alert("Please Select Document Date");
                $("#docdate").focus();
                return;
            }
            if (this.InvNostr === "" || this.InvNostr == undefined) {
                alert("Please Enetr Invoice no");
                $("#invNo").focus();
                return;
            }
            if (this.SupplierID === "" || this.SupplierID == undefined) {
                alert("Please Select Supplier");
                $(".SupplierName").focus();
                return;
            }
            if (this.AccountID === "" || this.AccountID == undefined) {
                alert("Please Select Account ");
                $(".AccountName").focus();
                return;
            }
            if (this.newAddRow.length == 0) {
                alert("Please Enetr Items");
                $("#foot_custname").focus();
                return;
            }
            this.PurchaseServies.SaveOP(
                this.ParamJson()
            ).subscribe(result => {
                var returndata = JSON.parse(result.data);
                if (returndata.Table[0].doc === 'INV') {
                    alert(returndata.Table[0].status);
                    $("#invNo").focus();
                    return;
                }
                if (returndata.Table[0].doc >= 1) {
                    alert('Data Save Successfully Document No : ' + returndata.Table[0].doc);
                    this.ClearControll();
                }
            }, err => {
                console.log(err);
            }, () => {
                //Complete
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            $("#docdate").focus();
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    private NewRowAdd() {
        if (this.ItemsName == '' || this.ItemsName == undefined) {
            alert('Please Enter items Name');
            return;
        }
        if (this.Qty == '' || this.Qty == undefined) {
            alert('Please Enter Quntity');
            return;
        }
        if (this.Dis > 100) {
            alert('Please Valid Discount')
            return;
        }
        this.Duplicateflag = true;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].ItemsName == this.ItemsName) {
                this.Duplicateflag = false;
            }
        }
        if (this.Duplicateflag == true) {
            this.newAddRow.push({
                'ItemsName': this.ItemsName,
                'Qty': this.Qty,
                'Rate': this.Rate,
                'Dis': this.Dis == "" ? "0" : this.Dis,
                'Amount': this.Amount,
                'counter': this.counter
            });
            this.counter++;
            this.ItemsName = "";
            this.NewItemsName = "";
            this.Qty = "";
            this.Rate = "";
            this.Dis = "";
            this.Amount = "";
            $("#foot_custname").focus();
        }
        else {
            alert('Duplicate Item');
            $("#foot_custname").focus();
            return;
        }
    }

    //Set Focus Inline Table
    SetFocusTable() {
        $("#foot_custname").focus();
    }

    //Auto Completed Customer Name
    getAutoCompleteAccount(me: any) {
        var _me = this;
        var that = this;
        this._autoservice.getAutoData({ "type": "account", "search": that.AccountName }).subscribe(data => {
            $(".AccountName").autocomplete({
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
                    me.AccountID = ui.item.value;
                    me.AccountName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getAutoCompleteSupplier(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "supplier", "search": that.SupplierName }).subscribe(data => {
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

    getAutoCompleteProd(me: any, arg: number) {
        this._autoservice.getAutoData({ "type": "prodname", "search": arg == 0 ? me.NewItemsName : me.ItemsName }).subscribe(data => {
            $(".ProdName").autocomplete({
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
                    me.ItemsName = ui.item.label;
                    if (arg === 1) {
                        me.ItemsName = ui.item.label;
                        me.ItemsCode = ui.item.value;
                        // _me.ItemsSelected(me.ItemsCode);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsCode = ui.item.value;
                        //_me.ItemsSelected(me.NewItemsCode);
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    private ConfirmQty(Qty) {
        this.Total = this.Qty * this.Rate;
        this.DisTotal = this.Total * this.Dis / 100;
        this.Amount = Math.round(this.Total - this.DisTotal);
    }

    //Total Quantity
    private TotalQty() {
        var total = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                total += parseInt(this.newAddRow[i].Qty);
            }
        }
        return total;
    }

    //Total Amount 
    private TotalAmount() {
        var totalamt = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                totalamt += parseInt(this.newAddRow[i].Amount);
            }
        }
        return totalamt;
    }

    //Delete 
    DeleteRow(rowindex) {
        var index = -1;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === rowindex) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.newAddRow.splice(index, 1);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}