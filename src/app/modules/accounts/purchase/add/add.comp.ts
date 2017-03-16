import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { PurchaseaddService } from "../../../../_service/suppurchase/add/purchaseadd-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable, AutoCompleteModule } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [PurchaseaddService, CommonService, ALSService]                         //Provides Add Service dcmaster-service.ts
}) export class purchaseadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    PurOrId: any = 0;
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
    dis: any = 0;
    rate: any = 0;
    rateid: number = 0;
    amount: any = 0;
    qty: any = 0;
    Total: any = 0;
    DisTotal: any = 0;
    newAddRow: any = [];
    counter: any = 0;
    totalQty: any = 0;
    totalAmt: any = 0;
    SupplierTitle: any;
    Duplicateflag: boolean = true;
    Directinvoice: any = 0;
    rateslist: any = [];
    newrate: number = 0;
    private subscribeParameters: any;

    //Autoextender
    SupplierAutodata: any = [];
    CustomerAutodata: any = [];

    @ViewChild("docdatecal")
    docdatecal: CalendarComp;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //, private _autoservice:AutoService
    constructor(private _router: Router,private setActionButtons: SharedVariableService, private PurchaseServies: PurchaseaddService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "pur", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.docdatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.docdatecal.initialize(this.loginUser);
        this.docdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Purchase Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.newAddRow = [];
        this.counter = 0;
        this.totalQty = 0;
        this.totalAmt = 0;

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
                var date = new Date();
                this.docdatecal.setDate(date);

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
            this.docdatecal = returndata.Table[0].DocDate;
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
        this.SupplierID = 0;
        this.AccountName = "";
        this.AccountID = 0;
        this.Adr = "";
        this.Remark = "";
        this.newAddRow = [];
    }

    //Return To xml
    Paramdetail() {
        var param = [];
        for (let item of this.newAddRow) {
            var rate = item.rateslist.filter(rat => rat.id = item.id);
            param.push({
                "autoid": item.autoid,
                "itemid": item.Itemsid,
                "qty": item.qty,
                "rate": rate[0].val,
                "rateid": item.id,
                "dis": item.dis,
                "amt": item.amount,
                "totalamt": 0,
                "remark": "",
                "remark1": "",
                "remark2": "",
                "remark3": []
            })
        }
        return param;
    }
    //Return To Json
    ParamJson() {
        var Param = {
            "purorid": this.PurOrId,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "invno": this.InvNostr,
            "docdate": this.docdatecal.getDate(),
            "refno": this.OtherRef,
            "suppid": this.SupplierID,
            "acid": this.AccountID,
            "Directinvoice": this.Directinvoice,
            "adr": this.Adr,
            "remark": this.Remark,
            "purchasedetails": this.Paramdetail(),
            "Status": "Status",
            "createdby": this.loginUser.login,
            "remark1": "Remark1",
            "remark2": "Remark2",
            "remark3": "Remark3"
        }
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        this.Directinvoice = 1;
        if (evt === "back") {
            this._router.navigate(['/accounts/purchase']);
        }
        if (evt === "save") {
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
            this.PurchaseServies.SaveOP(
                this.ParamJson()
            ).subscribe(result => {
                var returndata = result.data;
                if (returndata[0].funsave_purchaseord.maxid > 0) {
                    this._msg.Show(messageType.success, "success", returndata[0].funsave_purchaseord.msg + ' : ' + returndata[0].funsave_purchaseord.maxid)
                    this.ClearControll();
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
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    private NewRowAdd() {
        if (this.ItemsName == '' || this.ItemsName == undefined) {
            alert('Please Enter items Name');
            return;
        }
        if (this.qty == '' || this.qty == undefined) {
            alert('Please Enter Quntity');
            return;
        }
        if (this.dis > 100) {
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
                "autoid": 0,
                'ItemsName': this.ItemsName,
                'Itemsid': this.Itemsid,
                'qty': this.qty,
                'rateslist': this.rateslist,
                'id': this.newrate,
                'dis': this.dis == "" ? "0" : this.dis,
                'amount': this.amount,
                'counter': this.counter
            });
            this.counter++;
            this.ItemsName = "";
            this.NewItemsName = "";
            this.qty = "";
            this.newrate = 0;
            this.rateslist = [];
            this.dis = "";
            this.amount = "";
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

    //AutoCompletd Customer
    CustomerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "customer",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.CustomerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Calculation Qty,Rate and dis  Change Event
    CalculationQty(qty: any, newrate: any = [], dis: any, row: any = [], agr: number) {
        try {
            debugger;
            var amt = 0;
            var disTotal = 0;
            if (agr == 0) {
                if (qty != "0" && newrate != "") {
                    var rate = row.rateslist.filter(item => item.id == newrate);
                    amt = +qty * +rate[0].val;
                    disTotal = amt * dis / 100;
                    return this.amount = Math.round(amt - disTotal);
                }
            }
            else {
                if (row.qty != "" && row.id != "") {
                    disTotal = 0;
                    amt = 0;
                    for (let item of this.newAddRow) {
                        if (item.counter == row.counter) {
                            var rate = item.rateslist.filter(itemval => itemval.id == row.id);
                            amt = +item.qty * +rate[0].val;
                            disTotal = amt * item.dis / 100;
                            item.amount = Math.round(amt - disTotal);
                            break;
                        }
                    }
                }
            }

        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;

        }
    }

    //Selected Customer
    CustomerSelect(event) {
        try {
            this.AccountID = event.value;
            this.AccountName = event.label;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Supplier Selected
    SupplierSelect(event) {
        try {
            this.SupplierID = event.value;
            this.SupplierName = event.label;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Supplier Auto Extender 
    SupplierAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "supplier",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.SupplierAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }


    ItemsSelected(Itemsid) {
        this.PurchaseServies.getitemsDetails({
            "itemsid": Itemsid,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "purchase",
            "createdby": this.loginUser.login
        }).subscribe(result => {
            var returndata = result.data;
            this.Itemsid = Itemsid;
            this.rateslist = returndata[0].rates;
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
                    me.ItemsName = ui.item.label;
                    if (arg === 1) {
                        me.ItemsName = ui.item.label;
                        me.Itemsid = ui.item.value;
                        that.ItemsSelected(me.Itemsid);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsid = ui.item.value;
                        that.ItemsSelected(me.NewItemsid);
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    private ConfirmQty(qty) {
        this.Total = this.qty * this.rate;
        this.DisTotal = this.Total * this.dis / 100;
        this.amount = Math.round(this.Total - this.DisTotal);
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
        this.setActionButtons.setTitle("");
    }
}