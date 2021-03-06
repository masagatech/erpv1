import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { VendorAddService } from "../../../../_service/vendor/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [VendorAddService, CommonService]

}) export class VenAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Add Local Veriable
    ledid: number = 0;
    venid: any = 0;
    code: any = "";
    vendor: any = "";
    dayslist: any = [];
    keyvallist: any = [];
    debitlist: any = [];
    creditlist: any = [];
    shippingchk: boolean = false;
    issh: any = 0;
    key: any = "";
    keyid: number = 0;
    value: any = "";
    debit: any = 0;
    credit: any = 0;
    Duplicateflag: boolean = false;
    days: any = 0;
    ope: any = 0;
    remark: any = "";
    attrname: any = "";
    attrid: any = 0;
    attrtable: boolean = true;
    profflag: boolean = true;
    constflag: boolean = true;
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: string = "";
    suppdoc: any = [];
    module: string = "";
    uploadedFiles: any = [];
    accode: string = "";
    editmode: boolean = false;
    isactive: boolean = false;
    parentid: number = 0;
    parentcode: any = "";
    parentname: any = "";

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Auto Extender
    acinfivalAutodata: any = [];
    ParentcodeAutodata: any = [];

    allload: any = {
        "wearhouse": false,
        "otherdropdwn": false
    }

    _editid: number = 0;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    @ViewChild('attribute')
    attribute: AttributeComp;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private vendorAddServies: VendorAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) {
        this.module = "vm";
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Vendor Master");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").removeAttr('disabled', 'disabled');
        $(".code").focus();
        this.getcustomerdrop();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.venid = params['id'];
                this.EditVen(this.venid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.attribute.attrparam = ["vendorinfo_attr", "acinfo_attr"];
    }

    //On Blur Event Cust Code
    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
        this.adrbookid = [];
    }

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        try {
            var that = this;
            that.vendorAddServies.getVendordrop({
                "cmpid": this.loginUser.cmpid,
                "createdby": this.loginUser.login,
                "tblname": "",
                "fy": this.loginUser.fy
            }).subscribe(result => {
                that.debitlist = result.data[1];
                that.creditlist = result.data[1];
                that.dayslist = result.data[2];
                if (!that.editmode) {
                    that.keyvallist = result.data[3];
                }

                that.allload.otherdropdwn = true;
                that.checkalllead();
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Firs Time Load 
    checkalllead() {
        if (this.allload.otherdropdwn) {
            if (this._editid > 0) {
                this.EditVen(this._editid);
            }

        }
    }

    //Add Accounting Row
    AddNewKyeval() {
        try {
            if (this.key == "") {
                this._msg.Show(messageType.error, "error", "Please enter key");
                $(".key input").focus()
                return;
            }
            if (this.value == "") {
                this._msg.Show(messageType.error, "error", "Please enter value");
                $(".val").focus()
                return;
            }
            this.Duplicateflag = true;
            this.keyvallist == null ? [] : this.keyvallist;
            if (this.keyvallist.length > 0) {
                for (var i = 0; i < this.keyvallist.length; i++) {
                    if (this.keyvallist[i].key == this.key && this.keyvallist[i].value == this.value) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.keyvallist.push({
                    'key': this.key,
                    'keyid': this.keyid,
                    'value': this.value
                });
                this.key = "";
                this.value = "";
                this.keyid = 0;
                this.attrtable = false;
                $(".key input").focus();

            }
            else {
                this._msg.Show(messageType.error, "error", "Duplicate key and value");
                this.keyid = 0;
                $(".key input").focus();
                return;
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }


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
        this.venid = 0;
        this.code = "";
        this.vendor = "";
        this.shippingchk = false;
        this.issh = 0;
        this.days = 0;
        this.remark = "";
        this.keyvallist = [];
        this.attribute.attrlist = [];
        this.debit = 0;
        this.credit = 0;
        this.ope = "";
        this.addressBook.ClearArray();
        this.parentid = 0;
        this.parentcode = "";
        this.parentname = "";
    }

    //File Upload Start 
    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    //File Upload Complete 
    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    //Edit Customer 
    EditVen(id) {
        try {
            var that = this;
            this.vendorAddServies.getvendor({
                "cmpid": this.loginUser.cmpid,
                "flag": "Edit",
                "venid": id,
                "createdby": this.loginUser.login
            }).subscribe(result => {
                that.editmode = true;
                var finaldata = result.data[0][0];
                var _venddata = finaldata._venddata;
                var _uploadedfile = finaldata._uploadedfile;
                var _suppdoc = finaldata._suppdoc;
                var _attr = finaldata._attrlist;
                var _keyval = finaldata._keylist;
                var _parentname = finaldata._parentid === null ? [] : finaldata._parentid;
                if (_parentname.length > 0) {
                    that.parentid = _parentname[0].pid;
                    that.parentcode = _parentname[0].pcode;
                    that.parentname = _parentname[0].pname;
                }
                that.ledid = _venddata[0].ledid == null ? 0 : _venddata[0].ledid;
                that.venid = _venddata[0].autoid;
                that.code = _venddata[0].code;
                that.vendor = _venddata[0].vendor;

                that.keyvallist = _keyval === null ? [] : _keyval;
                that.attribute.attrlist = _attr === null ? [] : _attr;
                // that.debit = _venddata[0].debit;
                // that.credit = _venddata[0].credit;
                that.ope = _venddata[0].ope == null ? 0 : _venddata[0].ope;
                that.days = _venddata[0].days;
                that.remark = _venddata[0].remark;
                that.isactive = _venddata[0].isactive;

                if (_uploadedfile != null) {
                    that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
                    that.suppdoc = _suppdoc == null ? [] : _suppdoc;
                }
                that.adrcsvid = "";
                for (let items of _venddata[0].adr) {
                    that.adrcsvid += items.adrid + ',';
                }
                that.addressBook.getAddress(that.adrcsvid.slice(0, -1));
                that.issh = 1;
            }, err => {
                console.log("error");
            }, () => {
                console.log("Done");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        try {
            var that = this;
            this._autoservice.getAutoData({
                "type": "attribute",
                "search": that.attrname,
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.fy,
                "filter": "vendorinfo_attr",
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
                    select: function (event, ui) {
                        me.attrid = ui.item.value;
                        me.attrname = ui.item.label;
                    }
                });
            }, err => {
                console.log("Error");
            }, () => {
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }


    }

    //Account Info Autoextender
    acinfivalAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "attribute",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "filter": "acinfo_attr",
            "search": query
        }).then(data => {
            this.acinfivalAutodata = data;
        });
    }

    //Account Info Selected
    acinfivalSelect(event) {
        this.keyid = event.value;
        this.key = event.label;
    }

    //Parent Code Autoextender
    ParentcodeAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "vendorcode",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.ParentcodeAutodata = data;
        });
    }

    //Parent Code Selected
    ParentcodeSelect(event) {
        this.parentid = event.value;
        this.parentcode = event.label;
        this.getparentname(this.parentid);
    }

    createattrjson() {
        var attrlist = [];
        if (this.attribute.attrlist.length > 0) {
            for (let items of this.attribute.attrlist) {
                attrlist.push({ "id": items.value });
            }
            return attrlist;
        }
    }
    createkeyvaljson() {
        var keylist = [];
        if (this.keyvallist.length > 0) {
            for (let items of this.keyvallist) {
                keylist.push({ "id": items.keyid, "val": items.value });
            }
            return keylist;
        }
    }

    getparentname(pid: number) {
        try {
            this.vendorAddServies.getvendor({
                "cmpid": this.loginUser.cmpid,
                "flag": "parentname",
                "parentid": pid,
                "createdby": this.loginUser.login
            }).subscribe(result => {
                this.parentname = result.data[0][0].vname;
            }, err => {
                console.log("error");
            }, () => {
                //Complete
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }


    }

    ledgerparam() {
        try {
            var ledgerlist = [];
            ledgerlist.push({
                "autoid": this.ledid,
                "cmpid": this.loginUser.cmpid,
                "acid": this.code,
                "fy": this.loginUser.fy,
                "typ": "vend",
                "dramt": this.ope == "" ? 0 : this.ope,
                "cramt": 0,
                "nar": this.remark,
                "createdby": this.loginUser.login
            })
            return ledgerlist;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Paramter Wth Json
    paramterjson() {
        try {
            var param = {
                "venid": this.venid,
                "code": this.code,
                "vendor": this.vendor,
                "keyval": this.createkeyvaljson(),
                "suppdoc": this.suppdoc,
                "attr": this.createattrjson(),
                "days": this.days == "" ? 0 : this.days,
                "cr": this.credit == "" ? 0 : this.credit,
                "dr": this.debit == "" ? 0 : this.debit,
                "op": this.ope == "" ? 0 : this.ope,
                "cmpid": this.loginUser.cmpid,
                "remark": this.remark,
                "isactive": this.isactive,
                "createdby": this.loginUser.login,
                "adr": this.adrbookid,
                "parentcode": this.parentcode,
                "ledgerparam": this.ledgerparam()
            }
            return param;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }


    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControll();
            $(".code").focus();
        }
        if (evt === "back") {
            this._router.navigate(['master/vendor']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.adrbookid.length == 0) {
                this._msg.Show(messageType.error, "error", "Please enter contact address");
                return;
            }
            try {
                this.actionButton.find(a => a.id === "save").enabled = false;
                this.vendorAddServies.saveVendor(
                    this.paramterjson()
                ).subscribe(result => {
                    var dataset = result.data;
                    if (dataset[0].funsave_vendor.maxid == '-1') {
                        this._msg.Show(messageType.error, "error", "Vendor code already exists");
                        $(".code").focus();
                        return;
                    }
                    if (dataset[0].funsave_vendor.maxid > 0) {
                        this._msg.Show(messageType.success, "success", "Data save successfully");
                        $(".code").removeAttr('disabled', 'disabled');
                        $(".code").focus();
                        this.ClearControll();
                        if (this.editmode) {
                            this._router.navigate(['master/vendor']);
                        }
                        this.editmode = false;
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
            }
            this.actionButton.find(a => a.id === "save").enabled = true;

        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".code").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            this.addressBook.AddBook(this.code);
            this.accode = this.code;
            $(".vendor").focus();
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Attribute Tab Click 
    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 100);
    }

    //Account Info Tab Click Event
    Acinfo() {
        setTimeout(function () {
            $(".key").val("");
            $(".val").val("");
            $(".key input").focus();
        }, 100);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}