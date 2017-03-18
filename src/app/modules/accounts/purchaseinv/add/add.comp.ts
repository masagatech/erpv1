import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { PurchaseService } from "../../../../_service/purchaseinv/purchase-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { CalendarComp } from '../../../usercontrol/calendar';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [PurchaseService, CommonService, ALSService]
    //,AutoService
})
export class purchaseInvadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable declare
    suppname: any;
    suppid: any = "";
    doclist: any[];
    invoiceModel: any = { "header": {}, "details": [] }
    invoices: any = [];
    invoiceNo: any[];
    Headerlist: any[];
    InvoiceDetails: any[];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Paramter Json
    ledgerparam: any = [];
    param: any = [];
    stockparam: any = [];
    taxval: any = 0;
    taxlist: any = [];
    buttonitems: any = [];

    SupplierAutodata: any = [];

    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;

    purchase_ledger: any = "";
    purchase_stock: any = "";
    salesregister: any = "";



    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private InvServies: PurchaseService,
        private _autoservice: CommonService, private _userService: UserService,
        private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    //Date 
    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "so", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.fromdatecal.setMinMaxDate(new Date(lockdate), null);
            that.todatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.fromdatecal.initialize(this.loginUser);
        this.fromdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todatecal.initialize(this.loginUser);
        this.todatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.actionButton.push(new ActionBtnProp("generate", "Generate", "save", true, true));
        this.actionButton.push(new ActionBtnProp("print", "Generate & Print", "print", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Purchase Invoice");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        // this.tableDetails = true;

        var date = new Date();
        this.fromdatecal.setDate(date);
        this.todatecal.setDate(date);
        this.SettingStatus();
    }

    //Supplier Selected
    SupplierSelect(event) {
        try {
            this.suppid = event.value;
            this.suppname = event.label;
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

    loadRBIGrid(event: LazyLoadEvent) {
    }

    ClearControl() {
        this.doclist = [];
        this.invoices = [];
    }



    // //Check Ledger Table 
    SettingStatus() {
        try {
            var that = this;
            that._autoservice.getisproceed({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "keyname": "is_purchase_ledger",
                "negative": "is_purchase_stock",
                "salesord": "sales_register",
                "flag1": "negative",
                "createdby": that.loginUser.login
            }).subscribe(isproc => {
                var returnval = isproc.data;
                that.purchase_ledger = returnval[0].val;
                that.purchase_stock = returnval[0].navigat;
                that.salesregister = returnval[0].salesord;
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons
    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControl();
        }
        else if (evt === "back") {
            this._router.navigate(['/accounts/purchaseinv']);
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

    //Get Invoice No
    getdocumentNo(msgflag) {
        try {
            this.InvServies.getdocumentno({
                "cmpid": this.loginUser.cmpid,
                "sup": this.suppid == "" ? 0 : this.suppid,
                "fy": this.loginUser.fy,
                "fromdate": this.fromdatecal.getDate(),
                "todate": this.todatecal.getDate(),
                "createdby": this.loginUser.login,
                "flag": "docno"
            }).subscribe(documentno => {
                debugger;
                var dataset = documentno.data;
                if (dataset[0].length > 0) {
                    this.doclist = dataset[0];
                }
                else {
                    if (msgflag == undefined) {
                        this._msg.Show(messageType.error, "error", "Record Not Found");
                        this.doclist = [];
                        $(".SupplierName input").focus();
                    }
                    this.doclist = [];
                    $(".SupplierName input").focus();
                }
            }, err => {
                console.log('Error');
            }, () => {
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Document No Click Get Details
    getInvDetails(items) {

        this.buttonitems = [
            {
                label: ' Generate + Print', icon: 'fa-print', command: () => {
                    //this.update();
                }
            },
            {
                label: ' Generate + Email', icon: 'fa-envelope', command: () => {
                    // this.delete();
                }
            },
            // {label: 'Angular.io', icon: 'fa-link', url: 'http://angular.io'},
            // {label: 'Theming', icon: 'fa-paint-brush', routerLink: ['/theming']}
        ];

        try {
            this.InvServies.getdocumentno({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": items.docno
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset.length > 0) {
                    var InvoicelocalNo = dataset[0];
                    this.invoices = [];
                    for (var i = 0; i < InvoicelocalNo.length; i++) {
                        var invoiceModel = { "header": {}, "details": [] };
                        invoiceModel.header = dataset[1].filter(a => a.subdoc === InvoicelocalNo[i].subdoc);
                        invoiceModel.details = dataset[2].filter(a => a.subdoc === InvoicelocalNo[i].subdoc);
                        this.taxlist = invoiceModel.header[0]._tax == null ? [] : invoiceModel.header[0]._tax;
                        if (this.taxlist.length == 0) {
                            this.taxlist.push({
                                "taxname": "No Tax",
                                "taxval": 0
                            })
                        }
                        this.invoices.push(invoiceModel);
                    }
                }
                else {
                    this._msg.Show(messageType.error, "error", "Record not found");
                    return;
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Quntity Calculation
    private CulculateQty(items, rowdetails) {
        try {
            var QtyRate = 0;
            var DisAmt = 0;
            if (items.DCQty != "" && items.DCQty != "0") {
                if (items.OldQty < items.DCQty) {
                    alert('Please enter valid quntity');
                    for (var i = 0; i < rowdetails.length; i++) {
                        if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                            rowdetails[i].DCQty = items.OldQty;
                            QtyRate = items[i].DCQty * items[i].Rate;
                            DisAmt = QtyRate * items[i].Disount / 100;
                            rowdetails[i].Amount = Math.round(QtyRate - DisAmt);
                            break;
                        }
                    }

                }
                else {
                    for (var i = 0; i < rowdetails.length; i++) {
                        if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                            QtyRate = rowdetails[i].DCQty * rowdetails[i].Rate;
                            DisAmt = QtyRate * rowdetails[i].Disount / 100;
                            rowdetails[i].Amount = Math.round(QtyRate - DisAmt);
                            break;
                        }
                    }
                }
            }
            for (var i = 0; i < rowdetails.length; i++) {
                if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                    items.DCQty = items.OldQty;
                    DisAmt = QtyRate * items.Disount / 100;
                    items.Amount = Math.round(QtyRate - DisAmt);
                    break;
                }
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Sub  Total 
    private Subtotal(details) {
        var total = 0;
        for (var i = 0; i < details.length; i++) {
            total += parseInt(details[i].amount);
        }
        return total;
    }

    //Sub  Total With Tax 
    private SubtotalTax(details, taxval) {
        try {
            var totalTax = 0;
            for (var i = 0; i < details.length; i++) {
                totalTax += parseInt(details[i].amount);
            }
            return Math.round(totalTax * taxval / 100);
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Total Tax Save
    private SubtotalTotalTax(details, taxlist) {
        try {
            var amount = 0;
            var taxval = 0;
            for (var i = 0; i < details.length; i++) {
                amount += parseInt(details[i].amount);
            }
            if (taxlist.length > 0) {
                for (var i = 0; i < taxlist.length; i++) {
                    taxval += parseInt(taxlist[i].taxval);
                }
                return Math.round(amount * taxval / 100);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Grand Total
    private GrandTotal(details, taxlist) {
        try {
            var taxvalue = 0;
            if (taxlist.length > 0) {
                for (var i = 0; i < taxlist.length; i++) {
                    taxvalue += parseInt(taxlist[i].taxval);
                }
            }
            return Math.round(this.Subtotal(details) + this.SubtotalTax(details, taxvalue));
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Create Paramter Invoice Table
    paramjson(tabledetails: any = [], CustomerDetails: any = []) {
        try {
            var param = []
            for (let item of tabledetails) {
                param.push({
                    "autoid": 0,
                    "docno": item.docno,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "itemid": item.itemid,
                    "itemcode": item.itemcode,
                    "itemname": item.itemname,
                    "qty": item.qty,
                    "rate": item.rate,
                    "dis": item.dis,
                    "tax": 10,
                    "amt": item.amount,
                    "status": "manual",
                    "createdby": this.loginUser.login,
                    "docdate": CustomerDetails[0].purdate,
                    "subdocid": CustomerDetails[0].subdoc,
                    "acid": CustomerDetails[0].acid,
                    "accode": CustomerDetails[0].custname.split(':')[0],
                    "suppid": CustomerDetails[0].vid,
                    "supcode": CustomerDetails[0].suppname.split(':')[0]
                })
            }
            return param;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Ledger Paramter
    paramledger(tabledetails, CustomerDetails, taxlist) {
        try {
            var ledgerparam = [];
            var that = this;
            ledgerparam.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "acid": CustomerDetails[0].acid,
                "fy": that.loginUser.fy,
                "typ": "pur",
                "dramt": that.GrandTotal(tabledetails, taxlist),
                "cramt": 0,
                "nar": CustomerDetails[0].remark,
                "createdby": that.loginUser.login
            })
            ledgerparam.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "acid": that.salesregister,
                "fy": that.loginUser.fy,
                "typ": that.salesregister,
                "cramt": that.GrandTotal(tabledetails, taxlist),
                "dramt": 0,
                "nar": CustomerDetails[0].remark,
                "createdby": that.loginUser.login
            })
            return ledgerparam;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Stock Paramter
    stockledger(tabledetails, CustomerDetails) {
        try {
            var that = this;
            var opestock = [];
            for (let item of tabledetails) {
                opestock.push({
                    "autoid": 0,
                    "ledger": 0,
                    "itemid": item.itemid,
                    "rateid": item.rate,
                    "rate": item.rate,
                    "inword": item.qty,
                    "outward": 0,
                    "typ": "pur",
                    "fy": this.loginUser.fy,
                    "cmpid": this.loginUser.cmpid,
                    "createdby": this.loginUser.login,
                    "amt": item.amount,
                    "rem": item.remark,
                    "whid": 0,
                    "opedate": CustomerDetails[0].docdate,
                    "remark": CustomerDetails[0].remark
                })
            }
            return opestock;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    private GenerateInvoice(tabledetails, CustomerDetails, taxlist) {
        try {
            var that = this;
            this.InvServies.savePurchaseInv({
                "purchasedetails": that.paramjson(tabledetails, CustomerDetails),
                "docno": CustomerDetails[0].docno,
                "ledgerparam": that.paramledger(tabledetails, CustomerDetails, taxlist),
                "openstockdetails": that.stockledger(tabledetails, CustomerDetails),
                "totaltax": that.SubtotalTotalTax(tabledetails, taxlist),
                "netamt": that.GrandTotal(tabledetails, taxlist),
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "ledgerflag": that.purchase_ledger,
                "stockflag": that.purchase_stock
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset[0].funsave_purchaseinvoice.maxid > 0) {
                    that._msg.Show(messageType.success, "success", dataset[0].funsave_purchaseinvoice.msg + ' : ' + dataset[0].funsave_purchaseinvoice.maxid)
                    var InvoicelocalNo = dataset.Table;
                    that.invoices = [];
                    that.getdocumentNo(1);
                }
                else {
                    console.log(dataset);
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });

        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}