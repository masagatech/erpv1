import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { BilladdService } from "../../../../_service/supbill/add/billadd-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'billadd.comp.html',
    providers: [BilladdService, CommonService]                         //Provides Add Service dcmaster-service.ts
}) export class billadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    docdate: any = "";
    CustNam: any = "";
    address: any = "";
    invNo: any = 0;
    OtherRef: any = "";
    Adr: any = "";
    Remark: any = "";
    Dis: any = 0;
    Rate: any = 0;
    Amount: any = 0;
    Qty: any = 0;
    Total: any = 0;
    DisTotal: any = 0;
    newAddRow: any = [];
    counter: any = 0;
    totalQty: any = 0;
    totalAmt: any = 0;
    SupplierTitle: any = "";

    ItemsName: any = "";
    ItemsCode: any = "";
    NewItemsName: any = "";
    NewItemsCode: any = "";
    AccountID: any = "";
    AccountName: any = "";
    SupplierName: any = "";
    Duplicateflag: boolean = true;
    SupplierID: any = "";

    private subscribeParameters: any;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private BillServies: BilladdService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) {
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $('#docdate').focus();
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

                this.invNo = params['id'];
                this.EditBill(this.invNo);

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


    EditParamJson(invNo) {
        var Param = {
            "CmpCode": "Mtech",
            "FY": 5,
            "InvNo": invNo,
            "CreatedBy": "",
            "SupplierId": 0,
            "FilterType": "Edit",
            "flag": "",
            "flag1": ""
        }
        return Param;
    }

    EditBill(PurOrid) {
        var that = this;
        this.BillServies.EditBill(
            this.EditParamJson(PurOrid)
        ).subscribe(result => {
            var returndata = JSON.parse(result.data);
            this.docdate = returndata.Table[0].DocDate;
            this.invNo = returndata.Table[0].InvNo;
            this.OtherRef = returndata.Table[0].OtherRef;
            this.SupplierName = returndata.Table[0].SupplierName;
            this.SupplierID = returndata.Table[0].Supplierid;
            this.AccountName = returndata.Table[0].AccountName;
            this.AccountID = returndata.Table[0].AccountId;
            this.Adr = returndata.Table[0].Adr;
            this.Remark = returndata.Table[0].Remark;
            this.newAddRow = returndata.Table1;
            that.SupplierTitle = "(" + returndata.Table[0].SupplierName + ")";
        }, err => {
            console.log(err);
        }, () => {
            //Complete
        })
    }


    //Return XmlData
    ParamXml() {
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
            //xml += "<dirc>" + this.Directinvoice + "</dirc>";
            xml += "<typ>" + "Pur" + "</typ>";
            xml += "</i>"
        });
        xml += "</r>";
        return xml;
    }

    ParamJson() {
        var Param = {
            "cmpid": 1,
            "fy": 5,
            "invno": this.invNo,
            "docdate": this.docdate,
            "refno": this.OtherRef,
            "suppid": this.SupplierID,
            "acid": this.AccountID,
            //"Directinvoice": this.Directinvoice,
            "adr": this.Adr,
            "remark": this.Remark,
            //"xmldata": this.ParamXml(),
            "createdby": "admin",
            "remark1": "Remark1",
            "remark2": "Remark2",
            "remark3": "Remark3"
        }
        return Param;
    }

    //Clear Method
    ClearControll() {
        this.invNo = "";
        this.OtherRef = "";
        this.SupplierName = "";
        this.AccountName = "";
        this.Adr = "";
        this.Remark = "";
        this.newAddRow = [];
        $("#docdate").focus();
    }

    //Set Focus Inline Table
    SetFocusTable() {
        $("#foot_custname").focus();
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            this.docdate = $('#docdate').val();
            if (this.newAddRow.length == 0) {
                alert("Please Enetr Items");
                $("#foot_custname").focus();
                return;
            }
            this.BillServies.PurchaseInvoiceSave(
                this.ParamJson()
            ).subscribe(result => {
                var returndata = JSON.parse(result.data);
                if (returndata.Table[0].doc >= 1) {
                    alert('Data Save Successfully Document No : ' + returndata.Table[0].doc);
                    this.ClearControll();
                }
                else {
                    alert(returndata.Table[0].status)
                    return;
                }
            }, err => {
                console.log(err);
            }, () => {
                //Complete
            })
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            $("#docdate").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Auto Completed Customer Name
    getAutoCompleteAccount(me: any) {
        this._autoservice.getAutoData({ "type": "account", "search": this.AccountName }).subscribe(data => {
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

    //Product Add
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
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
                        _me.getRateDetails(me.NewItemsCode);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsCode = ui.item.value;
                        _me.getRateDetails(me.NewItemsCode);
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getRateDetails(ProdCode) {
        this.BillServies.getItemsRate({
            "CmpCode": "Mtech",
            "FY": 5,
            "ProdCode": ProdCode,
            "CreatedBy": "",
            "flag": "",
            "flag1": ""
        }).subscribe(data => {
            var dataset = JSON.parse(data.data);
            if (dataset.Table.length > 0) {
                this.Rate = dataset.Table[0].Rate;
                this.Dis = dataset.Table[0].Dis;
                this.Amount = dataset.Table[0].Amount;
            }
            else {
                alert("Rate Error")
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
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

    // Total Amount 
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