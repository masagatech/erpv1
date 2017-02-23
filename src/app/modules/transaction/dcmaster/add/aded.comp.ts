import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { dcmasterService } from "../../../../_service/dcmaster/add/dcmaster-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'aded.comp.html',
    providers: [dcmasterService, CommonService]
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

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;



    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private dcServies: dcmasterService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _userService: UserService, private _msg: MessageService) {
        this.newAddRow = [];
        this.counter = 0;
        this.totalqty = 0;
        this.totalAmt = 0;
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Sales Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.footer = true;
        setTimeout(function () {
            var date = new Date();
            var docdate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#docDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //disable Past Date
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
            $('.custname').focus();

            $("#lrDate").datepicker({
                dateFormat: "dd/mm/yy",
                autoclose: true,
                setDate: new Date()
            });
            $("#lrDate").datepicker('setDate', docdate);
            $('.custname').focus();
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
                "flag1": "negative",
                "createdby": that.loginUser.login
            }).subscribe(isproc => {
                var returnval = isproc.data;
                that.isinvoice = returnval[0].navigat;
                that.isconfirm = returnval[0].val;
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
        this.Salesmandrop = "";
        this.Traspoter = "";
        this.Token = "";
        this.BillAdr = "";
        this.shippAdr = "";
        this.Remark1 = "";
        this.Remark2 = "";
        this.salesid = 0;
        this.Salesmanlist = [];
        this.wareid = 0;
        this.warehouselist = [];
        this.newAddRow = [];

    }

    salesorderdetailsjson() {
        var jsonparam = [];
        for (let item of this.newAddRow) {
            var rate = item.rateslist.filter(itemval => itemval.id == item.id)
            jsonparam.push({
                "autoid": 0,
                "itemsid": item.itemsid,
                "qty": item.qty,
                "rate": rate[0].id,
                "dis": item.dis,
                "amount": item.amount
            })
        }
        return jsonparam;
    }

    //Auto Confirm Sales Order Confirm 
    confirmparam() {
        var confparam = {
            "fy": this.loginUser.fy,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "confimstatus": "auto confirm",
            "autoconfirm": this.isconfirm
        }
        return confparam;
    }

    paramterjson() {
        var that = this;
        that.docdate = $('#docDate').datepicker('getDate');
        that.delDate = $('#delDate').datepicker('getDate');
        var param = {
            "dcno": that.DocNo,
            "docdate": that.docdate,
            "acid": 1,
            "refno": that.Token,
            "deldate": that.delDate,
            "salesid": that.salesid,
            "traspo": that.Traspoter,
            "status": "",
            "billingadr": that.BillAdr,
            "shippadr": that.shippAdr,
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
        console.log(param);
        return param;
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        this.DirectInvoice = 0;
        if (evt === "back") {
            this._router.navigate(['transaction/dcmaster/view']);
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
            this.dcServies.saveDcMaster(
                this.paramterjson()
            ).subscribe(result => {
                var returndata = result.data;
                if (returndata[0].funsave_salesorder.maxid > 0) {
                    this._msg.Show(messageType.success, "success", returndata[0].funsave_salesorder.msg + ':' + returndata[0].funsave_salesorder.maxid)
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
                    $('.custname').focus();
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
            "flag": "edit",
            "doc": Docno,
            "cmpid": this.loginUser.fy,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            var dataset = data.data;
            var CustomerMaster = dataset[0];

            if (CustomerMaster.length > 0) {
                this.CustomerSelected(CustomerMaster[0].acid);
                this.CustName = CustomerMaster[0].acname;
                this.CustID = CustomerMaster[0].acid;
                this.docdate = CustomerMaster[0].dcdate;
                this.delDate = CustomerMaster[0].deldate;
                this.Token = CustomerMaster[0].refno;
                this.BillAdr = CustomerMaster[0].billadr;
                this.shippAdr = CustomerMaster[0].shippadr;
                this.Remark = CustomerMaster[0].remark;
                this.Remark2 = CustomerMaster[0].remark1;
                this.Salesmandrop = CustomerMaster[0].salesid;
                this.Traspoter = CustomerMaster[0].transid;
                this.newAddRow = dataset[1];
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
        this._autoservice.getAutoData({
            "type": "customer",
            "search": _me.CustName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".custname").autocomplete({
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
        this._autoservice.getAutoData({
            "type": "productwithwh",
            "whid": this.wareid,
            "search": arg == 0 ? me.NewItemsName : me.itemsname,
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
                    me.itemsname = ui.item.label;
                    if (arg === 1) {
                        me.itemsname = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.itemsid, arg, me.counter);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.itemsid, arg, me.counter);
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
        })
    }

    // //Selected Customer  Event
    CustomerSelected(val) {
        if (val != "") {
            this.addresslist = [];
            this.warehouselist = [];
            this.Transpoterlist = [];
            this.custKey = val;
            this.dcServies.getdcdetails({
                "custid": val,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "flag": '',
                "flag1": ''
            }).subscribe(details => {
                var dataset = details.data;
                this.addresslist = dataset[0]._address === null ? [] : dataset[0]._address;
                this.warehouselist = dataset[0]._warehouse === null ? [] : dataset[0]._warehouse;
                this.Transpoterlist = dataset[0]._transpoter === null ? [] : dataset[0]._transpoter;
                this.Salesmanlist = dataset[0]._salesman === null ? [] : dataset[0]._salesman;
                this.daylist = dataset[0]._days === null ? [] : dataset[0]._days;
            }, err => {
                console.log('Error');
            }, () => {
                // console.log('Complet');
            });
            this.CustfilteredList = [];
        }
    }

    //Rate Change Event
    ratechange(qty: any, newrate: any = [], dis: any) {
        try {
            if (qty != "" && newrate != "") {
                var amt = 0;
                var rate = this.rateslist.filter(item => item.id == newrate);
                amt = +qty * +rate[0].val;
                this.disTotal = amt * this.dis / 100;
                this.amount = Math.round(amt - this.disTotal);
                //this.amount = amt.toFixed(2);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;

        }
    }

    // //Selected Items
    ItemsSelected(val: number, falg: number, counter: number) {
        if (val != 0) {
            this.dcServies.getItemsAutoCompleted({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "itemsid": val,
                "whid": this.wareid,
                "createdby": this.loginUser.login
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data;
                if (falg === 0) {
                    this.qty = 0;
                    this.totalqty = ItemsResult[0].qty;
                    this.dis = ItemsResult[0].dis;
                    this.rateslist = ItemsResult[0].rates;
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
        try {
            if (this.wareid === 0) {
                this._msg.Show(messageType.error, "error", "Please Select Warehouse");
                return;
            }
            if (this.itemsname == '' || this.itemsname == undefined) {
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
                if (this.newAddRow[i].ItemsName == this.itemsname) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.newAddRow.push({
                    "autoid": 0,
                    'itemsname': this.itemsname,
                    "itemsid": this.itemsid,
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
                this.rateslist = [];
                this.newrate = "";
                this.qty = "";
                this.totalqty = 0;
                this.Rate = "";
                this.dis = "";
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
            this.dcServies.deleteDcMaster({
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