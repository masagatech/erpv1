import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { PurchaseaddService } from "../../../../_service/suppurchase/add/purchaseadd-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

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
    Itemsid: any = 0;
    NewItemsName: any = '';
    NewItemsid: any = 0;
    AccountID: any = 0;
    AccountName: any = '';
    SupplierName: any = '';
    SupplierID: any = 0;
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
    SupplierTitle: any;
    Duplicateflag: boolean = true;
    Directinvoice: any = 0;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private PurchaseServies: PurchaseaddService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
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
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "PurOrId": PurOrid,
            "createdby": this.loginUser.login,
            "SupplierId": 0,
            "FilterType": "Edit",
            "flag": "",
            "flag1": ""
        }
        return Param;
    }

    //Edit PO
    EditPO(PurOrid) {
        var that = this;
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
            that.SupplierTitle = "(" + returndata.Table[0].SupplierName + ")";
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
            "purorid": this.PurOrId,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "invno": this.InvNostr,
            "docdate": $('#docdate').datepicker('getDate'),
            "refno": this.OtherRef,
            "suppid": this.SupplierID,
            "acid": this.AccountID,
            "Directinvoice": this.Directinvoice,
            "adr": this.Adr,
            "remark": this.Remark,
            "jsondata": this.newAddRow,
            "Status": "Status",
            "createdby": this.loginUser.login,
            "remark1": "Remark1",
            "remark2": "Remark2",
            "remark3": "Remark3"
        }
        console.log(Param);
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        this.Directinvoice = 1;
        if (evt === "save") {
            if ($('#docdate').val() === "") {
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
            // if (this.newAddRow.length == 0) {
            //     alert("Please Enetr Items");
            //     $("#foot_custname").focus();
            //     return;
            // }
            debugger;
            this.PurchaseServies.SaveOP(
                this.ParamJson()
            ).subscribe(result => {
                var returndata = result.data;
                console.log(returndata);
                if (returndata[0].funsave_purchaseord.msg === 'Save') {
                    alert("Data Save Successfully");
                    $("#invNo").focus();
                    return;
                }
                else {
                    console.log("Error");
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
                'Itemsid': this.Itemsid,
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
        this._autoservice.getAutoData({
            "type": "customer",
            "search": that.AccountName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".AccountName").autocomplete({
                source: data.data,
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
        this._autoservice.getAutoData({
            "type": "supplier",
            "search": that.SupplierName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".SupplierName").autocomplete({
                source: data.data,
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

    ItemsSelected(Itemsid) {
        this.PurchaseServies.getitemsDetails({
            "itemsid": Itemsid,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            var returndata = result.data;
            this.Itemsid = Itemsid;
            this.Qty = returndata[0].qty;
            this.Rate = returndata[0].itemscost;
            this.Dis = returndata[0].purdis;
            this.Amount = returndata[0].amount;
            console.log(returndata);
        }, err => {
            console.log(err);
        }, () => {
            //Complete
        })
    }

    getAutoCompleteProd(me: any, arg: number) {
        var _me = me;
        var that = this;
        this._autoservice.getAutoData({
            "type": "product",
            "search": arg == 0 ? me.NewItemsName : me.ItemsName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".ProdName").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    // me.ItemsName = ui.item.label;
                    if (arg === 1) {
                        me.ItemsName = ui.item.label;
                        me.Itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsid = ui.item.value;
                        _me.ItemsSelected(me.NewItemsid);
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