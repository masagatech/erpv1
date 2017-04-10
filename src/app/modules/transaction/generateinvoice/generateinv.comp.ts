import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
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
declare var commonfun: any;
@Component({
    templateUrl: 'generateinv.comp.html',
    providers: [generateinvService, CommonService, ALSService],
    styles: [`
        .ui-steps .ui-steps-item {
            width: 25%;
        }
        
        .ui-steps.steps-custom {
            margin-bottom: 30px;
        }
         
        .ui-steps.steps-custom .ui-steps-item .ui-menuitem-link {
        }
      
         
        .ui-steps.steps-custom .ui-steps-item .ui-steps-number {
            background-color: #0081c2;
            color: #FFFFFF;
            display: inline-block;
            width: 36px;
            border-radius: 50%;
            margin-top: -14px;
            margin-bottom: 10px;
        }
          .ui-steps-number{
              display:none!important;
          }
        
        .ui-steps.steps-custom .ui-steps-item .ui-steps-title {
            color: #FFFFFF;
        }
    `],
    encapsulation: ViewEncapsulation.None                  //Provides Add Service dcmaster-service.ts
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
    subinvoicesItems: any[];
    activeIndex: number = 1;
    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;

    CustomerAutodata: any[];
    salesregister: any = "";
    private totals: any = {
        grstotl: 0,
        nettotl: 0,
        taxtotal: 0,
    }



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

    incoiceclick(inv) {
        this.subinvoicesItems.filter(a => a.active == true)[0].active = false;
        inv.active = true;
        this.subDocDetail(inv);

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
        this.setActionButtons.hideSideMenu();
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
        this.subinvoicesItems = [];
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
             commonfun.loader('.lodingdoc')
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
                 commonfun.loaderhide('.lodingdoc')
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
         commonfun.loaderhide('.lodingdoc')
    }

    //Sub Document No Click Event 
    subDocDetail(subdoc) {
        try {
             commonfun.loader('.customerdetail')
            this.InvServies.getInvdocumentNo({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": subdoc.subdocid,
                "flag": '',
                "typ": "order"
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset.length > 0) {
                    // var InvoicelocalNo = dataset[0];
                    //   this.subinvoicesItems = InvoicelocalNo === null ? [] : InvoicelocalNo;
                    this.invoices = [];
                    //    for (var i = 0; i < InvoicelocalNo.length; i++) {
                    var invoiceModel = { "header": {}, "details": [] };
                    invoiceModel.header = dataset[1].filter(a => a.subdocid === subdoc.subdocid);
                    invoiceModel.details = dataset[2].filter(a => a.subdocid === subdoc.subdocid);
                    this.taxlist = invoiceModel.header[0].taxdetail == null ? [] : invoiceModel.header[0].taxdetail;
                    if (this.taxlist.length == 0) {
                        this.taxlist.push({
                            "taxname": "No Tax",
                            "taxval": 0
                        })
                    }
                    this.invoices.push(invoiceModel);
                    this.SubtotalTax(invoiceModel.details, invoiceModel.header);
                    // }
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
                commonfun.loaderhide('.customerdetail')
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
        commonfun.loaderhide('.customerdetail')
    }

    //Document No Click Get Details
    getInvDetails(items) {
        try {

            commonfun.loader('.lodingsub')
            this.subinvoicesItems = [];
            this.invoices = [];
            this.InvServies.getInvdocumentNo({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": items.autoid,
                "flag": 'subdocid',
                "typ": "order"
            }).subscribe(details => {
                var dataset = details.data;
                if (dataset.length > 0) {
                    var InvoicelocalNo = dataset[0];
                    this.subinvoicesItems = InvoicelocalNo === null ? [] : InvoicelocalNo;
                    // this.invoices = [];
                    // for (var i = 0; i < InvoicelocalNo.length; i++) {
                    //     var invoiceModel = { "header": {}, "details": [] };
                    //     invoiceModel.header = dataset[1].filter(a => a.subconfid === InvoicelocalNo[i].subconfid);
                    //     invoiceModel.details = dataset[2].filter(a => a.subconfid === InvoicelocalNo[i].subconfid);
                    //     this.taxlist = invoiceModel.header[0].taxdetail == null ? [] : invoiceModel.header[0].taxdetail;
                    //     if (this.taxlist.length == 0) {
                    //         this.taxlist.push({
                    //             "taxname": "No Tax",
                    //             "taxval": 0
                    //         })
                    //     }
                    //     this.invoices.push(invoiceModel);
                    //      this.SubtotalTax(invoiceModel.details, invoiceModel.header);
                    // }
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
                commonfun.loaderhide('.lodingsub');
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
        commonfun.loaderhide('.lodingsub');
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
    // private Subtotal(details) {
    //     var total = 0;
    //     for (var i = 0; i < details.length; i++) {
    //         total += parseInt(details[i].amount);
    //     }
    //     return total;
    // }

    //Sub  Total With Tax 
    // private SubtotalTax(details, taxval) {
    //     try {
    //         var totalTax = 0;
    //         for (var i = 0; i < details.length; i++) {
    //             totalTax += parseInt(details[i].amount);
    //         }
    //         return Math.round(totalTax * taxval / 100);
    //     } catch (e) {
    //         this._msg.Show(messageType.error, "error", e.message);
    //     }
    // }

    //Total Tax Save
    // private SubtotalTotalTax(details, header) {
    //     try {
    //         debugger
    //         var amount = 0;
    //         var taxval = 0;
    //         for (var i = 0; i < details.length; i++) {
    //             amount += parseInt(details[i].amount);
    //         }
    //         if (header[0].taxdetail.length > 0) {
    //             for (var i = 0; i < header[0].taxdetail.length; i++) {
    //                 if (header[0].taxdetail[i].puramt === '%') {
    //                     taxval += amount * parseFloat(header[0].taxdetail[i].taxval) / 100;
    //                 }
    //                 else {
    //                     taxval = amount + parseFloat(header[0].taxdetail[i].taxval);
    //                 }
    //                 header[0].taxdetail[i].amt = taxval
    //             }
    //             return header[0].taxdetail[i].amt;
    //         }
    //     } catch (e) {
    //         this._msg.Show(messageType.error, "error", e.message);
    //     }
    // }

    private SubtotalTax(details, header) {
        var _grossAmt = 0, _netAmt = 0, _taxamt = 0;
        this.totals.grstotl = 0;
        this.totals.nettotl = 0;
        this.totals.taxtotal = 0;

        for (var i = 0; i < details.length; i++) {
            _grossAmt += parseFloat(details[i].amount);
        }
        this.totals.grstotl = _grossAmt;
        this.totals.nettotl = _grossAmt;

        for (var i = 0; i < header[0].taxdetail.length; i++) {
            let item = header[0].taxdetail[i];
            if (item.puramt === '%') {
                _taxamt = _grossAmt * parseFloat(item.taxval) / 100;
            }
            else {
                _taxamt = parseFloat(item.taxval);
            }
            header[0].taxdetail[i].amt = _taxamt;
            this.totals.taxtotal += header[0].taxdetail[i].amt;
            this.totals.nettotl += _taxamt;
        }
    }

    //Grand Total
    private GrandTotal() {
        try {
            // var taxvalue = 0;
            // if (header.length > 0) {
            //     for (var i = 0; i < header[0].length; i++) {
            //         taxvalue += parseInt(header[i].taxval);
            //     }
            // }
            return Math.round(this.totals.grstotl + this.totals.taxtotal);
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
                    "ordauto": item.ordauto,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "itemid": item.itemid,
                    "itemcode": item.itemcode,
                    "itemname": item.itemname,
                    "qty": item.docqty,
                    "typ": "order",
                    "rate": item.rate,
                    "taxdetail": this.taxlist,
                    "dis": item.dis,
                    "amt": item.amount,
                    "status": "manual",
                    "createdby": this.loginUser.login,
                    "deldate": CustomerDetails[0].deldate,
                    "docdate": CustomerDetails[0].docdate,
                    "subdocid": CustomerDetails[0].subdocid,
                    "acid": CustomerDetails[0].acid,
                    "remark": CustomerDetails[0].remark,
                    "accode": CustomerDetails[0].custcode
                })
            }
            return param;

        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Ledger Paramter
    paramledger(tabledetails, CustomerDetails) {
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
                "dramt": this.totals.grstotl + this.totals.taxtotal,
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
                "cramt": this.totals.grstotl + this.totals.taxtotal,
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
        debugger;
        try {
            this.InvServies.GenerateInvoice({
                "generatedetails": that.paramjson(tabledetails, CustomerDetails),
                "docno": CustomerDetails[0].docno,
                "ordauto": CustomerDetails[0].ordauto,
                "subdocid": CustomerDetails[0].subconfid,
                "ledgerparam": that.paramledger(tabledetails, CustomerDetails),
                "openstockdetails": that.stockledger(tabledetails, CustomerDetails),
                "totaltax": this.totals.taxtotal,
                "netamt": this.totals.grstotl + this.totals.taxtotal,
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