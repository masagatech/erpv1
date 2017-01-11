import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { VendorAddService } from "../../../../_service/vendor/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [VendorAddService, CommonService]

}) export class VenAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Add Local Veriable
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
    value: any = "";
    debit: any = 0;
    credit: any = 0;
    Duplicateflag: boolean = false;
    days: any = 0;
    ope: any = 0;
    remark: any = "";
    attrname: any = "";
    attrid: any = 0;
    attrlist: any = [];
    attrtable: boolean = true;
    profflag: boolean = true;
    constflag: boolean = true;
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: string = "";
    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    accode:string="";

    allload: any = {
        "wearhouse": false,
        "otherdropdwn": false
    }

    _editid: number = 0;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private vendorAddServies: VendorAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService) {
        this.module = "vend";
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
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
    }

     Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
    }

    //attribute list Add Div
    AttributeAdd() {
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            for (var i = 0; i < this.attrlist.length; i++) {
                if (this.attrlist[i].attrname == this.attrname) {
                    this.Duplicateflag = false;
                    break;
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

    Removeattr(row) {
        var index = -1;
        for (var i = 0; i < this.attrlist.length; i++) {
            if (this.attrlist[i].attrid === row.attrid) {
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

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        var that = this;
        that.vendorAddServies.getVendordrop({
            "cmpid": 1,
            "createdby": "admin"
        }).subscribe(result => {
            that.debitlist = result.data[1];
            that.creditlist = result.data[1];
            that.dayslist = result.data[2];
            that.allload.otherdropdwn = true;
            that.checkalllead();
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    checkalllead() {
        if (this.allload.otherdropdwn) {
            if (this._editid > 0) {
                this.EditVen(this._editid);
            }

        }
    }

    //Add Accounting Row
    AddNewKyeval() {
        if (this.key == "") {
            this._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus()
            return;
        }
        if (this.value == "") {
            this._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus()
            return;
        }
        this.Duplicateflag = true;
        for (var i = 0; i < this.keyvallist.length; i++) {
            if (this.keyvallist[i].key == this.key && this.keyvallist[i].value == this.value) {
                this.Duplicateflag = false;
                break;
            }
        }
        if (this.Duplicateflag == true) {
            this.keyvallist.push({
                'key': this.key,
                'value': this.value
            });
            this.key = "";
            this.value = "";
            this.attrtable = false;
            $(".key").focus();

        }
        else {
            this._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".key").focus();
            return;
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
        this.attrlist = [];
        this.debit = 0;
        this.credit = 0;
        this.ope = "";
        this.addressBook.ClearArray();
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

    //Edit Customer 
    EditVen(id) {
        var that = this;
        this.vendorAddServies.getvendor({
            "cmpid": 1,
            "flag": "Edit",
            "venid": id
        }).subscribe(result => {
            debugger;
            var _venddata = result.data[0][0]._venddata;
            var _uploadedfile = result.data[0][0]._uploadedfile;
            var _docfile = result.data[0][0]._docfile;

            that.venid = _venddata[0].autoid;
            that.code = _venddata[0].code;
            that.vendor = _venddata[0].vendor;
            that.keyvallist = _venddata[0].keyval;
            that.attrlist = _venddata[0].attr;
            that.debit = _venddata[0].debit;
            that.credit = _venddata[0].credit;
            that.ope = _venddata[0].op;
            that.days = _venddata[0].days;
            that.remark = _venddata[0].remark;

            if (_uploadedfile != null) {
                that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
                that.docfile = _docfile == null ? [] : _docfile;
            }

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
    }

    //Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "attribute", "search": that.attrname, "cmpid": 1, "FY": 5 }).subscribe(data => {
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
            this.attrid = 0;
        })
    }

    // attributeid() {
    //     var attrilist = [];
    //     for (let items of this.attrlist) {
    //         attrilist.push({ "attrid": items.value, "attname": items.label })
    //     }
    //     console.log(attrilist)
    //     return attrilist;
    // }


    //Paramter Wth Json
    paramterjson() {
        var param = {
            "venid": this.venid,
            "code": this.code,
            "vendor": this.vendor,
            "keyval": this.keyvallist,
            "docfile": this.docfile,
            "attr": this.attrlist,
            "days": this.days == "" ? 0 : this.days,
            "cr": this.credit == "" ? 0 : this.credit,
            "dr": this.debit == "" ? 0 : this.debit,
            "op": this.ope == "" ? 0 : this.ope,
            "cmpid": 1,
            "remark": this.remark,
            "createdby": "admin",
            "adr": this.adrbookid
        }
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['master/vendor/view']);
        }
        if (evt === "save") {
            if (this.code == "") {
                this._msg.Show(messageType.info, "info", "Please enter vendor code");
                $(".code").focus();
                return;
            }
            if (this.vendor == "") {
                this._msg.Show(messageType.info, "info", "Please enter vendor name");
                $(".vendor").focus();
                return;
            }
            this.vendorAddServies.saveVendor(
                this.paramterjson()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_vendor.maxid == '-1') {
                    this._msg.Show(messageType.info, "info", "Vendor code already exists");
                    $(".code").focus();
                    return;
                }
                if (dataset[0].funsave_vendor.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data save successfully");
                    $(".code").focus();
                    this.ClearControll();
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
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".code").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 100);
    }
    Acinfo() {
        setTimeout(function () {
            $(".key").val("");
            $(".val").val("");
            $(".key").focus();
        }, 100);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}