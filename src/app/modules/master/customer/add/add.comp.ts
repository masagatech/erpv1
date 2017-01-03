import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { CustomerAddService } from "../../../../_service/customer/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [CustomerAddService, CommonService]                         //Provides Add Service dcmaster-service.ts

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
    attrlist: any = [];


    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private CustAddServies: CustomerAddService, private _autoservice: CommonService,
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

                this.custid = params['id'];
                this.EditCust(this.custid);

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
    AttributeList() {
        this.attrlist.push({
            'attrname': this.attrname,
            'value': this.attrid
        });
        this.attrname = "";
        $(".attr").focus();
    }

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        this.CustAddServies.getCustomerdrop({
            "cmpid": 1,
            "createdby": "admin"
        }).subscribe(result => {
            console.log(result.data)
            this.warehouselist = result.data[0];
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
        $(".code").focus();
    }

    //Edit Customer 
    EditCust(id) {
        this.CustAddServies.getcustomer({
            "cmpid": 1,
            "flag": "Edit",
            "custid": id
        }).subscribe(result => {
            this.custid = result.data[0][0].autoid;
            this.code = result.data[0][0].code;
            this.Custname = result.data[0][0].firstname;
            this.warehouse = result.data[0][0].warehouseid;
            this.billadr = result.data[0][0].billing;
            this.shippingadr = result.data[0][0].shippingadr;
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
                warehouseid.push({ "wareid": wareid.value });
            }
        }
        return warehouseid;
    }

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

    //Paramter Wth Json
    paramterjson() {
        var param = {
            "custid": this.custid,
            "code": this.code,
            "custname": this.Custname,
            "warehouse": this.warehousejson(),
            "keyval": this.keyvallist,
            "attr": this.attrlist,
            "days": this.days=="" ? 0 : this.days,
            "cr": this.credit =="" ? 0 : this.credit,
            "dr": this.debit =="" ? 0 : this.debit,
            "op": this.ope,
            "bill": this.billadr,
            "shipp": this.shippingadr,
            "cmpid": 1,
            "remark": this.remark,
            "createdby": "admin"
        }
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
                this._msg.Show(messageType.info, "info", "Please enter customer first name");
                $(".firstname").focus();
                return;
            }
            this.CustAddServies.saveCustomer(
                this.paramterjson()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_customer.maxid > 0) {
                   this._msg.Show(messageType.success, "success", "Data save successfully");
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

    //Warehouse Tab Click Event 
    // TabWare() {
    //     if (this.issh == 0) {
    //         this.issh = 1;
    //         this.CustAddServies.getCustomerdrop({
    //             "cmpid": 1,
    //             "createdby": "admin"
    //         }).subscribe(result => {
    //             this.warehouselist = result.data[1];
    //         }, err => {
    //             console.log("Error");
    //         }, () => {
    //             // console.log("Complete");
    //         })
    //     } else {
    //         this.issh == 0;
    //     }

    // }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}