import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { VendorAddService } from "../../../../_service/vendor/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

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


    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private vendorAddServies: VendorAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService) {
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

    //attribute list Add Div
    AttributeAdd() {
        debugger;
        this.attrlist.push({
            'attrname': this.attrname,
            'value': this.attrid
        });
        this.attrname = "";
        $(".attr").focus();
    }

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        this.vendorAddServies.getVendordrop({
            "cmpid": 1,
            "createdby": "admin"
        }).subscribe(result => {
            this.debitlist = result.data[1];
            this.creditlist = result.data[1];
            this.dayslist = result.data[2];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
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
    }

    //Edit Customer 
    EditVen(id) {
        this.vendorAddServies.getvendor({
            "cmpid": 1,
            "flag": "Edit",
            "venid": id
        }).subscribe(result => {
            console.log(result);
            this.venid = result.data[0][0].autoid;
            this.code = result.data[0][0].code;
            this.vendor = result.data[0][0].vendor;
            this.keyvallist = result.data[0][0].keyval;
            this.attrlist = result.data[0][0].attr;
            this.debit = result.data[0][0].debit;
            this.credit = result.data[0][0].credit;
            this.ope = result.data[0][0].op;
            this.days = result.data[0][0].days;
            this.remark = result.data[0][0].remark;
            this.adrid = result.data[1][0].adrid;
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
            // console.log("Complete");
        })
    }

    attributeid() {
        var attrilist = [];
        for (let items of this.attrlist) {
            attrilist.push({ "attrid": items.value })
        }
        return attrilist;
    }
    //Paramter Wth Json
    paramterjson() {
        var param = {
            "venid": this.venid,
            "code": this.code,
            "vendor": this.vendor,
            "keyval": this.keyvallist,
            "attr": this.attributeid(),
            "days": this.days == "" ? 0 : this.days,
            "cr": this.credit == "" ? 0 : this.credit,
            "dr": this.debit == "" ? 0 : this.debit,
            "op": this.ope == "" ? 0 : this.ope,
            "cmpid": 1,
            "remark": this.remark,
            "createdby": "admin",
            "adr": this.adrbookid
        }
        console.log(param);
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
                    this._msg.Show(messageType.info, "info", "Data already exists");
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