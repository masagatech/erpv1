import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service'
import { pendingdcService } from "../../../_service/pendingDC/pendingDC-service";
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { CalendarComp } from '../../usercontrol/calendar';
import { ALSService } from '../../../_service/auditlock/als-service';


declare var $: any;
@Component({
    templateUrl: 'pendingdc.comp.html',
    providers: [pendingdcService, CommonService, ALSService]
    //,AutoService
}) export class pendingdc implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;


    CustCode: any;
    all: any;

    //Declare Veriable Local
    docno: any;
    salesman: any;
    cust: any;
    docdate: any;
    deldate: any;
    remark: any;
    custid: any = 0;
    custname: any = "";
    acid: number = 0;

    //Declare Array Veriable
    DocDetailslist: any[];
    Salesmanlist: any[];
    doclist: any[];
    CustomerDetails: any = [];
    dcdetails: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("fromdatecal")
    fromcal: CalendarComp;

    @ViewChild("todatecal")
    tocal: CalendarComp;

    //Declare Table Veriable
    constructor(private setActionButtons: SharedVariableService, private ConfirmServies: pendingdcService,
        private _autoservice: CommonService, private _userService: UserService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
    }

    //Add Calendor 
    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "so", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.fromcal.setMinMaxDate(new Date(lockdate), null);
            that.tocal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.fromcal.initialize(this.loginUser);
        this.fromcal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.tocal.initialize(this.loginUser);
        this.tocal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Pending Sales Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            $(".Custcode").focus();
        }, 0);

        var date = new Date();
        this.fromcal.setDate(date);
        this.tocal.setDate(date);
    }

    //Refresh Button Call Method
    ClearControl() {
        this.custname = "";
        this.custid = 0;
        this.doclist = [];
        this.CustomerDetails = [];
        this.DocDetailslist = [];
        $(".Custcode").focus();
    }

    paramjson() {
        var param = [];
        if (this.DocDetailslist.length > 0) {
            for (let item of this.DocDetailslist) {
                param.push({
                    "autoid": 0,
                    "docdetail": item.detaiid,
                    "acid": this.acid,
                    "itemid": item.itemsid,
                    "ordqty": item.ordqty,
                    "rate": item.dcrate,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "createdby": this.loginUser.login,
                    "confimstatus": 'Menual',
                    "autoconfirm":false
                })
            }
        }
        console.log(param);
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControl();
        }
        else if (evt === "save") {
            debugger;
            var DirectInvoice = 0;
            this.ConfirmServies.ConfirmDC({
                "confirmdetails": this.paramjson(),
                "docno": this.docno,
            }).subscribe(documentno => {
                var dataset = documentno.data;
                if (dataset[0].doc > 0) {
                    alert("Data Save Successfully Document No :" + dataset[0].doc);
                    this.DocDetailslist = [];
                    //this.getPendingDocNo();
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    loadRBIGrid(event: LazyLoadEvent) {
    }

    //Get Pending DC Document no
    getPendingDocNo() {
        try {
            this.ConfirmServies.getPendingOrdNo({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "acid": this.custid,
                "createdby": this.loginUser.login
                // "fromdate": this.FromDate,
                // "todate": this.ToDate,
                // "flag": ""
            }).subscribe(ordno => {
                var dataset = ordno.data === null ? [] : ordno.data;
                if (dataset.length > 0) {
                    this.doclist = dataset;
                }
                else {
                    this._msg.Show(messageType.info, "info", "Record Not Found");
                    this.doclist = [];
                    $(".Custcode").focus();
                }
            }, err => {
                this._msg.Show(messageType.error, "error", "Service Error");
            }, () => {
                this.custid = "";
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Get Details Document No (Document No Click Event)
    GetDetails(items) {
        try {
            this.CustomerDetails = [];
            this.dcdetails = [];
            this.DocDetailslist = [];
            this.ConfirmServies.getPendignDcDetails({
                "cmpid": this.loginUser.cmpid,
                "docno": items.docno,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(documentno => {
                this.CustomerDetails = documentno.data[0] === null ? [] : documentno.data[0];
                this.dcdetails = documentno.data[1] === null ? [] : documentno.data[1];
                if (this.CustomerDetails.length > 0) {
                    this.docno = this.CustomerDetails[0].docno;
                    this.acid = this.CustomerDetails[0].custid;
                    this.cust = this.CustomerDetails[0].cust;
                    this.salesman = this.CustomerDetails[0].salesman;
                    this.docdate = this.CustomerDetails[0].docdate;
                    this.deldate = this.CustomerDetails[0].deldate;
                    this.remark = this.CustomerDetails[0].remark;
                    this.DocDetailslist = this.dcdetails;
                }
                else {
                    this._msg.Show(messageType.info, "info", "Record Not Found");
                    this.CustomerDetails = [];
                    this.DocDetailslist = [];
                    this.dcdetails = [];
                    return false;
                }
            }, err => {
                this._msg.Show(messageType.error, "error", "Service Error");
            }, () => {
                //Done Process
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Get Auto Completed Customer
    getAutoComplete(me: any) {
        var _me = this;
        try {
            this._autoservice.getAutoData({
                "type": "customer",
                "search": _me.custname,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(data => {
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
                        me.custid = ui.item.value;
                        me.custname = ui.item.label;
                    }
                });
            }, err => {
                this._msg.Show(messageType.error, "error", "Service Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Quntity Calculation
    private CulculateQty(row: any = [], detaiid: number = 0) {
        var QtyRate = 0;
        var DisAmt = 0;
        if (row.ordqty != "" && row.ordqty != "0") {
            if (parseInt(row.ordqty) > parseInt(row.oldqty)) {
                this._msg.Show(messageType.info, "info", "Please Enter valid Quntity")
                for (var i = 0; i < this.DocDetailslist.length; i++) {
                    if (this.DocDetailslist[i].detaiid === detaiid) {
                        this.DocDetailslist[i].ordqty = row.oldqty;
                        QtyRate = this.DocDetailslist[i].ordqty * this.DocDetailslist[i].rate;
                        DisAmt = QtyRate * this.DocDetailslist[i].dis / 100;
                        this.DocDetailslist[i].amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }
            }
            else {

                for (var i = 0; i < this.DocDetailslist.length; i++) {
                    if (this.DocDetailslist[i].detaiid === detaiid) {
                        QtyRate = this.DocDetailslist[i].ordqty * this.DocDetailslist[i].rate;
                        DisAmt = QtyRate * this.DocDetailslist[i].dis / 100;
                        this.DocDetailslist[i].amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }
            }
        }
        else {
            for (var i = 0; i < this.DocDetailslist.length; i++) {
                if (this.DocDetailslist[i].detaiid === detaiid) {
                    this.DocDetailslist[i].Amount = 0;
                    break;
                }
            }
        }
    }

    //Sub Total
    private SubTotal() {
        // if (this.DocDetailslist != undefined) {
        //     var Subtotal = 0;
        //     for (var i = 0; i < this.DocDetailslist.length; i++) {
        //         Subtotal += parseInt(this.DocDetailslist[i].Amount);
        //     };
        //     return Subtotal;
        // }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}