import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { dcmasterService } from "../../../../_service/dcmaster/add/dcmaster-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable, AutoCompleteModule } from 'primeng/primeng';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { ALSService } from '../../../../_service/auditlock/als-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'aded.comp.html',
    providers: [dcmasterService, CommonService, ALSService]
    //,AutoService
})

export class dcADDEdit implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Veriable Local
    getCustomerAuto: any;
    custKey: any;
    CustAddress: any;
    Traspoter: any = 0;
    Token: any = "";
    salesid: any = 0;
    Salesmandrop: any;
    DirectInvoice: any = 0;
    Duplicateflag: boolean;
    Remark: any = "";
    Remark1: any = "";
    Remark2: any = "";
    Remark3: any = [];
    DocNo: any = 0;

    //Declare Array Veriable
    Salesmanlist: any = [];                                   // Salesman Static veriable for dropdown
    Transpoterlist: any = [];                                 // Trapoter Static veriable for dropdown
    CustfilteredList: any = [];
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    selected: any = [];
    rateslist: any = [];
    newrate: any = "";

    //Declare Table Veriable
    autoid: number = 0;
    DCDetelId: any;
    dis: any = 0;
    Rate: any = 0;
    amount: any = 0;
    qty: any = 0;
    totalqty: any = 0;
    Total: any = 0;
    disTotal: any = 0;
    counter: any;
    Prod: any = 0;
    totalAmt: any = 0;
    CustID: any = 0;
    CustName: any = '';
    itemsname: any = '';
    itemsid: any = 0;
    ProdSelectedCode: any = '';
    NewItemsName: any = "";
    NewItemsid: any = 0;
    AddEdit: any = '';
    footer: any;
    wareid: number = 0;
    private subscribeParameters: any;

    //Customer Selected
    addresslist: any = [];
    disattrlist: any = [];
    itemslist: any = [];
    warehouselist: any = [];
    daylist: any = [];
    whdetailslist: any = [];

    //File Upload
    suppdoc: any = [];
    module: string = "";
    uploadedFiles: any = [];
    isconfirm: boolean;
    isinvoice: boolean;
    issaleord: boolean;
    typ: any = "";

    CustomerAutodata: any[];
    ItemAutodata: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("docdatecal")
    docdatecal: CalendarComp;

    @ViewChild("deldatecal")
    deldatecal: CalendarComp;

    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private SalesOrderServies: dcmasterService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _userService: UserService,
        private _msg: MessageService, private _alsservice: ALSService) {
        this.newAddRow = [];
        this.counter = 0;
        this.totalqty = 0;
        this.totalAmt = 0;
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "so", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.docdatecal.setMinMaxDate(new Date(lockdate), null);
            that.deldatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.docdatecal.initialize(this.loginUser);
        this.docdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.deldatecal.initialize(this.loginUser);
        this.deldatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        var ddlSaveBtns = [];
        ddlSaveBtns.push(new ActionBtnProp("save", "Save", "save", true, false));
        ddlSaveBtns.push(new ActionBtnProp("saveasdrft", "Save as Draft", "save", true, false));


        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false, ddlSaveBtns));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Sales Order");
        this.setActionButtons.hideSideMenu();
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.footer = true;
        setTimeout(function () {
            $('#CustName input').focus();
            commonfun.addrequire();
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
                var date = new Date();
                this.docdatecal.setDate(date);
                this.deldatecal.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });

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
                "keyname": "is_confirm_salesorder",
                "negative": "is_invoice_salesorder",
                "salesord": "is_so_stock",
                "flag1": "negative",
                "createdby": that.loginUser.login
            }).subscribe(isproc => {
                var returnval = isproc.data;
                that.isinvoice = returnval[0].navigat;
                that.isconfirm = returnval[0].val;
                that.issaleord = returnval[0].salesord;
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Clear All Controll
    private ClearControll() {
        this.CustName = "";
        this.CustID = 0;
        this.Salesmandrop = "";
        this.Traspoter = "";
        this.Token = "";
        this.Remark1 = "";
        this.Remark2 = "";
        this.salesid = 0;
        this.Salesmanlist = [];
        this.wareid = 0;
        this.warehouselist = [];
        this.Transpoterlist = [];
        this.Traspoter = 0;
        this.newAddRow = [];
        this.addresslist = [];
        $('#CustName input').focus();
    }



    salesorderdetailsjson() {
        try {
            var jsonparam = [];
            for (let item of this.newAddRow) {
                var rate = item.rateslist.filter(itemval => itemval.id == item.id)
                jsonparam.push({
                    "autoid": item.autoid,
                    "itemsid": item.itemsid,
                    "qty": item.qty,
                    "rate": rate[0].val,
                    "rateid": rate[0].id,
                    "dis": item.dis,
                    "typ": "order",
                    "amount": item.amount
                })
            }
            return jsonparam;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Auto Confirm Sales Order Confirm 
    confirmparam() {
        try {
            var confparam = {
                "autoid": 0,
                "fy": this.loginUser.fy,
                "cmpid": this.loginUser.cmpid,
                "createdby": this.loginUser.login,
                "confimstatus": "auto confirm",
                "autoconfirm": this.isconfirm
            }
            return confparam;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Salesorder Invoice Paramter
    paramterjson() {
        var that = this;
        try {
            var param = {
                "docno": that.DocNo,
                "docdate": that.docdatecal.getDate(),
                "acid": that.CustID,
                "refno": that.Token,
                "deldate": that.deldatecal.getDate(),
                "salesid": that.salesid,
                "whid": that.wareid,
                "traspo": that.Traspoter,
                "status": "",
                "typ": "order",
                "fy": that.loginUser.fy,
                "cmpid": that.loginUser.cmpid,
                "createdby": that.loginUser.login,
                "remark": that.Remark,
                "directinvoice": that.DirectInvoice,
                "dcdetails": that.salesorderdetailsjson(),
                "autoconfirm": that.isconfirm,
                "autoinvoice": that.isinvoice,
                "confirmparam": that.confirmparam(),
                "remark1": that.Remark1,
                "remark2": that.Remark2,
                "remark3": that.Remark3
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }
        return param;
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        this.DirectInvoice = 0;
        if (evt === "clear") {
            this.ClearControll();
        }
        if (evt === "back") {
            this._router.navigate(['transaction/dcmaster']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.newAddRow.length == 0) {
                this._msg.Show(messageType.error, "error", "Please enter items detail");
                return false;
            }
            try {
                this.SalesOrderServies.saveDcMaster(
                    this.paramterjson()
                ).subscribe(result => {
                    var returndata = result.data;
                    if (returndata[0].funsave_salesorder.maxid > 0) {
                        this._msg.Show(messageType.success, "success", returndata[0].funsave_salesorder.msg + ' : ' + returndata[0].funsave_salesorder.maxid)
                        this.ClearControll();
                        $('.custname').focus();
                    }
                    else {
                        console.log(returndata);
                    }
                }, err => {
                    console.log(err);
                }, () => {
                    //console.log("Done");
                })
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
                return;
            }

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "saveasdrft") {
            alert("save as draft");
            // this.SalesOrderServies.deleteDcMaster({
            //     "DCNo": this.DocNo,
            //     "DCDetelId": 0,
            //     "CmpCode": "Mtech",
            //     "FY": 5,
            //     "UserCode": "Admin",
            //     "Flag": "DC"
            // }).subscribe(data => {
            //     var dataset = data.data;
            //     if (dataset.Table[0].doc > 0) {
            //         alert('Delete Data Successfully Document :' + dataset.Table[0].doc)
            //         this.ClearControll();
            //         $('input').removeAttr('disabled');
            //         $('select').removeAttr('disabled');
            //         $('textarea').removeAttr('disabled');
            //         this.actionButton.find(a => a.id === "save").hide = false;
            //         this.actionButton.find(a => a.id === "save").hide = false;
            //         $('.custname').focus();
            //     }
            //     else {
            //         console.log(dataset.Table[0].status)
            //     }
            // }, err => {
            //     console.log("Error");
            // }, () => {
            //     // console.log("Complete");
            // })
        }
    }

    //Edit Salesoder
    GetEditData(Docno) {
        try {
            this.SalesOrderServies.GetSalesOrderView({
                "flag": "edit",
                "docno": Docno,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(data => {
                var dataset = data.data;
                var CustomerMaster = dataset[0];
                if (CustomerMaster.length > 0) {
                    this.CustomerSelected(CustomerMaster[0].acid, CustomerMaster[0].acname.split(':')[0]);
                    this.CustName = CustomerMaster[0].acname;
                    this.CustID = CustomerMaster[0].acid;
                    this.Remark = CustomerMaster[0].remark;
                    this.salesid = CustomerMaster[0].salesid;
                    this.docdatecal.setDate(new Date(CustomerMaster[0].docdate));
                    this.deldatecal.setDate(new Date(CustomerMaster[0].deldate));
                    this.wareid = CustomerMaster[0].whid;
                    this.Traspoter = CustomerMaster[0].transid;
                    this.newAddRow = dataset[1];
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //AutoCompletd Customer  Nodes ### Item Group Get Document No
    CustomerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "customer",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query,
                "typ": ""
            }).then(data => {
                this.CustomerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Customer
    CustomerSelect(event) {
        try {
            this.CustID = event.value;
            this.CustName = event.label;
            this.CustomerSelected(this.CustID, this.CustName.split(':')[0]);
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    ItemAuto(event) {
        var flag = event.query.charAt(0);
        let query = flag=='@' ? event.query.substr(1,event.query.length-1):event.query;
        if(query=='') return;
        this._autoservice.getAutoDataGET({
            "type": "productwithwh",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "whid": this.wareid,
            "search": query,
            "flag": flag === "@" ? "combo" :""
        }).then(data => {
            this.ItemAutodata = data;
        });
    }

    //Selected Inline Item Selected
    ItemSelect(event, arg) {
        var that = this;
        if (arg === 1) {
            that.itemsname = event.label;
            that.itemsid = event.value;
            that.typ = event.typ;
            that.ItemsSelected(that.itemsid, arg, that.itemsname, that.typ)
        } else {
            that.NewItemsid = event.value;
            that.NewItemsName = event.label;
            that.typ = event.typ;
            that.ItemsSelected(that.NewItemsid, arg, that.NewItemsName, that.typ)
        }
    }

    // //AutoCompletd Product Name
    // getAutoCompleteProd(me: any, arg: number) {
    //     var _me = this;
    //     try {
    //         var duplicateitem = true;
    //         this._autoservice.getAutoData({
    //             "type": "productwithwh",
    //             "whid": this.wareid,
    //             "search": arg == 0 ? me.NewItemsName : me.itemsname,
    //             "cmpid": this.loginUser.cmpid,
    //             "fy": this.loginUser.fy,
    //             "createdby": this.loginUser.login
    //         }).subscribe(data => {
    //             $(".ProdName").autocomplete({
    //                 source: data.data,
    //                 width: 300,
    //                 max: 20,
    //                 delay: 100,
    //                 minLength: 0,
    //                 autoFocus: true,
    //                 cacheLength: 1,
    //                 scroll: true,
    //                 highlight: false,
    //                 select: function (event, ui) {
    //                     me.itemsname = ui.item.label;
    //                     me.typ = ui.item.typ;
    //                     if (_me.newAddRow.length > 0) {
    //                         for (let item of _me.newAddRow) {
    //                             if (item.itemsname == me.itemsname) {
    //                                 duplicateitem = false;
    //                                 break;
    //                             }
    //                         }
    //                     }
    //                     if (duplicateitem === true) {
    //                         if (arg === 1) {
    //                             me.itemsname = ui.item.label;
    //                             me.itemsid = ui.item.value;
    //                             me.typ = ui.item.typ;
    //                             _me.ItemsSelected(me.itemsid, arg, me.counter, me.typ);
    //                         } else {
    //                             me.NewItemsName = ui.item.label;
    //                             me.itemsid = ui.item.value;
    //                             _me.ItemsSelected(me.itemsid, arg, me.counter, me.typ);
    //                         }
    //                     }
    //                     else {
    //                         _me._msg.Show(messageType.info, "info", "Duplicate item");
    //                         return;
    //                     }

    //                 }
    //             });
    //         }, err => {
    //             console.log("Error");
    //         }, () => {
    //         })
    //     } catch (e) {
    //         this._msg.Show(messageType.error, "error", e.message);
    //         return;
    //     }

    // }

    // //Selected Customer  Event
    CustomerSelected(custid, custcode) {
        var that = this;
        try {
            if (custcode != "") {
                that.addresslist = [];
                that.warehouselist = [];
                that.Transpoterlist = [];
                that.custKey = custid;
                that.SalesOrderServies.getdcdetails({
                    "acid": custid,
                    "accode": custcode,
                    "cmpid": that.loginUser.cmpid,
                    "fy": that.loginUser.fy,
                    "createdby": that.loginUser.login,
                    "flag": '',
                    "flag1": ''
                }).subscribe(details => {
                    var dataset = details.data;
                    that.addresslist = dataset[0]._address === null ? [] : dataset[0]._address;
                    that.warehouselist = dataset[0]._warehouse === null ? [] : dataset[0]._warehouse;
                    that.Transpoterlist = dataset[0]._transpoter === null ? [] : dataset[0]._transpoter;
                    that.Salesmanlist = dataset[0]._salesman === null ? [] : dataset[0]._salesman;
                    that.daylist = dataset[0]._days === null ? [] : dataset[0]._days;
                }, err => {
                    console.log('Error');
                }, () => {
                    // console.log('Complet');
                });
                that.CustfilteredList = [];
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }
    }

    //Rate Change Event
    ratechange(qty: any, newrate: any = [], dis: any, row: any = [], agr: number) {
        try {
            var amt = 0;
            var disTotal = 0;
            if (agr == 0) {
                if (qty != "0" && newrate != "") {
                    var rate = this.rateslist.filter(item => item.id == newrate);
                    amt = +qty * +rate[0].val;
                    disTotal = amt * this.dis / 100;
                    this.amount = Math.round(amt - disTotal);
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

    // //Selected Items
    ItemsSelected(val: number, falg: number, itemname: any, typ: any) {
        var that = this;
        console.log(that.wareid);
        try {
            if (val != 0) {
                this.SalesOrderServies.getItemsAutoCompleted({
                    "cmpid": that.loginUser.cmpid,
                    "fy": that.loginUser.fy,
                    "itemsid": val,
                    "whid": that.wareid,
                    "status": that.issaleord,
                    "createdby": that.loginUser.login,
                    "flag": typ === "combo" ? "combo" : typ
                }).subscribe(itemsdata => {
                    var ItemsResult = itemsdata.data;
                    if (ItemsResult.length > 0) {
                        if (falg === 0) {
                            if (typ === "combo") {
                                for (let item of ItemsResult)
                                    this.newAddRow.push({
                                        "autoid": item.autoid,
                                        'itemsname': item.itemsname,
                                        "itemsid": item.itemsid,
                                        'qty': item.qty,
                                        'rateslist': item.rates,
                                        'id': item.newrate,
                                        'dis': item.dis == "" ? "0" : item.dis,
                                        'amount': item.amount,
                                        'counter': this.counter
                                    });
                            }
                            else {
                                that.qty = 0;
                                that.totalqty = ItemsResult[0].qty;
                                that.dis = ItemsResult[0].dis;
                                that.rateslist = ItemsResult[0].rates;
                            }

                        }
                        else {
                            for (let item of that.newAddRow) {
                                if (item.itemsname == itemname) {
                                    item.itemsid = val;
                                    item.qty = 0;
                                    item.rateslist = ItemsResult[0].rates;
                                    item.id = "";
                                    item.dis = ItemsResult[0].dis;
                                    item.amount = 0;
                                    break;
                                }
                            }
                        }
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    //console.log("Done");
                });
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }
    }

    //Add New Row
    private NewRowAdd() {
        try {
            if (this.wareid === 0) {
                this._msg.Show(messageType.error, "error", "Please Select Warehouse");
                return;
            }
            if (this.NewItemsName == '' || this.NewItemsName == undefined) {
                this._msg.Show(messageType.error, "error", "Please Enter items Name");
                return;
            }
            if (this.qty == '' || this.qty == undefined) {
                this._msg.Show(messageType.error, "error", "Please Enter Quntity");
                return;
            }
            if (this.dis > 100) {
                this._msg.Show(messageType.error, "error", "Please Valid discount");
                return;
            }
            this.Duplicateflag = true;
            for (var i = 0; i < this.newAddRow.length; i++) {
                if (this.newAddRow[i].itemsname == this.NewItemsName) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.newAddRow.push({
                    "autoid": this.autoid,
                    'itemsname': this.NewItemsName,
                    "itemsid": this.NewItemsid,
                    'qty': this.qty,
                    'rateslist': this.rateslist,
                    'id': this.newrate,
                    'dis': this.dis == "" ? "0" : this.dis,
                    'amount': this.amount,
                    'counter': this.counter
                });

                this.counter++;
                this.itemsname = "";
                this.NewItemsName = "";
                this.NewItemsid = 0;
                this.rateslist = [];
                this.newrate = "";
                this.qty = "";
                this.totalqty = 0;
                this.Rate = "";
                this.dis = 0;
                this.amount = "";
                $(".ProdName").focus();
            }
            else {
                this._msg.Show(messageType.error, "error", "Duplicate Item");
                return;
            }
        }
        catch (e) {
            this._msg.Show(messageType.error, "error", e);
        }

    }

    //Quntity Calculation
    private ConfirmQty(Qty) {
        this.Total = this.qty * this.Rate;
        this.disTotal = this.Total * this.dis / 100;
        this.amount = Math.round(this.Total - this.disTotal);
    }

    //Edit Row Quntity Calculation
    private ConfirmQtyEdit(counter, qty) {
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === this.AddEdit) {
                this.Total = qty * this.newAddRow[i].Rate;
                this.disTotal = this.Total * this.newAddRow[i].dis / 100;
                this.newAddRow[i].amount = Math.round(this.Total - this.disTotal);
                break;
            }
        }

    }

    private TotalQty() {
        var total = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                total += parseInt(this.newAddRow[i].qty);
            }
        }
        return total;
    }

    private Totalamount() {
        var totalamt = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                totalamt += parseInt(this.newAddRow[i].amount);
            }
        }
        return totalamt;
    }

    //Delete Row 
    private DeleteRow(val, DcDelid) {
        if (DcDelid != "" || DcDelid != undefined) {
            this.SalesOrderServies.deleteDcMaster({
                "DCNo": 0,
                "DCDetelId": DcDelid,
                "FY": this.loginUser.fy,
                "cmpid": this.loginUser.cmpid,
                "UserCode": this.loginUser.login,
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
                // $scope.amountCount -= this.newAddRow[i].amount;
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