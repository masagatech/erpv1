import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { warTransferAddService } from "../../../../_service/wartransfer/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [warTransferAddService, CommonService]                         //Provides Add Service

}) export class WarehouseAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    qty: any = 0;
    docno: number = 0;
    NewItemsName: any = "";
    NewItemsid: any = 0;
    itemsname: any = '';
    itemsid: any = 0;
    counter: number = 0;
    remark: any = "";
    rem: any = "";
    Duplicateflag: boolean;
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    fromwareid: number = 0;
    fromwarname: any = "";
    Towarname: any = "";
    Towarid: number = 0;
    editadd: number = 0;
    rate: any = 0;
    amt: any = 0;
    ratelist: any = [];
    ratelistnew: any = [];
    newrate: any = "";
    isproceed: any = "false";
    isnavigate: any = "false";
    totalqty: any = 0;

    //File Upload
    suppdoc: any = [];
    module: string = "";
    uploadedFiles: any = [];

    asfora: any = 0;
    asforb: any = 0;

    ItemAutodata: any = [];
    FromWHAutodata: any = [];
    ToAutodata: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: warTransferAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Stock Transfer");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.docno = params['id'];
                this.editMode(this.docno);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
        // Check this Ledger True And false
        this.checkLedger();

        setTimeout(function () {
            commonfun.addrequire();
            $(".fromware input").focus();
        }, 0);
    }

    //Check Ledger Table 
    checkLedger() {
        try {
            var that = this;
            that._autoservice.getisproceed({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "keyname": "is_wh_transfer_stock_check",
                "negative": "is_wh_transfer_stock_negative",
                "flag1": "negative",
                "createdby": that.loginUser.login
            }).subscribe(isproc => {
                var returnval = isproc.data;
                that.isnavigate = returnval[0].navigat;
                that.isproceed = returnval[0].val;
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
        }

    }

    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Item AutoExtender
    ItemAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "warehouseTrasnfer",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "warehouse": this.fromwareid,
            "search": query
        }).then(data => {
            this.ItemAutodata = data;
        });
    }

    //Selected Inline Item Selected
    ItemSelect(event, arg) {
        var that = this;
        if (arg === 1) {
            that.itemsname = event.label;
            that.itemsid = event.value;
            if (that.isproceed === 'true') {
                that.ItemsSelected(that.itemsid, 1);
            }
            that.editadd = 1;
        } else {
            that.NewItemsid = event.value;
            that.NewItemsName = event.label;
            if (that.isproceed === 'true') {
                that.ItemsSelected(that.NewItemsid, 0);
            }
            that.editadd = 0;
        }
    }

    //From warehouse Autoextender
    FromWHAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "warehouse",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.FromWHAutodata = data;
        });
    }

    //From warehouse selected
    FromWHSelect(event) {
        this.fromwareid = event.value;
        this.fromwarname = event.label;
    }

    //To warehouse Autoextender
    ToAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "warehouse",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.ToAutodata = data;
        });
    }

    //To warehouse selected
    ToSelect(event) {
        this.Towarid = event.value;
        this.Towarname = event.label;
    }

    // //Inline Items Selected Event
    ItemsSelected(val, flag) {
        try {
            if (val != "") {
                this.wareServies.getwarehouseTransfer({
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "flag": "salesdrop",
                    "itemsid": val,
                    "warehouse": this.fromwareid,
                    "whto": this.Towarid,
                    "createdby": this.loginUser.login
                }).subscribe(itemsdata => {
                    var ItemsResult = itemsdata.data;
                    this.amt = ItemsResult[0].amt;
                    this.remark = ItemsResult[0].itemremark;
                    this.qty = ItemsResult[0].qty;
                    this.totalqty = ItemsResult[0].totalqty;
                    this.asfora = ItemsResult[0]._asfora === null ? 0 : ItemsResult[0]._asfora;
                    this.asforb = ItemsResult[0]._asforb === null ? 0 : ItemsResult[0]._asforb;
                    if (flag == 1) {
                        this.ratelistnew = ItemsResult[0]._ratejosn;
                    }
                    else {
                        this.ratelistnew = ItemsResult[0]._ratejosn;
                        this.newrate = ItemsResult[0].rate;
                    }
                    //}
                }, err => {
                    console.log("Error");
                }, () => {
                    //console.log("Done");
                });
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //AutoCompletd Product Name
    // getAutoCompleteProd(me: any, arg: number) {
    //     var _me = this;
    //     this._autoservice.getAutoData({
    //         "type": "warehouseTrasnfer",
    //         "search": arg == 0 ? me.NewItemsName : me.itemsname,
    //         "cmpid": this.loginUser.cmpid,
    //         "fy": this.loginUser.fy,
    //         "warehouse": this.fromwareid,
    //         "createdby": this.loginUser.login
    //     }).subscribe(data => {
    //         $(".ProdName").autocomplete({
    //             source: data.data,
    //             width: 300,
    //             max: 20,
    //             delay: 100,
    //             minLength: 0,
    //             autoFocus: true,
    //             cacheLength: 1,
    //             scroll: true,
    //             highlight: false,
    //             select: function (event, ui) {
    //                 if (arg === 1) {
    //                     me.itemsname = ui.item.label;
    //                     me.itemsid = ui.item.value;
    //                     if (_me.isproceed === 'true') {
    //                         _me.ItemsSelected(me.Itemsid, 1);
    //                     }
    //                     me.editadd = 1;
    //                 } else {
    //                     me.NewItemsName = ui.item.label;
    //                     me.NewItemsid = ui.item.value;
    //                     if (_me.isproceed === 'true') {
    //                         _me.ItemsSelected(me.NewItemsid, 0);
    //                     }
    //                     me.editadd = 0;
    //                 }
    //             }
    //         });
    //     }, err => {
    //         console.log("Error");
    //     }, () => {
    //         // console.log("Complete");
    //     })
    // }

    //From Warehouse
    // getAutoCompleteWareFrom(me: any) {
    //     var _me = this;
    //     this._autoservice.getAutoData({
    //         "type": "warehouse",
    //         "search": _me.fromwarname,
    //         "cmpid": this.loginUser.cmpid,
    //         "fy": this.loginUser.fy
    //     }).subscribe(data => {
    //         $(".from").autocomplete({
    //             source: data.data,
    //             width: 300,
    //             max: 20,
    //             delay: 100,
    //             minLength: 0,
    //             autoFocus: true,
    //             cacheLength: 1,
    //             scroll: true,
    //             highlight: false,
    //             select: function (event, ui) {
    //                 me.fromwareid = ui.item.value;
    //                 me.fromwarname = ui.item.label;
    //             }
    //         });
    //     }, err => {
    //         console.log("Error");
    //     }, () => {
    //         // console.log("Complete");
    //     })
    // }

    //To Warehouse
    getAutoCompleteWareTO(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.Towarname,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy
        }).subscribe(data => {
            $(".to").autocomplete({
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
                    me.Towarid = ui.item.value;
                    me.Towarname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add New Row
    private NewRowAdd() {

        var that = this;
        var validateme = commonfun.validate();
        if (!validateme.status) {
            this._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }
        if (that.editadd == 1) {
            if (that.itemsname == '' || that.itemsname == undefined) {
                that._msg.Show(messageType.info, "info", "Please Enter items Name");
                return;
            }
        }
        else {
            if (that.NewItemsName == '' || that.NewItemsName == undefined) {
                that._msg.Show(messageType.info, "info", "Please Enter items Name");
                $(".ProdName").focus();
                return;
            }
        }

        if (that.qty == 0 || that.qty == undefined) {
            that._msg.Show(messageType.info, "info", "Please Enter Quntity");
            $(".qty").focus();
            return;
        }

        try {
            debugger;
            that.Duplicateflag = true;
            for (var i = 0; i < that.newAddRow.length; i++) {
                if (that.newAddRow[i].itemsname == that.NewItemsName) {
                    that.Duplicateflag = false;
                    break;
                }
            }
            if (that.Duplicateflag == true) {
                var flagqty = true;
                if (parseInt(that.qty) > parseInt(that.asfora)) {
                    flagqty = that.isnavigate;
                }
                if (flagqty == true) {
                    if (that.editadd == 1) {
                        that.newAddRow.push({
                            "autoid": 0,
                            'itemsname': that.itemsname,
                            "itemsid": that.itemsid,
                            'qty': that.qty,
                            'rate': that.ratelistnew,
                            'amt': that.amt,
                            'asfora': that.asfora,
                            'asforb': that.asforb,
                            'remark': that.remark,
                            'counter': that.counter
                        });
                    }
                    else {
                        that.newAddRow.push({
                            "autoid": 0,
                            'itemsname': that.NewItemsName,
                            'itemsid': that.NewItemsid,
                            'ratelist': that.ratelistnew,
                            'id': that.newrate,
                            'amt': that.amt,
                            'asfora': that.asfora,
                            'asforb': that.asforb,
                            'qty': that.qty,
                            'remark': that.remark,
                            'counter': that.counter
                        });
                    }
                    that.counter++;
                    that.itemsname = "";
                    that.NewItemsName = "";
                    that.qty = 0;
                    that.newrate = 0;
                    that.asfora = 0;
                    that.asforb = 0;
                    that.totalqty = 0;
                    that.amt = "";
                    that.remark = "";
                    $("#foot_custname").focus();
                }
                else {
                    this._msg.Show(messageType.error, "error", "Quantity greater than A");
                    return;
                }
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Items");
                return;
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Delete Row 
    private DeleteRow(item) {
        try {
            var index = -1;
            for (var i = 0; i < this.newAddRow.length; i++) {
                if (this.newAddRow[i].counter === item.counter) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                console.log("Wrong Delete Entry");
            }
            this.newAddRow.splice(index, 1);
            $("#foot_custname").focus();
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    editMode(docno) {
        this.wareServies.getwarehouseTransfer({
            "flag": "edit",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "docno": docno
        }).subscribe(result => {
            debugger;
            this.fromwarname = result.data[0].fromware;
            this.fromwareid = result.data[0].fromid;
            this.Towarname = result.data[0].toware;
            this.Towarid = result.data[0].toid;
            this.rem = result.data[0].remark;
            this.newAddRow = result.data[0].details;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    createItemsjson() {
        var Param = [];
        if (this.newAddRow.length > 0) {
            for (let item of this.newAddRow) {
                var rate = item.ratelist.filter(itemval => itemval.id == item.id);
                Param.push({
                    "autoid": 0,
                    "docno": this.docno,
                    "fromid": this.fromwareid,
                    "toid": this.Towarid,
                    "remark": this.rem,
                    "itemid": item.itemsid,
                    "qty": item.qty,
                    "amt": item.amt,
                    "rateid": item.id,
                    "rate": rate[0].val,
                    "fora": item.asfora,
                    "forb": item.asforb
                })
            }
        }
        return Param;
    }

    //Create Ledger Json 
    ledgerInsert() {
        try {
            var ledgertransfe = [];
            for (let item of this.newAddRow) {
                var rate = item.ratelist.filter(itemval => itemval.id == item.id);
                ledgertransfe.push({
                    "autoid": 0,
                    "ledger": 0,
                    "whid": this.fromwareid,
                    "typ": 'TR',
                    "itemid": item.itemsid,
                    "rate": rate[0].val,
                    "amt": item.amt,
                    "outward": item.qty,
                    "inword": 0,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "createdby": this.loginUser.login
                })
                ledgertransfe.push({
                    "autoid": 0,
                    "ledger": 0,
                    "whid": this.Towarid,
                    "typ": 'TR',
                    "itemid": item.itemsid,
                    "rate": rate[0].val,
                    "amt": item.amt,
                    "inword": item.qty,
                    "outward": 0,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "createdby": this.loginUser.login
                })
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }
        return ledgertransfe;
    }

    //Save Paramter Json
    paramsjson() {
        try {
            var that = this;
            var param = {
                "warehousedetails": this.createItemsjson(),
                "ledgertransfe": this.ledgerInsert(),
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }

        return param;
    }

    //Clear Control
    ClearControl() {
        this.fromwarname = "";
        this.fromwareid = 0;
        this.Towarname = "";
        this.Towarid = 0;
        this.newAddRow = [];
        this.rem = "";
    }

    calculationRow(row: any = []) {
        var culamt = 0;
        var acrate = row.ratelist.filter(item => item.id = row.id);
        if (row.qty != "") {
            culamt = +row.qty * +acrate[0].val;
            row.amt = culamt.toFixed(2);
        }
        else {
            row.amt = "";
        }
    }

    calculationQty(qty: any, rate: any = []) {
        var culamt = 0;
        if (qty != "" && rate != "") {
            var rate = this.ratelistnew.filter(item => item.id == this.newrate);
            culamt = +qty * +rate[0].val;
            this.amt = culamt.toFixed(2);
        }
        else {
            this.amt = "";
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        var that = this;
        //Back Button CLick 
        if (evt === "back") {
            that._router.navigate(['warehouse/warestock/view']);
        }
        //Save Button Click 
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            that.wareServies.saveWarehouse(
                that.paramsjson()
            ).subscribe(result => {
                try {
                    if (result.data[0].funsave_warehousetransfer.maxid > 0) {
                        this._msg.Show(messageType.success, "success", result.data[0].funsave_warehousetransfer.msg + ':' + result.data[0].funsave_warehousetransfer.maxid);
                        $(".from").focus();
                        this.ClearControl();
                        return;
                    }
                } catch (e) {
                    this._msg.Show(messageType.error, "error", e.message);
                    return;
                }
            }, err => {
                console.log("Error");
            }, () => {
                //Completed
            })

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            $(".from").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
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