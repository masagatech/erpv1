import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CNService } from '../../../../_service/creditnote/cn-service' /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;

@Component({
    templateUrl: 'addcn.comp.html',
    providers: [CNService, CommonService, ALSService]
})

export class AddCreditNote implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Declare Ledger Variable
    // ledgerParamDT: any = [];

    cnid: number = 0;
    docno: number = 0;
    custid: number = 0;
    custcode: string = "";
    custname: string = "";
    ccid: number = 0;
    narration: string = "";
    isactive: boolean = false;

    createdby: string = "";
    createdon: any = "";
    updatedby: string = "";
    updatedon: string = "";

    itemid: number = 0;
    itemname: string = "";
    itemqty: any = "0";
    itemdisc: any = "0";
    actualitemqty: any = "";
    itemprice: any = "0";

    newcnid: number = 0;

    newitemid: number = 0;
    newitemname: string = "";
    newitemqty: any = "0";
    newitemdisc: any = "0";
    newactualitemqty: any = "";
    newitemprice: any = "0";
    newtotalamt: any = "0";

    ledgeridDT: any = [];
    stockidDT: any = [];

    uploadedFiles: any = [];
    suppdoc: any = [];

    accountsDT: any = [];
    CNRowData: any = [];
    duplicateItems: Boolean = true;

    itemsDT: any = [];
    itemDiscDT: any = [];
    itemPriceDT: any = [];

    counter: any = 0;
    title: string = "";
    module: string = "";

    @ViewChild("docdate")
    docdate: CalendarComp;

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    // Page Load

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _CNService: CNService, private _userService: UserService, private _autoservice: CommonService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Credit Note";

        this.isadd = _router.url.indexOf("/add") > -1;
        this.isedit = _router.url.indexOf("/edit") > -1;
        this.isdetails = _router.url.indexOf("/details") > -1;
    }

    resetCNFields() {
        this.custid = 0;
        this.setAuditDate();
        this.narration = "";
        this.isactive = true;
        this.CNRowData = [];
        this.newitemid = 0;
        this.newitemname = "";
        this.newitemdisc = "";
        this.newitemprice = "";
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "cn", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;

            if (lockdate != "") {
                // that.docdate.setMinMaxDate(new Date(lockdate), null);
                var date = new Date(lockdate);
                this.docdate.setDate(date);
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("Credit Note");

        setTimeout(function() {
            $(".cnaccname input").focus();
        }, 0);

        console.log("isadd" + this.isadd + ", isedit" + this.isedit + ", isdetails" + this.isdetails);

        this.docdate.initialize(this.loginUser);
        this.docdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                $('button').prop('disabled', false);
                $('.cnaccname input').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.docno = 0;
                this.resetCNFields();

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                $('button').prop('disabled', false);
                $('.cnaccname input').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.docno = params['id'];
                this.getCNDataByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                $('button').prop('disabled', true);
                $('.cnaccname input').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.docno = params['id'];
                this.getCNDataByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveCNData(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/creditnote/edit/', this.docno]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveCNData(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/creditnote']);
        }
    }

    // Auto Completed Customer

    getAutoAccounts(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "customercc",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "uid": this.loginUser.uid,
            "typ": "",
            "search": query
        }).then(data => {
            this.accountsDT = data;
        });
    }

    // Selected Inline Item Selected

    selectAutoAccounts(event) {
        var that = this;
        that.custid = event.value;
        that.custcode = event.custcode;
        that.custname = event.label;
        that.ccid = event.ccid;
    }

    // Auto Completed Items

    getAutoItems(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "items",
            "cmpid": this.loginUser.cmpid,
            "search": query
        }).then(data => {
            this.itemsDT = data;
        });
    }

    // Selected Inline Item Selected

    selectAutoItems(event, args) {
        var that = this;

        if (args === 1) {
            that.itemid = event.value;
            that.itemname = event.label;
            that.actualitemqty = event.itemqty;
        } else {
            that.newitemid = event.value;
            that.newitemname = event.label;
            that.newactualitemqty = event.itemqty;
        }
    }

    validItemQty(args) {
        var that = this;
        var vitemqty = 0;

        if (args === 1) {
            vitemqty = parseInt(that.itemqty)

            if (vitemqty > that.actualitemqty) {
                that._msg.Show(messageType.error, "Error", "This Quantity can not be grater than Item Quantity : " + that.actualitemqty);
                that.itemqty = "";
                $(".itemqty input").focus();
            }
        } else {
            vitemqty = parseInt(that.newitemqty)

            if (vitemqty > that.newactualitemqty) {
                that._msg.Show(messageType.error, "Error", "This Quantity can not be grater than Item Quantity : " + that.newactualitemqty);
                that.newitemqty = "";
                $(".newitemqty input").focus();
            }
        }
    }

    // Dropdown Item Price

    fillItemPriceDDL(row, args) {
        var that = this;

        that._CNService.getCreditNote({
            "flag": "dropdown", "cmpid": that.loginUser.cmpid, "itemid": args === 1 ? that.itemid : that.newitemid
        }).subscribe(data => {
            var d = data.data;

            if (args === 1) {
                row.itemPriceDT = d.filter(a => a.ddltyp === "rate")[0].itemtyp;
                row.itemDiscDT = d.filter(a => a.ddltyp === "disc")[0].itemtyp;
            } else {
                that.itemPriceDT = d.filter(a => a.ddltyp === "rate")[0].itemtyp;
                that.itemDiscDT = d.filter(a => a.ddltyp === "disc")[0].itemtyp;
            }
        });
    }

    isDuplicateItems() {
        var that = this;

        for (var i = 0; i < that.CNRowData.length; i++) {
            var field = that.CNRowData[i];

            if (field.itemid == that.newitemid) {
                that._msg.Show(messageType.error, "Error", "Duplicate Items not Allowed");
                return true;
            }
        }

        return false;
    }

    getTotalAmt(row, args) {
        var that = this;

        if (args === 1) {
            var discprice = (((row.itemprice * row.itemqty) * row.itemdisc) / 100);
            row.totalamt = (row.itemprice * row.itemqty) - discprice;
        } else {
            var discprice = (((that.newitemprice * that.newitemqty) * that.newitemdisc) / 100);
            that.newtotalamt = (that.newitemprice * that.newitemqty) - discprice;
        }
    }

    private addItemRow() {
        var that = this;

        // Validation

        if (that.newitemname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Item Name");
            return;
        }

        if (that.newitemqty == "0") {
            that._msg.Show(messageType.error, "Error", "Please Enter Item Quantity");
            return;
        }

        if (that.newitemprice == "0") {
            that._msg.Show(messageType.error, "Error", "Please Select Item Price");
            return;
        }

        if (that.newitemdisc == "0") {
            that._msg.Show(messageType.error, "Error", "Please Select Item Discount");
            return;
        }

        // Duplicate items Check
        that.duplicateItems = that.isDuplicateItems();

        // Add New Row
        if (that.duplicateItems == false) {
            that.CNRowData.push({
                "counter": that.counter,
                "whautoid": 0,
                "cnid": that.newcnid,
                "docno": that.docno,
                "itemid": that.newitemid,
                "itemname": that.newitemname,
                "itemqty": that.newitemqty,
                "itemprice": that.newitemprice,
                "itemdisc": that.newitemdisc,
                //"discprice": (((that.newitemprice * that.newitemqty) * that.newitemdisc) / 100),
                "totalamt": that.newtotalamt,
                "itemDiscDT": that.itemDiscDT,
                "itemPriceDT": that.itemPriceDT,
                "isactive": true
            });

            that.counter++;
            that.newcnid = 0;
            that.newitemid = 0;
            that.newitemname = "";
            that.newitemqty = "";
            that.newitemprice = "";
            that.newitemdisc = "";
            that.newtotalamt = "";
            that.itemDiscDT = [];
            that.itemPriceDT = [];

            $(".itemname input").focus();
        }
    }

    deleteCNRow(row) {
        row.isactive = false;
    }

    TotalItemQty() {
        var ItemQtyTotal = 0;
        var CNRow = this.CNRowData.filter(a => a.isactive === true);

        for (var i = 0; i < CNRow.length; i++) {
            var items = CNRow[i];
            ItemQtyTotal += parseFloat(items.itemqty);
        }

        return ItemQtyTotal;
    }

    TotalItemAmt() {
        var ItemAmtTotal = 0;
        var CNRow = this.CNRowData.filter(a => a.isactive === true);

        for (var i = 0; i < CNRow.length; i++) {
            var items = CNRow[i];
            ItemAmtTotal += parseFloat(items.totalamt);
        }

        return ItemAmtTotal;
    }

    getItemsByCNID(pdocno: number) {
        var that = this;

        that._CNService.getCreditNote({
            "flag": "details", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "docno": pdocno
        }).subscribe(data => {
            // debugger;
            that.CNRowData = data.data[0];
            console.log(that.CNRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCNDataByID(pdocno: number) {
        var that = this;

        that._CNService.getCreditNote({
            "flag": "edit", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "docno": pdocno
        }).subscribe(data => {
            var _cndata = data.data[0]._cndata;
            var _cndetails = data.data[0]._cndetails;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;
            var _ledgerparam = data.data[0]._acledger;
            var _stockparam = data.data[0]._stockledger;

            that.cnid = _cndata[0].cnid;
            that.custid = _cndata[0].custid;
            that.custcode = _cndata[0].custcode;
            that.custname = _cndata[0].custname;
            that.narration = _cndata[0].narration;
            that.isactive = _cndata[0].isactive;
            that.createdby = _cndata[0].createdby;
            that.createdon = _cndata[0].createdon;
            that.updatedby = _cndata[0].updatedby;
            that.updatedon = _cndata[0].updatedon;

            var date = new Date(_cndata[0].docdate);
            that.docdate.setDate(date);

            that.getItemsByCNID(pdocno);

            // that.CNRowData = _cndetails.length === 0 ? [] : _cndetails;
            that.uploadedFiles = _suppdoc.length === 0 ? [] : _uploadedfile;
            that.suppdoc = _suppdoc.length === 0 ? [] : _suppdoc;
            that.ledgeridDT = _ledgerparam === null ? [] : _ledgerparam.length === 0 ? [] : _ledgerparam;
            that.stockidDT = _stockparam === null ? [] : _stockparam.length === 0 ? [] : _stockparam;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        var that = this;

        for (var i = 0; i < e.length; i++) {
            that.suppdoc.push({ "id": e[i].id });
        }

        that.actionButton.find(a => a.id === "save").enabled = true;
    }

    // Ledger Entry

    getLedgerParams() {
        var that = this;
        var ledgerParamDT = [];
        var ldrid1, ldrid2;

        try {
            if (that.ledgeridDT.length > 0) {
                ldrid1 = that.ledgeridDT[0].ledgerid;
                ldrid2 = that.ledgeridDT[1].ledgerid;
            }
            else {
                ldrid1 = 0
                ldrid2 = 0
            }

            ledgerParamDT.push({
                "autoid": ldrid1,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "module": "CN",
                "trndate": that.docdate.getDate(),
                "actype": "acc_cust",
                "code": that.custcode,
                "name": that.custname,
                "dualac": { "code": "SALERT", "name": "SALES RETURN A/C" },
                "dramt": 0,
                "cramt": that.TotalItemAmt(),
                "narration": that.narration,
                "ccid": that.ccid,
                "createdby": that.loginUser.login
            });

            ledgerParamDT.push({
                "autoid": ldrid2,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "module": "CN",
                "trndate": that.docdate.getDate(),
                "actype": "acc_cust",
                "code": "SALERT",
                "name": "SALES RETURN A/C",
                "dualac": { "code": that.custcode, "name": that.custname },
                "dramt": that.TotalItemAmt(),
                "cramt": 0,
                "narration": that.narration,
                "ccid": that.ccid,
                "createdby": that.loginUser.login
            });

            return ledgerParamDT;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    // Stock Entry

    getStockParams() {
        var that = this;
        var stockParamDT = [];

        try {
            for (let item of that.CNRowData) {
                stockParamDT.push({
                    "autoid": item.whautoid,
                    "cmpid": that.loginUser.cmpid,
                    "fy": that.loginUser.fy,
                    //"docno": item.cnid,
                    "docdate": that.docdate.getDate(),
                    "module": "CN",
                    "itemid": item.itemid,
                    "rate": item.itemprice,
                    "amount": item.totalamt,
                    "inword": item.itemqty,
                    "outward": 0,
                    "narration": item.narration,
                    "createdby": that.loginUser.login
                })
            }

            return stockParamDT;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    saveCNData(isactive: boolean) {
        var that = this;
        var ledgerParamDT = that.getLedgerParams();
        var stockParamDT = that.getStockParams();

        console.log(ledgerParamDT);
        console.log(stockParamDT);

        var saveCN = {
            "cnid": that.cnid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docdate": that.docdate.getDate(),
            "custid": that.custid,
            "custcode": that.custcode,
            "uidcode": that.loginUser.login,
            "narration": that.narration,
            "suppdoc": that.suppdoc,
            "isactive": isactive,
            "cndetails": that.CNRowData,
            "ledgerparam": ledgerParamDT,
            "stockparam": stockParamDT
        }

        that.duplicateItems = that.isDuplicateItems();

        if (that.duplicateItems == false) {
            that._CNService.saveCreditNote(saveCN).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_creditnote.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_creditnote.msg);
                    that._router.navigate(['/accounts/creditnote']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_creditnote.msg);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}