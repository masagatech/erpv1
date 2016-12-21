import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for view employee */
import { dcmasterService } from "../../../../_service/dcmaster/add/dcmaster-service";  //Service Add Refrence dcmaster-service.ts

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'aded.comp.html',
    providers: [dcmasterService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})

export class dcADDEdit implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Veriable Local
    getCustomerAuto: any;
    custKey: any;
    CustAddress: any;
    BillAdr: any = "";
    shippAdr: any = "";
    docdate: any = "";
    delDate: any = "";
    Traspoter: any = 0;
    Token: any = "";
    SalesId: any = 0;
    OtherSalesid: any = 0;
    Salesmandrop: any;
    DirectInvoice: any = 0;
    Duplicateflag: boolean;
    Remark: any = "";
    Remark1: any = "";
    Remark2: any = "";
    Remark3: any = "";
    DocNo: any = 0;
    //Declare Array Veriable
    Salesmanlist: any = [];                                   // Salesman Static veriable for dropdown
    OtherSalesmanlist: any = [];                              // SalesmanOther Static veriable for dropdown
    Transpoterlist: any = [];                                 // Trapoter Static veriable for dropdown
    CustfilteredList: any = [];
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    selected: any = [];

    //Declare Table Veriable
    DCDetelId: any;
    Dis: any = 0;
    Rate: any = 0;
    Amount: any = 0;
    Qty: any = 0;
    Total: any = 0;
    DisTotal: any = 0;
    counter: any;
    Prod: any = 0;
    totalQty: any = 0;
    totalAmt: any = 0;
    CustID: any = 0;
    CustName: any = '';
    ItemsName: any = '';
    Itemsid: any = '';
    ProdSelectedCode: any = '';
    NewItemsName: any = "";
    NewItemsid: any = 0;
    AddEdit: any = '';
    footer: any;
    private subscribeParameters: any;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private dcServies: dcmasterService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) { //Inherit Service dcmasterService
        this.newAddRow = [];
        this.counter = 0;
        this.totalQty = 0;
        this.totalAmt = 0;
        // this.getAutoComplete();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        //Hide Show And Flage Add Edit
        this.AddEdit = 'add'
        this.footer = true;
        setTimeout(function () {
            var date = new Date();
            var docdate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#docDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#docDate").datepicker('setDate', docdate);

            $("#delDate").datepicker({
                dateFormat: "dd/mm/yy",
                minDate: 0,
                autoclose: true,
                setDate: new Date()
            });
            $("#delDate").datepicker('setDate', docdate);
            $('.Custcode').focus();
        }, 0);

        //Edit Mode

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.DocNo = params['id'];
                this.GetEditData(this.DocNo);

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

    //Clear All Controll
    private ClearControll() {
        this.CustName = "";
        this.Salesmandrop = "";
        this.OtherSalesid = "";
        this.Traspoter = "";
        this.Token = "";
        this.BillAdr = "";
        this.shippAdr = "";
        this.Remark1 = "";
        this.Remark2 = "";
        this.newAddRow = [];

    }

    //Add Top Buttons
    actionBarEvt(evt) {
        this.docdate = $("#docDate").val();
        this.delDate = $("#delDate").val();
        this.DirectInvoice = 0;
        if (evt === "save") {
            if (this.CustName == '' || this.CustName == undefined) {
                alert('Please Enter Customer');
                return false;
            }
            if (this.Salesmandrop == '' || this.Salesmandrop == undefined) {
                alert('Please Select Salesman');
                return false;
            }
            if (this.Traspoter == '' || this.Traspoter == undefined) {
                alert('Please Select Transpoter');
                return false;
            }
            // if (this.newAddRow.length == 0) {
            //     alert('Please Enter Items Details');
            //     return false;
            // }
            this.dcServies.saveDcMaster(
                {
                    "dcno": this.DocNo,
                    "docdate": this.docdate,
                    "acid": 1,
                    "refno": this.Token,
                    "deldate": this.delDate,
                    "salesid": this.Salesmandrop,
                    "othersalesid": this.OtherSalesid,
                    "traspo": this.Traspoter,
                    "billingadr": this.BillAdr,
                    "shippadr": this.shippAdr,
                    "fy": 5,
                    "cmpid": 1,
                    "createdby": "admin",
                    "remark": this.Remark,
                    "directinvoice": this.DirectInvoice,
                    "jsondata": this.newAddRow,
                    "remark1": this.Remark1,
                    "remark2": this.Remark2,
                    "remark3": this.Remark3
                }
            ).subscribe(result => {
                var returndata = result.data;
                console.log(returndata);
                if (returndata[0].doc > 0) {
                    alert("Data Save Succesfuly Document No: " + returndata[0].maxid)
                    this.ClearControll();
                    $('.Custcode').focus();
                }
                else {
                    console.log(returndata);
                }
            }, err => {
                console.log(err);
            }, () => {
                //console.log("Done");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            this.dcServies.deleteDcMaster({
                "DCNo": this.DocNo,
                "DCDetelId": 0,
                "CmpCode": "Mtech",
                "FY": 5,
                "UserCode": "Admin",
                "Flag": "DC"
            }).subscribe(data => {
                var dataset = data.data;
                if (dataset.Table[0].doc > 0) {
                    alert('Delete Data Successfully Document :' + dataset.Table[0].doc)
                    this.ClearControll();
                    $('input').removeAttr('disabled');
                    $('select').removeAttr('disabled');
                    $('textarea').removeAttr('disabled');
                    this.actionButton.find(a => a.id === "save").hide = false;
                    this.actionButton.find(a => a.id === "save").hide = false;
                    $('.Custcode').focus();
                }
                else {
                    console.log(dataset.Table[0].status)
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        }
    }

    GetEditData(Docno) {
        this.dcServies.getDcmasterView({
            "FilterType": "Edit",
            "DCNo": Docno,
            "CmpCode": "Mtech",
            "FY": 5
        }).subscribe(data => {
            var dataset = data.data;
            var CustomerMaster = dataset.Table;
            if (CustomerMaster.length > 0) {
                this.CustName = CustomerMaster[0].CustName;
                this.CustomerSelected(this.CustName.split(':')[0])
                this.docdate = CustomerMaster[0].DCDate;
                this.delDate = CustomerMaster[0].DeliveryDate;
                this.Salesmandrop = CustomerMaster[0].Saleman;
                this.OtherSalesid = CustomerMaster[0].OtherSaleman;
                this.Traspoter = CustomerMaster[0].Trans;
                this.Token = CustomerMaster[0].Tokenno;
                this.BillAdr = CustomerMaster[0].BillingAdr;
                this.shippAdr = CustomerMaster[0].ShippingAdr;
                this.Remark1 = CustomerMaster[0].Reamrk1;
                this.Remark2 = CustomerMaster[0].Reamrk2;
                var TitleDetails = dataset.Table1;
                this.newAddRow = TitleDetails;
            }
            else {
                console.log('Error');
            }

        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }


    //Auto Completed Customer Name
    getAutoComplete(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "Type": "CustName", "Key": this.CustName }).subscribe(data => {
            $(".Custcode").autocomplete({
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
                    me.CustID = ui.item.value;
                    me.CustName = ui.item.label;
                    _me.CustomerSelected(me.CustID);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //AutoCompletd Product Name
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({ "Type": "ProdName", "Key": arg == 0 ? me.NewItemsName : me.ItemsName }).subscribe(data => {
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
                    me.ItemsName = ui.item.label;
                    if (arg === 1) {
                        me.ItemsName = ui.item.label;
                        me.ItemsCode = ui.item.value;
                        _me.ItemsSelected(me.ItemsCode);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsCode = ui.item.value;
                        _me.ItemsSelected(me.NewItemsCode);
                    }
                    // me.ItemsKey = ui.item.label;
                    // _me.ItemsSelected(me.ItemsID);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // //Selected Customer  Event
    CustomerSelected(val) {
        if (val != "") {
            this.custKey = val;
            this.dcServies.getdropdwn({                     //User getdcdropdown
                "CustCode": val,
                "Salesman": '',
                "Flag": '',
                "Flag1": ''
            }).subscribe(CustomerSeldata => {
                var dataset = CustomerSeldata.data;                 //Return Data
                this.Salesmanlist = dataset.Table;                //Return Data
                this.CustAddress = dataset.Table1;
                this.BillAdr = this.CustAddress[0].BillAdr;
                this.shippAdr = this.CustAddress[0].BillAdr;
                this.Transpoterlist = dataset.Table2;
            }, err => {
                console.log('Error');
            }, () => {
                // console.log('Complet');
            });
            this.CustfilteredList = [];
        }
    }

    // //Selected Items
    ItemsSelected(val) {
        if (val != "") {
            this.Qty = 1;
            this.ProdSelectedCode = val;
            this.dcServies.getItemsAutoCompleted({
                "Key": "",
                "ProdCode": val,
                "UserId": "",
                "Flag1": "",
                "Flag2": ""
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data;
                if (this.newAddRow.length == 0) {
                    this.AddEdit = 'add'
                }
                if (this.AddEdit === 'add') {
                    this.Qty = 1;
                    this.Dis = ItemsResult[0].Discount;
                    this.Rate = ItemsResult[0].MRPRate;
                    this.Amount = ItemsResult[0].Amount;
                    this.ItemsfilteredList = [];
                }
                else {
                    for (var i = 0; i < this.newAddRow.length; i++) {
                        if (this.newAddRow[i].counter === this.AddEdit) {
                            this.newAddRow[i].Qty = 1;
                            this.newAddRow[i].Dis = ItemsResult[0].Discount;
                            this.newAddRow[i].Rate = ItemsResult[0].MRPRate;
                            this.newAddRow[i].Amount = ItemsResult[0].Amount;
                            break;
                        }
                    }

                }
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        }
    }

    //Add New Row
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
            return;
        }

    }

    //Quntity Calculation
    private ConfirmQty(Qty) {
        this.Total = this.Qty * this.Rate;
        this.DisTotal = this.Total * this.Dis / 100;
        this.Amount = Math.round(this.Total - this.DisTotal);
    }

    //Edit Row Quntity Calculation
    private ConfirmQtyEdit(counter, qty) {
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === this.AddEdit) {
                this.Total = qty * this.newAddRow[i].Rate;
                this.DisTotal = this.Total * this.newAddRow[i].Dis / 100;
                this.newAddRow[i].Amount = Math.round(this.Total - this.DisTotal);
                break;
            }
        }

    }

    private TotalQty() {
        var total = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                total += parseInt(this.newAddRow[i].Qty);
            }
        }
        return total;
    }

    private TotalAmount() {
        var totalamt = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                totalamt += parseInt(this.newAddRow[i].Amount);
            }
        }
        return totalamt;
    }

    //Delete Row 
    private DeleteRow(val, DcDelid) {
        if (DcDelid != "" || DcDelid != undefined) {
            this.dcServies.deleteDcMaster({
                "DCNo": 0,
                "DCDetelId": DcDelid,
                "CmpCode": "Mtech",
                "FY": 5,
                "UserCode": "Admin",
                "Flag": ""
            }).subscribe(data => {
                var dataset = JSON.parse(data.data);
                $("#foot_custname").focus();
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        }
        var index = -1;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === val) {
                index = i;
                // this.QtyCount -= parseInt(this.newAddRow[i].Qty);
                // $scope.AmountCount -= this.newAddRow[i].amount;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.newAddRow.splice(index, 1);
    }

    private rowclick(val) {
        this.AddEdit = val;
        console.log(val);
    }
    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }

}