import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemAddService } from "../../../../_service/itemmaster/add/itemadd-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";
import { LazyLoadEvent, DataTable, CheckboxModule } from 'primeng/primeng';
import { NumTextModule } from '../../../usercontrol/numtext';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [ItemAddService, CommonService]
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
    suppdoc: any = [];
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
    editmode: boolean = false;
    isactive: boolean = false;

    materialdetail: any = [];
    matname: any = "";
    newmatname: any = "";
    matid: any = 0;
    griduomlist: any = [];
    qty: any = 0;
    newuom: number = 0;
    materialcounter: number = 0;

    //Auto Extender Array
    MaterialAutodata: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    @ViewChild('attribute')
    attribute: AttributeComp;

    allload: any = {
        "wearhouse": false,
        "otherdropdwn": false
    }
    _editid: number = 0;
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private itemsaddServies: ItemAddService,
        private _autoservice: CommonService, private _commonservice: CommonService, private _routeParams: ActivatedRoute,
        private _msg: MessageService, private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Item Master");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $('.itemcode').removeAttr('disabled');
        this.module = "item";
        $('.itemcode').focus();
        this.getAllDropdown();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
                this.itemsid = params['id'];
                this._editid = this.itemsid;

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.attribute.attrparam = ["item_attr"];


    }

    attrtab() {
        setTimeout(function () {
            this.attname = "";
            $(".attr").focus();
        }, 0);
    }

    loadRBIGrid(event: LazyLoadEvent) {
    }

    //Shelf Life Dropdown Fill
    getAllDropdown() {
        try {
            var that = this;
            this.itemsaddServies.getdorpdown({ "cmpid": this.loginUser.cmpid }).subscribe(data => {
                var dswarehaouse = data.data[0].filter(item => item.group === "warehouse");
                debugger;
                that.warehouselist = dswarehaouse;
                var dsshelflife = data.data[0].filter(item => item.group === "shelflife");
                that.shelflifelist = dsshelflife;
                var dsUoM = data.data[0].filter(item => item.group === "uom");
                that.UoMlist = dsUoM;
                that.griduomlist = dsUoM;
                if (data.data[1].length > 0) {
                    that.Keyvallist = data.data[1]
                }
                that.allload.otherdropdwn = true;
                that.checkalllead();
            }, err => {
                console.log("Error");
            }, () => {
                //Done
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    whTab() {

    }

    checkalllead() {
        try {
            if (this.allload.otherdropdwn) {
                if (this._editid > 0) {
                    this.EditItems(this._editid);
                }
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

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

    //Key Val Tab Click
    KeyValTab() {
        setTimeout(function () {
            this.keyattr = "";
            this.keyattrid = 0;
            this.keyvalue = "";
            $(".keyattr").focus();
        }, 100)

    }

    //Key Data Attribute
    getAutoCompleteKeyval(me: any) {
        try {
            var that = this;
            this._autoservice.getAutoData({
                "type": "attribute",
                "search": that.keyattr,
                "filter": "item_attr",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(data => {
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
                    select: function (event, ui) {
                        me.keyattrid = ui.item.value;
                        me.keyattr = ui.item.label;
                    }
                });
            }, err => {
                console.log("Error");
            }, () => {
                // me.keyattrid = 0;
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    KeyvalAdd() {
        try {
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    KeyvalDelete(row) {
        try {
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }


    //Autocompleted Attribute Name
    getAutoCompleteSale(me: any) {
        try {
            var that = this;
            this._autoservice.getAutoData({
                "type": "attribute",
                "search": that.titlesale,
                "filter": "item_attr",
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.login,
                "createdby": this.loginUser.login
            }).subscribe(data => {
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
                    select: function (event, ui) {
                        me.titlesaleid = ui.item.value;
                        me.titlesale = ui.item.label;
                    }
                });
            }, err => {
                console.log("Error");

            }, () => {
                //me.titlesaleid = 0;
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Autocompleted Attribute Name
    getAutoCompletePurc(me: any) {
        try {
            var that = this;
            this._autoservice.getAutoData({
                "type": "attribute",
                "search": that.titlepur,
                "filter": "item_attr",
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.login,
                "createdby": this.loginUser.login
            }).subscribe(data => {
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
                    select: function (event, ui) {
                        me.titlepurid = ui.item.value;
                        me.titlepur = ui.item.label;
                    }
                });
            }, err => {
                console.log("Error");
            }, () => {
                //this.titlepurid = 0;
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Autocompleted Attribute Name
    getAutoCompletesupp(me: any) {
        try {
            var that = this;
            this._autoservice.getAutoData({
                "type": "supplier",
                "search": that.suppname,
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.login,
                "createdby": this.loginUser.login
            }).subscribe(data => {
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
                this.suppid = 0;
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add New Supplier 
    SupplierAdd() {

        try {
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
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

    //Add Accounting Row
    SalesAdd() {
        try {
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
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
        try {
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    ItemsTab() {
        setTimeout(function () {
            this.sales = "";
            this.dis = "";
            this.purch = "";
            this.purdis = "";
            $(".saleattr").focus();
        }, 100);
    }

    getAutoCompleteMate(me: any, arg: number) {
        var _me = this;
        try {
            var duplicateitem = true;
            this._autoservice.getAutoData({
                "type": "material",
                "search": arg == 0 ? me.newmatname : me.matname,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(data => {
                $(".material").autocomplete({
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
                        me.matname = ui.item.label;
                        debugger;
                        if (_me.materialdetail.length > 0) {
                            for (let item of _me.materialdetail) {
                                if (item.matname == me.matname) {
                                    duplicateitem = false;
                                    break;
                                }
                            }
                        }
                        if (duplicateitem === true) {
                            if (arg === 1) {
                                me.matname = ui.item.label;
                                me.matid = ui.item.value;
                            } else {
                                me.newmatname = ui.item.label;
                                me.matid = ui.item.value;
                            }
                        }
                        else {
                            _me._msg.Show(messageType.info, "info", "Duplicate item");
                            return;
                        }

                    }
                });
            }, err => {
                console.log("Error");
            }, () => {
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }

    }

    // MaterialAuto(event) {
    //     try {
    //         let query = event.query;
    //         this._autoservice.getAutoDataGET({
    //             "type": "material",
    //             "cmpid": this.loginUser.cmpid,
    //             "fy": this.loginUser.fy,
    //             "createdby": this.loginUser.login,
    //             "search": query
    //         }).then(data => {
    //             this.MaterialAutodata = data;
    //         });
    //     } catch (e) {
    //         this._msg.Show(messageType.success, "success", e.message);
    //     }

    // }

    MaterialDelete(row) {
        var index = -1;
        for (var i = 0; i < this.materialdetail.length; i++) {
            if (this.materialdetail[i].materialcounter === row.materialcounter) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.materialdetail.splice(index, 1);
        $("#material input").focus();
    }

    // MaterialSelect(event) {
    //     this.matid = event.value;
    //     this.matname = event.label;
    // }

    NewMaterialAdd() {
        if ($("#material input").val() === "") {
            this._msg.Show(messageType.info, "info", "Please Enter Material");
            $("#material input").focus();
            return;
        }
        if (this.qty === 0) {
            this._msg.Show(messageType.info, "info", "Please Enter Quantity");
            $(".qty").focus();
            return;
        }
        if (this.newuom == 0) {
            this._msg.Show(messageType.info, "info", "Please Enter Quantity");
            $(".qty").focus();
            return;
        }
        this.materialdetail.push({
            "matname": this.matname === "" ? this.newmatname : this.matname,
            "matid": this.matid,
            "qty": this.qty,
            "griduomlist": this.griduomlist,
            "id": this.newuom,
            "counter": this.materialcounter
        });

        this.materialcounter++;
        $(".material").val("");
        this.matid = 0;
        this.qty = 0;
        this.newuom = 0;
        $(".material").focus();
    }

    MateTab() {
        setTimeout(function () {
            $("#material").val("");
            $("#material").focus();
        }, 0)
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
        try {
            var Param = {
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "itemsid": this.itemsid,
                "createdby": this.loginUser.login,
                "flag": "Edit",
                "fromdate": null,
                "todate": null
            }
            return Param;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Edit Item
    EditItems(itemsid) {
        try {
            var that = this;
            this.itemsaddServies.EditItem(
                this.EditParamJson()
            ).subscribe(result => {
                console.log(result.data[0][0]);
                var returndata = result.data[0][0];
                that.uploadedFiles = returndata._uploadedfile === null ? [] : returndata._uploadedfile;
                that.suppdoc = returndata._docfile === null ? [] : returndata._docfile;
                that.itemcode = returndata.itemcode;
                that.itemname = returndata.itemname;
                that.isactive = returndata.isactive;
                that.skucode = returndata.skucode;
                that.UoM = returndata.uom;
                that.shelf = returndata.shelflife;
                that.itemsdesc = returndata.itemdesc;
                that.itemsremark = returndata.itemremark;
                that.materialdetail = returndata._materiallist === null ? [] : returndata._materiallist;
                that.attribute.attrlist = returndata._attributejson === null ? [] : returndata._attributejson;
                that.Keyvallist = returndata._keydatajson === null ? [] : returndata._keydatajson;
                that.saleslist = returndata._salesjson === null ? [] : returndata._salesjson;
                that.purchaselist = returndata._purchasejson === null ? [] : returndata._purchasejson;
                that.supplist = returndata._supplierjson === null ? [] : returndata._supplierjson;
                that.editmode = true;
                //Warehouse check edit mode
                if (that.warehouselist.length > 0) {
                    // setTimeout(function () {
                    var wareedit = returndata.warehouse;
                    for (var j = 0; j <= wareedit.length - 1; j++) {
                        var chk = that.warehouselist.find(a => a.id === wareedit[j].id);
                        chk.Warechk = true;
                    }
                    // }, 100)
                }


            }, err => {
                console.log(err);
            }, () => {
                //Complete
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

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
        this.attribute.attrlist = [];
        this.Keyvallist = [];
        this.supplist = [];
        this.uploadedFiles = [];
        this.materialdetail = [];
        this.barcode = "";
        $('.itemcode').removeAttr('disabled');
        $('.itemcode').focus();
    }

    private CreatejsonMaterial() {
        var paramMaterial = [];
        for (let item of this.materialdetail) {
            paramMaterial.push({
                "matid": item.matid,
                "uom": item.id,
                "qty": item.qty
            })
        }
        return paramMaterial;
    }

    //Create Json String in Attribute
    private CreatejsonAttribute() {
        var attrlist = [];
        if (this.attribute.attrlist.length > 0) {
            for (let item of this.attribute.attrlist) {
                attrlist.push({ "id": item.value });
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

    craetLedgerjson() {
        try {
            var ledgerjson = [];
            ledgerjson.push({
                "autoid": 0,
                "wareid": 1,
                "typ": "OB",
                "rate": 0,
                "qty": 0,
                "amt": 0,
                "itemid": 1,
                "outward": 0,
                "fy": this.loginUser.fy,
                "cmpid": this.loginUser.cmpid,
                "createdby": this.loginUser.login,
                "remark": "item Add"
            });
            return ledgerjson;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Parametr With Json
    private ParamJson() {
        try {
            var Param = {
                "itemsid": this.itemsid,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "itemdesc": this.itemsdesc,
                "itemcode": this.itemcode,
                "itemname": this.itemname,
                "skucode": this.skucode,
                "barcode": this.barcode,
                "uom": this.UoM,
                "isactive": this.isactive,
                "shelflife": this.shelf,
                "itemremark": this.itemsremark,
                "keydata": this.Createjsonkeydata(),
                "attr": this.CreatejsonAttribute(),
                "sales": this.CreatejsonSalePrice(),
                "purc": this.CreatejsonPurchasePrice(),
                "supp": this.CreatejsonSupplier(),
                "ware": this.CreatejsonWarehouse(),
                "mate": this.CreatejsonMaterial(),
                "suppdoc": this.suppdoc,
                "ledger": this.craetLedgerjson()
            }
            return Param;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt == "back") {
            this._router.navigate(['supplier/itemsmaster']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
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
            try {
                this.actionButton.find(a => a.id === "save").enabled = false;
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
                        if (this.editmode == true) {
                            this._router.navigate(['supplier/itemsmaster']);
                        }
                        else {
                            this.getAllDropdown();
                            this.editmode = false;
                        }

                    }
                    else {
                        console.log('Error');
                        $(".itemcode").focus();
                        return;
                    }
                }, err => {
                    console.log('Error');
                }, () => {

                });
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
            }
            this.actionButton.find(a => a.id === "save").enabled = true;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".itemcode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".itemname").focus();
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}