import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { CustomerAddService } from "../../../../_service/customer/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [CustomerAddService, CommonService]

}) export class CustAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Add Local Veriable
    custid: any = 0;
    code: any = "";
    Custname: any = "";
    warehouse: any = 0;
    dayslist: any = [];
    keyvallist: any = [];
    warehouselist: any = [];
    debitlist: any = [];
    creditlist: any = [];
    billadr: any = "";
    shippingchk: boolean = false;
    shippingadr: any = "";
    issh: any = 0;
    key: any = "";
    value: any = "";
    debit: any = 0;
    credit: any = 0;
    Duplicateflag: boolean = false;
    days: any = 0;
    ope: any = 0;
    remark: any = "";
    attrname: any = "";
    attrid: any = 0;
    ctrlname: any = "";
    ctrlid: any = 0;
    attrlist: any = [];
    Ctrllist: any = [];
    attrtable: boolean = true;
    ctrlhide: boolean = true;
    profflag: boolean = true;
    constflag: boolean = true;
    disattrlist: any = [];
    disattrname: any = "";
    disattrid: any = 0;
    fromval: any = 0;
    toval: any = 0;
    dis: any = 0;
    parentcodename: any = "";
    parentid: any = 0;
    parentname: any = "";
    itemsname: any = "";
    itemsid: any = 0;
    itemsdis: any = 0;
    itemslist: any = [];
    counter: number = 0;


    //Other Module Declare
    adrbookid: any = [];
    adrid: number = 0;
    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    adrcsvid: any = "";
    adrmodule: string = "";
    accode: string = "";
    acinfiid: any = 0;
    acinfival: any = "";
    salesmanlist: any = [];
    salename: any = "";
    salesid: any = 0;
    transname: any = "";
    transid: any = 0;
    translist: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;



    allload: any = {
        "wearhouse": false,
        "otherdropdwn": false
    }

    _editid: number = 0;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    private subscribeParameters: any;

    //Add Servies Refrence
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private CustAddServies: CustomerAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) {
        this.module = "cust";
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").removeAttr('disabled', 'disabled');
        $(".code").focus();
        this.getcustomerdrop();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.custid = params['id'];
                this._editid = this.custid


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

    //Get Code Blur Event
    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
    }

    //Discount Tab Click Event
    discount() {
        this.disattrname = "";
        this.fromval = "";
        this.toval = "";
        this.dis = "";
        setTimeout(function() {
            $(".disattr").focus();
        }, 100);

    }

    //Attribute Auto Extender
    getAutoCompletedisattr(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "attribute",
            "search": that.disattrname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "filter": "Item Attributes",
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".disattr").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.disattrid = ui.item.value;
                    me.disattrname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //Attribute Auto Extender
    getAutoCompletetrans(me: any) {
        var that = this;
        that._autoservice.getAutoData({
            "type": "transpoter",
            "search": that.transname,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fyid,
            "createdby": that.loginUser.login
        }).subscribe(data => {
            $(".transname").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.transid = ui.item.value;
                    me.transname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            //Complete
        })
    }

    getparentname(pid: number) {
        this.CustAddServies.getcustomer({
            "cmpid": this.loginUser.cmpid,
            "flag": "parentname",
            "parentid": pid,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            this.parentname = "";
            this.parentname = result.data[0][0].custname;
        }, err => {
            console.log("error");
        }, () => {
            //Complete
        })
    }

    getAutoCompleteItems(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "product",
            "search": that.itemsname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".itemsname").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.itemsid = ui.item.value;
                    me.itemsname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //attribute list Add Div
    TranspoterAdd() {
        if (this.transid > 0) {
            this.Duplicateflag = true;
            if (this.translist.length > 0) {
                for (var i = 0; i < this.translist.length; i++) {
                    if (this.translist[i].transname == this.transname) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.translist.push({
                    'transname': this.transname,
                    'value': this.transid
                });
                this.transname = "";
                $(".trans").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate transpoter");
                $(".trans").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied transpoter name");
            $(".trans").focus();
            return;
        }

    }

    transtab() {
        setTimeout(function() {
            this.transid = 0;
            this.transname = "";
            $(".transname").focus();
        }, 0);

    }

    //Remove Attribute
    RemoveTranspoter(row) {
        var index = -1;
        for (var i = 0; i < this.translist.length; i++) {
            if (this.translist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.translist.splice(index, 1);
        $(".trans").focus();
    }


    //Add Attribute Items
    Additems() {
        if (this.itemsid > 0) {
            if ($(".itemdis").val() == "") {
                this._msg.Show(messageType.info, "info", "Please Enter Items Discount");
                $(".itemdis").focus();
                return;
            }
            this.Duplicateflag = true;
            for (var i = 0; i < this.itemslist.length; i++) {
                if (this.itemslist[i].itemsname == this.itemsname && this.itemslist[i].itemsdis == this.itemsdis) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.itemslist.push({
                    'itemsname': this.itemsname,
                    'itemsdis': this.itemsdis,
                    'itemsid': this.itemsid,
                    'counter': this.counter
                });
                this.counter++;
                this.itemsname = "";
                this.itemsdis = "";
                this.itemsid = 0;
                $(".itemsname").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Items");
                $(".itemsname").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valid items name");
            $(".itemsname").focus();
            return;
        }


    }

    getAutoCompleteSales(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "salesman",
            "search": that.salename,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".sales").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.saleid = ui.item.value;
                    me.salename = ui.item.label;
                    me.SalemanAdd(me.saleid);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
        })
    }

    saletab() {
        setTimeout(function() {
            this.salename = "";
            $(".sales").focus();
        }, 0);
    }

    SalemanAdd(salesid: number) {
        if (salesid > 0) {
            this.Duplicateflag = true;
            if (this.salesmanlist.length > 0) {
                for (var i = 0; i < this.salesmanlist.length; i++) {
                    if (this.salesmanlist[i].salename == this.salename) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }

            if (this.Duplicateflag == true) {
                this.salesmanlist.push({
                    'salename': this.salename,
                    'value': salesid
                });
                this.salename = "";
                salesid = 0;
                $(".sales").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Salesman");
                $(".sales").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied attribute name");
            $(".sales").focus();
            return;
        }
    }

    RemoveSale(row: any = []) {
        var index = -1;
        for (var i = 0; i < this.salesmanlist.length; i++) {
            if (this.salesmanlist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.salesmanlist.splice(index, 1);
        $(".sales").focus();
    }

    itemdis() {
        setTimeout(function() {
            this.itemsname = "";
            this.itemsdis = "";
            this.itemsid = 0;
            $(".itemsname").focus();
        }, 0);
    }

    itemsRemove(row: any = []) {
        var index = -1;
        for (var i = 0; i < this.itemslist.length; i++) {
            if (this.itemslist[i].counter === row.counter) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.itemslist.splice(index, 1);
        $(".itemsname").focus();
    }

    //Attribute Auto Extender
    getAutoCompleteParentCode(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "custcode",
            "search": that.parentcodename,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".parentcode").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.parentid = ui.item.value;
                    me.parentcodename = ui.item.label;
                    me.getparentname(me.parentid);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //Add Attribute Items
    AddNewdisattr() {
        if (this.fromval > this.toval) {
            this._msg.Show(messageType.info, "info", "Wrong entry From greater than to");
            $(".fromval").focus();
            return;
        }
        if (this.disattrid > 0) {
            this.Duplicateflag = true;
            if (this.disattrlist.length > 0) {
                for (var i = 0; i < this.disattrlist.length; i++) {
                    if (this.disattrlist[i].disattrname == this.disattrname &&
                        parseInt(this.disattrlist[i].toval) < parseInt(this.fromval)) {
                        this.Duplicateflag = true;
                    }
                    else {
                        this.Duplicateflag = false;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.disattrlist.push({
                    'disattrname': this.disattrname,
                    'id': this.disattrid,
                    'fromval': this.fromval,
                    'toval': this.toval,
                    'discou': this.dis,
                    'counter': this.counter
                });
                this.counter++;
                console.log(this.counter);
                this.disattrname = "";
                this.fromval = "";
                this.disattrid = 0;
                this.toval = "";
                this.dis = "";
                $(".disattr").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Attribute");
                $(".disattr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valid attribute name");
            $(".disattr").focus();
            return;
        }
    }

    //Remove Attribute
    disRemoveattr(row) {
        var index = -1;
        for (var i = 0; i < this.disattrlist.length; i++) {
            if (this.disattrlist[i].counter === row.counter) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.disattrlist.splice(index, 1);
        $(".attr").focus();
    }

    //attribute list Add Div
    AttributeAdd() {
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            if (this.attrlist.length > 0) {
                for (var i = 0; i < this.attrlist.length; i++) {
                    if (this.attrlist[i].attrname == this.attrname) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.attrlist.push({
                    'attrname': this.attrname,
                    'value': this.attrid
                });
                this.attrname = "";
                $(".attr").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Attribute");
                $(".attr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied attribute name");
            $(".attr").focus();
            return;
        }

    }

    //Remove Attribute
    Removeattr(row) {
        var index = -1;
        for (var i = 0; i < this.attrlist.length; i++) {
            if (this.attrlist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.attrlist.splice(index, 1);
        $(".attr").focus();
    }

    //File Upload Start 
    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    //File Upload Complete 
    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.docfile.push({ "id": e[i].id });
        }
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        var _this = this;
        this.CustAddServies.getCustomerdrop({
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            _this.warehouselist = result.data[0];
            _this.debitlist = result.data[1];
            _this.creditlist = result.data[1];
            _this.dayslist = result.data[2];
            _this.allload.otherdropdwn = true;
            _this.checkalllead();
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //First Time Load 
    checkalllead() {

        if (this.allload.otherdropdwn) {
            if (this._editid > 0) {
                this.EditCust(this._editid);
            }

        }
    }

    //Add Accounting Row
    AddNewKyeval() {
        var that = this;
        if (that.acinfiid == 0) {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus()
            return;
        }
        if (that.value == "") {
            that._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus()
            return;
        }
        that.Duplicateflag = true;
        if (that.keyvallist.length > 0) {
            for (var i = 0; i < that.keyvallist.length; i++) {
                if (that.keyvallist[i].key == that.key && that.keyvallist[i].value == that.value) {
                    that.Duplicateflag = false;
                    break;
                }
            }
        }
        if (that.Duplicateflag == true) {
            that.keyvallist.push({
                'key': that.acinfival,
                'keyid': that.acinfiid,
                'value': that.value
            });
            that.key = "";
            that.value = "";
            that.attrtable = false;
            $(".key").focus();

        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".key").focus();
            return;
        }
    }

    createkeydatajson() {
        var keydata = [];
        for (let items of this.keyvallist) {
            keydata.push({
                "id": items.keyid,
                "val": items.value
            });
        }
        return keydata;
    }

    //Delete Accounting Row
    DeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.keyvallist.length; i++) {
            if (this.keyvallist[i].key === row.key) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.keyvallist.splice(index, 1);
        $(".key").focus();

    }

    //Final Save Clear Controll 
    ClearControll() {
        this.custid = 0;
        this.code = "";
        this.Custname = "";
        this.warehouse = "";
        this.billadr = "";
        this.shippingadr = "";
        this.shippingchk = false;
        this.issh = 0;
        this.remark = "";
        this.warehouselist = [];
        this.keyvallist = [];
        this.adrbookid = [];
        this.attrlist = [];
        this.disattrlist = [];
        this.itemslist = [];
        this.translist = [];
        this.Ctrllist = [];
        this.debit = 0;
        this.credit = 0;
        this.days = 0;
        this.ope = "";
        this.parentname = "";
        this.parentid = 0;
        this.parentcodename = "";
        this.addressBook.ClearArray();

    }

    //Edit Customer 
    EditCust(id) {
        var that = this;
        that.CustAddServies.getcustomer({
            "cmpid": this.loginUser.cmpid,
            "flag": "Edit",
            "custid": id,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            var resultdata = result.data[0][0]
            var _custdata = resultdata._custdata;
            var _uploadedfile = resultdata._uploadedfile;
            var _docfile = resultdata._docfile;


            that.custid = _custdata[0].autoid;
            that.code = _custdata[0].code;
            that.Custname = _custdata[0].custname;
            that.keyvallist = _custdata[0]._attributejson == null ? [] : _custdata[0].keyval;
            that.attrlist = resultdata._attributejson == null ? [] : resultdata._attributejson;
            that.itemslist = resultdata._itemsdiscount == null ? [] : resultdata._itemsdiscount;
            that.disattrlist = resultdata._discount == null ? [] : resultdata._discount;
            that.translist = resultdata._transpoter == null ? [] : resultdata._transpoter;
            that.keyvallist = resultdata._keyvalue == null ? [] : resultdata._keyvalue;
            that.Ctrllist = resultdata._ctrlcenter == null ? [] : resultdata._ctrlcenter;


            that.debit = _custdata[0].debit;
            that.credit = _custdata[0].credit;
            that.ope = _custdata[0].op;
            that.days = _custdata[0].days;
            that.remark = _custdata[0].remark;
            that.adrid = _custdata[0].adrid;
            that.parentid = _custdata[0].pid;
            that.parentname = _custdata[0].pcode;
            that.parentcodename = _custdata[0].pname;

            if (_uploadedfile != null) {
                that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
                that.docfile = _docfile == null ? [] : _docfile;
            }
            that.adrcsvid = "";
            for (let items of _custdata[0].adr) {
                that.adrcsvid += items.adrid + ',';
            }
            that.addressBook.getAddress(that.adrcsvid.slice(0, -1));
            that.issh = 1;

            //Warehouse check edit mode
            if (that.warehouselist.length > 0) {
                var wareedit = _custdata[0].warehouseid;
                for (var j = 0; j <= wareedit.length - 1; j++) {
                    var chk = that.warehouselist.find(a => a.value === wareedit[j].value);
                    chk.Warechk = true;
                }
            }

        }, err => {
            console.log("error");
        }, () => {
            console.log("Done");

        })
    }

    //Multipal Warehouse Selection Create a Json
    warehousejson() {
        var warehouseid = [];
        for (let wareid of this.warehouselist) {
            if (wareid.Warechk == true) {
                warehouseid.push({ "value": wareid.value });
            }
        }
        return warehouseid;
    }

    //Create a Json in controll
    Ctrljson() {
        var Ctrllistdet = [];
        for (let ctrid of this.Ctrllist) {
            Ctrllistdet.push({
                "id": ctrid.id,
                "profchk": ctrid.profflag,
                "conschk": ctrid.constflag
            });
        }
        return Ctrllistdet;
    }

    //Create a Json in discount
    discountjson() {
        var dislist = [];
        for (let item of this.disattrlist) {
            dislist.push({
                "id": item.id, "froms": item.fromval,
                "tos": item.toval, "discou": item.dis
            });
        }
        console.log(dislist);
        return dislist;
    }

    //Create a Json in items discount
    itemsdiscountjson() {
        var itemdislist = [];
        for (let item of this.itemslist) {
            itemdislist.push({
                "id": item.itemsid, "val": item.itemsdis
            });
        }
        return itemdislist;

    }

    //Create a Json in items transpoter
    transpoterjson() {
        var translist = [];
        for (let item of this.translist) {
            translist.push({
                "id": item.value
            });
        }
        return translist;
    }

    //Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "attribute",
            "search": that.attrname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "filter": "Item Attributes",
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".attr").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.attrid = ui.item.value;
                    me.attrname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //Autocompleted Control Center
    getAutoCompleteCtrl(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "ctrl",
            "search": that.ctrlname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".ctrl").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.ctrlid = ui.item.value;
                    me.ctrlname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Autocompleted Control Center
    getAutoCompletekey(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "attribute",
            "search": that.acinfival,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fyid,
            "filter": "Account Attribute",
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".key").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function(event, ui) {
                    me.acinfiid = ui.item.value;
                    me.acinfival = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    Ctrl() {
        setTimeout(function() {
            $(".ctrl").val("");
            $(".ctrl").focus();
        }, 0)
    }

    createattrjson() {
        var attrid = [];
        if (this.attrlist.length > 0) {
            for (let items of this.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    //Add New Controll Center
    AddNewCtrl() {
        this.CustAddServies.getctrldetail({
            "id": this.ctrlid,
            "cmpid": this.loginUser.cmpid
        }).subscribe(result => {
            console.log(result.data);
            if (result.data.length > 0) {
                this.Duplicateflag = true;
                for (var i = 0; i < this.Ctrllist.length; i++) {
                    if (this.Ctrllist[i].ctrlname == this.ctrlname) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
                if (this.Duplicateflag == true) {
                    this.Ctrllist.push({
                        "ctrlname": result.data[0].ctrlname,
                        "proftcode": result.data[0].proftcode,
                        "costcode": result.data[0].costcode,
                        "profflag": this.profflag,
                        "constflag": this.constflag,
                        "id": result.data[0].autoid
                    });
                    console.log(this.Ctrllist);
                    this.ctrlhide = false;
                    this.ctrlid = 0;
                    this.ctrlname = "";
                    $(".ctrl").focus();

                }
                else {
                    this._msg.Show(messageType.info, "info", "Duplicate control center");
                    this.ctrlname = "";
                    $(".ctrl").focus();
                    return;
                }
            }
            else {
                this._msg.Show(messageType.info, "info", "Control name Not found");
                this.ctrlname = "";
                $(".ctrl").focus();
                return;
            }

        }, err => {
            console.log("Error")
        }, () => {
            //console.log("completed")
        })
    }

    //Delete Control Center Row
    DeleteCtrl(row) {
        var index = -1;
        for (var i = 0; i < this.Ctrllist.length; i++) {
            if (this.Ctrllist[i].ctrlname === row.ctrlname) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.Ctrllist.splice(index, 1);
        $(".ctrl").focus();
    }

    //Paramter Wth Json
    paramterjson() {
        var param = {
            "custid": this.custid,
            "code": this.code,
            "custname": this.Custname,
            "warehouse": this.warehousejson(),
            "keyval": this.createkeydatajson(),
            "dis": this.discountjson(),
            "attr": this.createattrjson(),
            "docfile": this.docfile,
            "itemsdis": this.itemsdiscountjson(),
            "trans": this.transpoterjson(),
            "sales": [],
            "days": this.days == "" ? 0 : this.days,
            "cr": this.credit == "" ? 0 : this.credit,
            "dr": this.debit == "" ? 0 : this.debit,
            "op": this.ope == "" ? 0 : this.ope,
            "cmpid": this.loginUser.cmpid,
            "remark": this.remark,
            "ctrl": this.Ctrljson(),
            "createdby": this.loginUser.login,
            "adrid": this.adrbookid,
            "parentid": this.parentid == "" ? 0 : this.parentid
        }
        console.log(param);
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['master/customer/view']);
        }
        if (evt === "save") {
            if (this.code == "") {
                this._msg.Show(messageType.info, "info", "Please enter customer code");
                $(".code").focus();
                return;
            }
            if (this.Custname == "") {
                this._msg.Show(messageType.info, "info", "Please enter customer name");
                $(".firstname").focus();
                return;
            }
            if (this.warehouselist.length == 0) {
                this._msg.Show(messageType.info, "info", "Please enter warehouse");
                return;
            }
            this.CustAddServies.saveCustomer(
                this.paramterjson()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_customer.maxid == '-1') {
                    this._msg.Show(messageType.info, "info", "Customer code already exists");
                    $(".code").focus();
                    return;
                }
                if (dataset[0].funsave_customer.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data save successfully");
                    this.ClearControll();
                    $(".code").removeAttr('disabled', 'disabled');
                    $(".code").focus();
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".code").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".firstname").focus();
            this.issh = 0;
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Attribute Tab Click Event
    Attr() {
        setTimeout(function() {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    //Account Info Tab Click Event
    Acinfo() {
        setTimeout(function() {
            $(".key").val("");
            $(".val").val("");
            $(".key").focus();
        }, 0);
    }

    //Warehose Tab Click Bind
    warehouseBind() {
        var that = this;
        that.CustAddServies.getCustomerdrop({
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            if (result.data[0].length > 0) {
                that.warehouselist = result.data[0];
            }
            else {
                this._msg.Show(messageType.info, "info", "No warehouse found");
            }

        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Warehouse Tab Click Event 
    TabWare() {
        var that = this;
        if (that.issh == 0) {
            that.issh = 1;
            that.warehouseBind();
        } else {
            that.issh == 0;
        }

    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}