import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemAddService } from "../../../../_service/itemmaster/add/itemadd-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'itemadd.comp.html',
    providers: [ItemAddService, CommonService]                         //Provides Add Service
    //,AutoService
}) export class itemadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    itemsid: any = 0;
    itemcode: any = "";
    itemname: any = "";
    SaleDesc: any = "";
    PurDesc: any = "";
    Cost: any = 0;
    UoMId: any = 0;
    ImgPath: any = "";
    MRP: any = 0;
    SaleDis1: any = 0;
    PurDis2: any = 0;
    CurID: any = 0;
    ProdCodeTitle: any = "";
    attrname: any = "";
    skucode: any = "";
    attrid: any = 0;
    attrlist: any = [];
    saleslist: any = [];
    purchaselist: any = [];
    purch: any = 0;
    purdis: any = 0;
    sales: any = 0;
    dis: any = 0;
    suppname: any = "";
    suppid: any = 0;
    supplist: any = [];
    itemsdesc: any = "";

    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    Duplicateflag: boolean = false;
    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private itemsaddServies: ItemAddService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute,
        private _msg: MessageService) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $('.itemcode').removeAttr('disabled');
        $('.itemcode').focus();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.itemsid = params['id'];
                this.EditItems(this.itemsid);

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

    //Autocompleted Attribute Name
    getAutoCompletesupp(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "supplier", "search": that.suppname, "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".supp").autocomplete({
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
                    me.suppid = ui.item.value;
                    me.suppname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //Add New Supplier 
    SupplierAdd() {
        if (this.suppid > 0) {
            this.Duplicateflag = true;
            for (var i = 0; i < this.supplist.length; i++) {
                if (this.supplist[i].suppname == this.suppname) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.supplist.push({
                    'suppname': this.suppname,
                    'value': this.suppid
                });
                this.suppname = "";
                $(".supp").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate supplier");
                $(".supp").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied supplier name");
            $(".supp").focus();
            return;
        }
    }

    //Supplier Tab Click
    SuppTab() {
        setTimeout(function () {
            this.suppname = "";
            $(".supp").focus();
        }, 100)

    }

    //Remove Supplier 
    Removesupp(row) {
        var index = -1;
        for (var i = 0; i < this.supplist.length; i++) {
            if (this.supplist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.supplist.splice(index, 1);
        $(".supp").focus();
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

    //Add Accounting Row
    SalesAdd() {
        debugger;
        var that = this;
        if (this.sales == "") {
            this._msg.Show(messageType.info, "info", "Please enter key");
            $(".sales").focus()
            return;
        }
        this.Duplicateflag = true;
        for (var i = 0; i < this.saleslist.length; i++) {
            if (this.saleslist[i].sales == this.sales && this.saleslist[i].dis == this.dis) {
                this.Duplicateflag = false;
                break;
            }
        }
        if (this.Duplicateflag == true) {
            this.saleslist.push({
                'sales': this.sales,
                'dis': this.dis
            });
            this.sales = "";
            this.dis = "";
            //that.attrtable = false;
            $(".sales").focus();

        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".sales").focus();
            return;
        }
    }

    //Delete Accounting Row
    DeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.saleslist.length; i++) {
            if (this.saleslist[i].sales === row.sales) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.saleslist.splice(index, 1);
        $(".key").focus();

    }

    //Add Purchase Price
    PurchaseAdd() {
        var that = this;
        if (that.purch == "") {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".purch").focus()
            return;
        }
        that.Duplicateflag = true;
        for (var i = 0; i < that.purchaselist.length; i++) {
            if (that.purchaselist[i].purch == that.purch && that.purchaselist[i].purdis == that.purdis) {
                that.Duplicateflag = false;
                break;
            }
        }
        if (that.Duplicateflag == true) {
            that.purchaselist.push({
                'purch': that.purch,
                'purdis': that.purdis
            });
            that.purch = "";
            that.purdis = "";
            //that.attrtable = false;
            $(".purch").focus();

        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".purch").focus();
            return;
        }
    }

    ItemsTab() {
        setTimeout(function () {
            this.sales = "";
            this.dis = "";
            this.purch = "";
            this.purdis = "";
            $(".sales").focus();
        }, 100);
    }

    //Delete Purchase Price
    PurDeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.purchaselist.length; i++) {
            if (this.purchaselist[i].purch === row.purch) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.purchaselist.splice(index, 1);
        $(".key").focus();
    }


    //Edit Paramter
    EditParamJson() {
        var Param = {
            "cmpid": 1,
            "fy": 5,
            "itemsid": this.itemsid,
            "createdby": "",
            "flag": "Edit",
            "fromdate": null,
            "todate": null
        }
        return Param;
    }

    //Edit Item
    EditItems(ProdCode) {
        var that = this;
        this.itemsaddServies.EditItem(
            this.EditParamJson()
        ).subscribe(result => {
            var returndata = result.data;
            if (returndata.length > 0) {
                this.itemcode = returndata[0].itemcode;
                this.itemname = returndata[0].itemname;
                this.MRP = returndata[0].mrp1;
                this.SaleDis1 = returndata[0].saledis;
                this.SaleDesc = returndata[0].saledesc;
                this.Cost = returndata[0].itemscost;
                this.PurDis2 = returndata[0].purdis;
                this.PurDesc = returndata[0].purdesc;
                that.ProdCodeTitle = "(" + returndata[0].itemcode + ")";
            }
            else {
                alert('Record not found');
                $(".Category").focus();
                return;
            }

        }, err => {
            console.log(err);
        }, () => {
            //Complete
        })
    }

    //Clear Controll
    private ClearControll() {
        this.itemsid = 0;
        this.itemcode = "";
        this.itemname = "";
        this.MRP = "";
        this.SaleDis1 = "";
        this.SaleDesc = "";
        this.Cost = "";
        this.PurDis2 = "";
        this.PurDesc = "";
        this.itemsdesc = "";
        this.skucode = "";
    }

    //Parametr With Json
    private ParamJson() {
        var Param = {
            "itemsid": this.itemsid,
            "cmpid": 1,
            "fy": 5,
            "createdby": "admin",
            "itemdesc": this.itemsdesc,
            "itemcode": this.itemcode,
            "itemname": this.itemname,
            "skucode": this.skucode,
            "attr": this.attrlist,
            "sales": this.saleslist,
            "purc": this.purchaselist,
            "supp": this.supplist,
            "ware": [],
            "docfile": this.docfile
        }
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {

            if (this.itemcode == "") {
                this._msg.Show(messageType.info, "info", "Please enter item code");
                $(".itemcode").focus();
                return;
            }
            if (this.itemname == "") {
                this._msg.Show(messageType.info, "info", "Please enter item name");
                $(".itemname").focus();
                return;
            }
            this.itemsaddServies.itemsMasterSave(
                this.ParamJson()
            ).subscribe(details => {
                var dataset = details.data;
                if (dataset[0].funsave_itemsmaster.maxid == -1) {
                    this._msg.Show(messageType.info, "info", "item code already exists");
                    $(".itemcode").focus();
                    return;
                }

                if (dataset[0].funsave_itemsmaster.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data Save Succssfully Document");
                    this.ClearControll();
                }
                else {
                    console.log('Error');
                    $(".itemcode").focus();
                    return;
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".itemcode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            $(".itemname").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}