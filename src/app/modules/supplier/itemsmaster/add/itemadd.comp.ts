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
    attname: any = "";
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
    titlesale: any = "";
    titlesaleid: any = 0;
    titlepur: any = "";
    titlepurid: any = 0;
    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    shelflifelist: any = [];
    warehouselist: any = [];
    UoMlist: any = [];
    UoM: any = 0;
    shelf: any = 0;
    Keyvallist: any = [];
    keyattr: any = "";
    keyattrid: any = 0;
    keyvalue: any = "";
    itemsremark: any = "";
    Duplicateflag: boolean = false;
    private subscribeParameters: any;
    barcode: any = "";

    allload: any = {
        "wearhouse": false,
        "otherdropdwn": false
    }
    _editid: number = 0;
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private itemsaddServies: ItemAddService,
        private _autoservice: CommonService, private _commonservice: CommonService, private _routeParams: ActivatedRoute,
        private _msg: MessageService) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $('.itemcode').removeAttr('disabled');
        this.module = "item";
        $('.itemcode').focus();
        this.getAllDropdown();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.itemsid = params['id'];
                this._editid = this.itemsid;

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

    //Shelf Life Dropdown Fill
    getAllDropdown() {
        var that = this;
        this.itemsaddServies.getdorpdown({ "cmpid": 1 }).subscribe(data => {
            var dswarehaouse = data.data[0].filter(item => item.group === "warehouse");
            that.warehouselist = dswarehaouse;
            var dsshelflife = data.data[0].filter(item => item.group === "shelf life");
            that.shelflifelist = dsshelflife;
            var dsUoM = data.data[0].filter(item => item.group === "UoM");
            that.UoMlist = dsUoM;
            if (data.data[1].length > 0) {
                that.Keyvallist = data.data[1]
            }
            that.allload.otherdropdwn = true;
            that.checkalllead();
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    checkalllead() {
        if (this.allload.otherdropdwn) {
            if (this._editid > 0) {
                this.EditItems(this._editid);
            }

        }
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
        this._autoservice.getAutoData({ "type": "attribute", "search": that.attname, "filter": "Item Attributes", "cmpid": 1, "FY": 5 }).subscribe(data => {
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
                    me.attname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            me.attrid = 0;
        })
    }

    //Key Val Tab Click
    KeyValTab() {
        setTimeout(function() {
            this.keyattr = "";
            this.keyattrid = 0;
            this.keyvalue = "";
            $(".keyattr").focus();
        }, 100)

    }

    //Key Data Attribute
    getAutoCompleteKeyval(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "attribute", "search": that.keyattr, "filter": "Item Attributes", "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".keyattr").autocomplete({
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
                    me.keyattrid = ui.item.value;
                    me.keyattr = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // me.keyattrid = 0;
        })
    }

    KeyvalAdd() {
        if ($(".keyattr").val() == "") {
            this.keyattrid = 0;
        }
        if ($(".keyvalue").val() == "") {
            this._msg.Show(messageType.info, "info", "Please enter value");
            $(".keyvalue").focus();
            return;
        }
        if (this.keyattrid > 0) {
            this.Duplicateflag = true;
            for (var i = 0; i < this.Keyvallist.length; i++) {
                if (this.Keyvallist[i].keyattr == this.keyattr && this.Keyvallist[i].keyvalue == this.keyvalue) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.Keyvallist.push({
                    'keyattr': this.keyattr,
                    'keyattrid': this.keyattrid,
                    'keyvalue': this.keyvalue
                });
                this.keyattr = "";
                this.keyvalue = "";
                $(".keyattr").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Attribute");
                $(".keyattr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied attribute name");
            $(".keyattr").focus();
            return;
        }
    }

    KeyvalDelete(row) {
        var index = -1;
        for (var i = 0; i < this.Keyvallist.length; i++) {
            if (this.Keyvallist[i].keyattr === row.keyattr) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.Keyvallist.splice(index, 1);
        $(".keyattr").focus();
    }


    //Autocompleted Attribute Name
    getAutoCompleteSale(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "attribute", "search": that.titlesale, "filter": "Item Attributes", "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".saleattr").autocomplete({
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
                    me.titlesaleid = ui.item.value;
                    me.titlesale = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
           
        }, () => {
             //me.titlesaleid = 0;
        })
    }

    //Autocompleted Attribute Name
    getAutoCompletePurc(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "attribute", "search": that.titlepur, "filter": "Item Attributes", "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".purattr").autocomplete({
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
                    me.titlepurid = ui.item.value;
                    me.titlepur = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            //this.titlepurid = 0;
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
                select: function(event, ui) {
                    me.suppid = ui.item.value;
                    me.suppname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.suppid = 0;
        })
    }

    //Add New Supplier 
    SupplierAdd() {
        if ($(".supp").val() == "") {
            this.suppid = 0;
        }
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
                    'suppid': this.suppid
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
        setTimeout(function() {
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
        if ($(".attr").val() == "") {
            this.attrid = 0;
        }
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            for (var i = 0; i < this.attrlist.length; i++) {
                if (this.attrlist[i].attname == this.attname) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.attrlist.push({
                    'attname': this.attname,
                    'attrid': this.attrid
                });
                this.attname = "";
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
        var that = this;
        if (this.titlesale == "") {
            this._msg.Show(messageType.info, "info", "Please enter title");
            $(".saleattr").focus()
            return;
        }
        if (this.sales == "") {
            this._msg.Show(messageType.info, "info", "Please enter sales price");
            $(".sales").focus()
            return;
        }
        if (this.titlesaleid > 0) {
            this.Duplicateflag = true;
            for (var i = 0; i < this.saleslist.length; i++) {
                if (this.saleslist[i].sales == this.sales && this.saleslist[i].titlesale == this.titlesale) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.saleslist.push({
                    'titlesale': this.titlesale,
                    'titlesaleid': this.titlesaleid,
                    'sales': this.sales
                });
                this.titlesale = "";
                this.titlesaleid = 0;
                this.sales = "";
                this.dis = "";
                //that.attrtable = false;
                $(".saleattr").focus();

            }
            else {
                that._msg.Show(messageType.info, "info", "Duplicate value");
                $(".sales").focus();
                return;
            }
        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied sales name");
            $(".sales").focus();
            return;
        }
    }

    //Delete Sales Row
    SalesDeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.saleslist.length; i++) {
            if (this.saleslist[i].titlesale === row.titlesale) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.saleslist.splice(index, 1);
        $(".saleattr").focus();

    }

    //Add Purchase Price
    PurchaseAdd() {
        var that = this;
        if (that.titlepur == "") {
            that._msg.Show(messageType.info, "info", "Please enter purchase name");
            $(".purattr").focus()
            return;
        }
        if (that.purch == "") {
            that._msg.Show(messageType.info, "info", "Please enter value ");
            $(".purch").focus()
            return;
        }
        if (this.titlepurid > 0) {
            that.Duplicateflag = true;
            for (var i = 0; i < that.purchaselist.length; i++) {
                if (that.purchaselist[i].titlepur == that.titlepur && that.purchaselist[i].purch == that.purch) {
                    that.Duplicateflag = false;
                    break;
                }
            }
            if (that.Duplicateflag == true) {
                that.purchaselist.push({
                    'titlepur': that.titlepur,
                    'titlepurid': that.titlepurid,
                    'purch': that.purch
                });
                that.titlepur = "";
                that.titlepurid = 0;
                that.purch = "";
                $(".purattr").focus();

            }
            else {
                that._msg.Show(messageType.info, "info", "Duplicate value");
                $(".purch").focus();
                return;
            }
        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied purchase name");
            $(".purch").focus();
            return;
        }
    }

    ItemsTab() {
        setTimeout(function() {
            this.sales = "";
            this.dis = "";
            this.purch = "";
            this.purdis = "";
            $(".saleattr").focus();
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
        $(".purattr").focus();
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
    EditItems(itemsid) {
        var that = this;
        this.itemsaddServies.EditItem(
            this.EditParamJson()
        ).subscribe(result => {
            var returndata = result.data;
            if (returndata.length > 0) {
                var _custdata = returndata[0]._custdata;
                var _uploadedfile = returndata[0]._uploadedfile;
                var _docfile = returndata[0]._docfile;

                this.itemcode = returndata[0].itemcode;
                this.itemname = returndata[0].itemname;
                this.skucode = returndata[0].skucode;
                this.UoM = returndata[0].uom;
                this.shelf = returndata[0].shelflife;
                this.itemsdesc = returndata[0].itemdesc;
                this.itemsremark = returndata[0].itemremark;
                this.attrlist = returndata[0]._attributejson;
                this.Keyvallist = returndata[0]._keydatajson;
                this.saleslist = returndata[0]._salesjson;
                this.purchaselist = returndata[0]._purchasejson;
                this.supplist = returndata[0]._supplierjson;

                if (_uploadedfile != null) {
                    that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
                    that.docfile = _docfile == null ? [] : _docfile;
                }

                //Warehouse check edit mode
                if (that.warehouselist.length > 0) {
                    // setTimeout(function () {
                    var wareedit = returndata[0].warehouse;
                    for (var j = 0; j <= wareedit.length - 1; j++) {
                        var chk = that.warehouselist.find(a => a.id === wareedit[j].id);
                        chk.Warechk = true;
                    }
                    // }, 100)
                }
            }
            else {
                //lentgh 0
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
        this.skucode = "";
        this.UoM = "";
        this.shelf = "";
        this.itemsremark = "";
        this.itemsdesc = "";
        this.skucode = "";
        this.saleslist = [];
        this.purchaselist = [];
        this.attrlist = [];
        this.Keyvallist = [];
        this.supplist = [];
        this.barcode = "";
        $('.itemcode').removeAttr('disabled');
        $('.itemcode').focus();
    }

    //Create Json String in Attribute
    private CreatejsonAttribute() {
        var attrlist = [];
        if (this.attrlist.length > 0) {
            for (let item of this.attrlist) {
                attrlist.push({ "id": item.attrid })
            }
            return attrlist;
        }
    }

    //Create Json String in Supplier 
    private CreatejsonSupplier() {
        var Supplist = [];
        if (this.supplist.length > 0) {
            for (let item of this.supplist) {
                Supplist.push({ "id": item.suppid })
            }
            return Supplist;
        }
    }

    //Create Json String in Warehouse 
    private CreatejsonWarehouse() {
        var warelist = [];
        if (this.warehouselist.length > 0) {
            for (let item of this.warehouselist) {
                if (item.Warechk == true) {
                    warelist.push({ "id": item.id });
                }
            }
            return warelist;
        }
    }

    //Create Json String in Key Data
    private Createjsonkeydata() {
        var keylist = [];
        if (this.Keyvallist.length > 0) {
            for (let item of this.Keyvallist) {
                if (item.keyvalue != "") {
                    keylist.push({ "id": item.keyattrid, "val": item.keyvalue })
                }
            }
            return keylist;
        }
    }

    //Create Json String in Sales Price
    private CreatejsonSalePrice() {
        var Salelist = [];
        if (this.saleslist.length > 0) {
            for (let item of this.saleslist) {
                Salelist.push({ "id": item.titlesaleid, "val": item.sales })
            }
            return Salelist;
        }
    }

    //Create Json String in Purchase Price
    private CreatejsonPurchasePrice() {
        var Purchlist = [];
        if (this.purchaselist.length > 0) {
            for (let item of this.purchaselist) {
                Purchlist.push({ "id": item.titlepurid, "val": item.purch })
            }
            return Purchlist;
        }
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
            "barcode": this.barcode,
            "uom": this.UoM,
            "shelflife": this.shelf,
            "itemremark": this.itemsremark,
            "keydata": this.Createjsonkeydata(),
            "attr": this.CreatejsonAttribute(),
            "sales": this.CreatejsonSalePrice(),
            "purc": this.CreatejsonPurchasePrice(),
            "supp": this.CreatejsonSupplier(),
            "ware": this.CreatejsonWarehouse(),
            "docfile": this.docfile
        }
        console.log(Param);
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt == "back") {
            this._router.navigate(['supplier/itemsmaster']);
        }
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
            if (this.UoM == "") {
                this._msg.Show(messageType.info, "info", "Please select unit of measurement");
                $(".uom").focus();
                return;
            }
            if (this.shelf == "") {
                this._msg.Show(messageType.info, "info", "Please select shelf life");
                $(".sheft").focus();
                return;
            }
            if (this.saleslist.length == 0) {
                this._msg.Show(messageType.info, "info", "Please enter sele price rate");
                $(".sheft").focus();
                return;
            }
            if (this.purchaselist.length == 0) {
                this._msg.Show(messageType.info, "info", "Please enter purchase price rate");
                $(".sheft").focus();
                return;
            }
            if (this.warehouselist.length > 0) {
                var wareflag = false;
                for (let item of this.warehouselist) {
                    if (item.Warechk == true) {
                        wareflag = true;
                    }
                }
                if (wareflag == false) {
                    this._msg.Show(messageType.info, "info", "Please select warehouse");
                    return;
                }

            }
            else {
                this._msg.Show(messageType.info, "info", "Please create warehouse master");
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
                this.getAllDropdown();
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