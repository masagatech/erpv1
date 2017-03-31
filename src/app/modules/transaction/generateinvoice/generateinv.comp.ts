import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service' /* add reference for view employee */
import { generateinvService } from "../../../_service/generateinvoice/generate-service";  //Service Add Refrence dcmaster-service.ts
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { CalendarComp } from '../../usercontrol/calendar';
import { ALSService } from '../../../_service/auditlock/als-service';
import { MessageService, messageType } from '../../../_service/messages/message-service';

declare var $: any;
@Component({
    templateUrl: 'generateinv.comp.html',
    providers: [generateinvService, CommonService, ALSService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})
export class generateInv implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable declare
    tableDetails: any;
    CustName: any;
    CustID: any = "";
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

    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;

    CustomerAutodata: any[];
    salesregister: any = "";



    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private InvServies: generateinvService,
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

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.actionButton.push(new ActionBtnProp("generate", "Generate", "save", true, true));
        this.actionButton.push(new ActionBtnProp("print", "Generate & Print", "print", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Generate Invoice");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            $(".Custcode input").focus();
        }, 0);
        var date = new Date();
        this.fromdatecal.setDate(date);
        this.todatecal.setDate(date);
        this.SettingStatus();
    }

    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Check Ledger Table 
    SettingStatus() {
        try {
            var that = this;
            that._autoservice.getisproceed({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "keyname": "sales_register",
                "flag1": "negative",
                "createdby": that.loginUser.login
            }).subscribe(isproc => {
                var returnval = isproc.data;
                that.salesregister = returnval[0].val;
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
        if (evt === "save") {

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ClearControl() {
        this.doclist = [];
        this.invoices = [];
    }

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

    //Selected Customer Id And Name
    CustomerSelect(event) {
        this.CustID = event.value;
        this.CustName = event.label;
    }

    //Get Invoice No
    getdocumentNo() {
        try {
            this.InvServies.getInvdocumentNo({
                "cmpid": this.loginUser.cmpid,
                "acid": this.CustID == "" ? 0 : this.CustID,
                "fy": this.loginUser.fy,
                "fromdate": this.fromdatecal.getDate(),
                "todate": this.todatecal.getDate(),
                "createdby": this.loginUser.login,
                "flag": 'docno',
                "typ": "order"
            }).subscribe(documentno => {
                var dataset = documentno.data;
                if (dataset[0].length > 0) {
                    this.doclist = dataset[0];
                }
                else {
                    this._msg.Show(messageType.error, "error", "Record Not Found");
                    this.doclist = [];
                    $(".Custcode").focus();
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
            this.InvServies.getInvdocumentNo({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": items.docno,
                "flag": '',
                "typ": "order"
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset.length > 0) {
                    var InvoicelocalNo = dataset[0];
                    this.invoices = [];
                    for (var i = 0; i < InvoicelocalNo.length; i++) {
                        var invoiceModel = { "header": {}, "details": [] };
                        invoiceModel.header = dataset[1].filter(a => a.subconfid === InvoicelocalNo[i].subconfid);
                        invoiceModel.details = dataset[2].filter(a => a.subconfid === InvoicelocalNo[i].subconfid);
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
                    "qty": item.docqty,
                    "typ": "order",
                    "rate": item.rate,
                    "dis": item.dis,
                    "tax": 10,
                    "amt": item.amount,
                    "status": "manual",
                    "createdby": this.loginUser.login,
                    "deldate": CustomerDetails[0].deldate,
                    "docdate": CustomerDetails[0].docdate,
                    "subdocid": CustomerDetails[0].subconfid,
                    "acid": CustomerDetails[0].acid,
                    "remark": CustomerDetails[0].remark,
                    "accode": CustomerDetails[0].custname.split(':')[0]
                })
            }
            console.log(param);
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
                "code": CustomerDetails[0].custcode,
                "actype": "ac",
                "fy": that.loginUser.fy,
                "module": "inv",
                "dramt": that.GrandTotal(tabledetails, taxlist),
                "cramt": 0,
                "narration": CustomerDetails[0].remark,
                "trndate": CustomerDetails[0].docdate,
                "createdby": that.loginUser.login
            })
            ledgerparam.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "code": that.salesregister,
                "actype": "sales",
                "fy": that.loginUser.fy,
                "module": that.salesregister,
                "cramt": that.GrandTotal(tabledetails, taxlist),
                "dramt": 0,
                "narration": CustomerDetails[0].remark,
                "trndate": CustomerDetails[0].docdate,
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
                    "inword": 0,
                    "outward": item.docqty,
                    "typ": "inv",
                    "fy": this.loginUser.fy,
                    "cmpid": this.loginUser.cmpid,
                    "createdby": this.loginUser.login,
                    "amt": item.amount,
                    "rem": item.remark,
                    "whid": CustomerDetails[0].whid,
                    "opedate": CustomerDetails[0].docdate,
                    "remark": CustomerDetails[0].remark
                })
            }
            return opestock;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    // Generate Invoice Button Click 
    private GenerateInvoice(tabledetails, CustomerDetails, taxlist) {
        var that = this;
        try {
            this.InvServies.GenerateInvoice({
                "generatedetails": that.paramjson(tabledetails, CustomerDetails),
                "docno": CustomerDetails[0].docno,
                "subdocid": CustomerDetails[0].subconfid,
                "ledgerparam": that.paramledger(tabledetails, CustomerDetails, taxlist),
                "openstockdetails": that.stockledger(tabledetails, CustomerDetails),
                "totaltax": that.SubtotalTotalTax(tabledetails, taxlist),
                "netamt": that.GrandTotal(tabledetails, taxlist),
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "ledgerflag": 'true',
                "stockflag": 'true'
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset[0].funsave_generateinvoice.maxid > 0) {
                    that._msg.Show(messageType.success, "success", dataset[0].funsave_generateinvoice.msg + ' : ' + dataset[0].funsave_generateinvoice.maxid)
                    var InvoicelocalNo = dataset.Table;
                    that.invoices = [];
                    that.getdocumentNo();
                }
                else {
                    console.log(dataset);
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });
            // console.log(xmldata);
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