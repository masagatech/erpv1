import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseAddService } from "../../../../_service/warehousestock/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [WarehouseAddService, CommonService]                         //Provides Add Service

}) export class WarehouseAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    qty: number = 0;
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
    newrate: any = 0;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarehouseAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".from").focus();
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
    }

    // //Selected Items
    ItemsSelected(val, flag) {
        if (val != "") {
            this.wareServies.getwarehouseTransfer({
                "cmpid": 1,
                "fy": 5,
                "flag": "salesdrop",
                "itemsid": val,
                "warehouse": this.fromwareid,
                "createdby": ""
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data;
                this.amt = ItemsResult[0].amt;
                this.remark = ItemsResult[0].itemremark;
                this.qty = ItemsResult[0].qty;
                //this.ratelistnew=ItemsResult[0].rate;
                if (flag == 1) {
                    //this.ratelist = ItemsResult[0].sales;
                    this.ratelistnew = ItemsResult[0]._ratejosn;
                }
                else {
                    //this.ratelistnew = ItemsResult[0].sales;
                    this.ratelistnew = ItemsResult[0]._ratejosn;
                }
                this.newrate = ItemsResult[0].rate;
                //}
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        }
    }

    //AutoCompletd Product Name
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouseTrasnfer",
            "search": arg == 0 ? me.NewItemsName : me.itemsname,
            "cmpid": 1,
            "fy": 5,
            "warehouse": this.fromwareid
        }).subscribe(data => {
            $(".ProdName").autocomplete({
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
                    if (arg === 1) {
                        me.itemsname = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid, 1);
                        me.editadd = 1;
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsid = ui.item.value;
                        _me.ItemsSelected(me.NewItemsid, 0);
                        me.editadd = 0;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //From Warehouse
    getAutoCompleteWareFrom(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "warehouse", "search": _me.fromwarname }).subscribe(data => {
            $(".from").autocomplete({
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
                    me.fromwareid = ui.item.value;
                    me.fromwarname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //To Warehouse
    getAutoCompleteWareTO(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "warehouse", "search": _me.Towarname }).subscribe(data => {
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
        if (that.editadd == 1) {
            if (that.itemsname == '' || that.itemsname == undefined) {
                this._msg.Show(messageType.info, "info", "Please Enter items Name");
                return;
            }
        }
        else {
            if (that.NewItemsName == '' || that.NewItemsName == undefined) {
                this._msg.Show(messageType.info, "info", "Please Enter items Name");
                $(".ProdName").focus();
                return;
            }
        }

        if (this.fromwarname == this.Towarname) {
            this._msg.Show(messageType.info, "info", "Warehouse from and to same");
            $(".to").focus();
            return;
        }

        if (that.qty == 0 || that.qty == undefined) {
            this._msg.Show(messageType.info, "info", "Please Enter Quntity");
            $(".qty").focus();
            return;
        }
        that.Duplicateflag = true;
        for (var i = 0; i < that.newAddRow.length; i++) {
            if (that.newAddRow[i].itemsname == that.NewItemsName) {
                that.Duplicateflag = false;
                break;
            }
        }
        if (that.Duplicateflag == true) {
            if (that.editadd == 1) {
                that.newAddRow.push({
                    "autoid": 0,
                    'itemsname': that.itemsname,
                    "itemsid": that.itemsid,
                    'qty': that.qty,
                    'rate': that.rate,
                    'amt': that.amt,
                    'remark': that.remark,
                    'counter': that.counter
                });
            }
            else {
                that.newAddRow.push({
                    "autoid": 0,
                    'itemsname': that.NewItemsName,
                    "itemsid": that.NewItemsid,
                    'rate': that.newrate,
                    'amt': that.amt,
                    'qty': that.qty,
                    'remark': that.remark,
                    'counter': that.counter
                });
            }

            that.counter++;
            that.itemsname = "";
            that.NewItemsName = "";
            that.qty = 0;
            that.newrate = "";
            that.amt = "";
            that.remark = "";
            $("#foot_custname").focus();
        }
        else {
            this._msg.Show(messageType.info, "info", "Duplicate Items");
            return;
        }

    }

    //Delete Row 
    private DeleteRow(item) {
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
    }

    editMode(docno) {
        this.wareServies.getwarehouseTransfer({
            "flag": "edit",
            "cmpid": 1,
            "fy": 5,
            "docno": docno
        }).subscribe(result => {
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
        var itemjson = [];
        if (this.newAddRow.length > 0) {
            for (let item of this.newAddRow) {
                itemjson.push({ "id": item.itemsid, "val": item.qty })
            }
        }
        return itemjson;
    }

    paramsjson() {
        var that = this;
        var param = {
            "docno": that.docno,
            "fromid": that.fromwareid,
            "toid": that.Towarid,
            "remark": that.rem,
            "cmpid": 1,
            "fy": 5,
            "createdby": "admin",
            "warehousedetails": this.createItemsjson()
        }
        return param;
    }

    ClearControl() {
        this.fromwarname = "";
        this.fromwareid = 0;
        this.Towarname = "";
        this.Towarid = 0;
        this.newAddRow = [];
        this.rem = "";
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
            if (that.fromwarname == "") {
                this._msg.Show(messageType.info, "info", "Please Enetr From Warehouse");
                $(".from").focus();
                return;
            }
            if (that.Towarname == "") {
                this._msg.Show(messageType.info, "info", "Please Enetr To Warehouse");
                $(".to").focus();
                return;
            }
            that.wareServies.saveWarehouse(
                that.paramsjson()
            ).subscribe(result => {
                if (result.data[0].funsave_warehousetransfer.maxid > 0) {
                    this._msg.Show(messageType.success, "success", result.data[0].funsave_warehousetransfer.msg);
                    $(".from").focus();
                    this.ClearControl();
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
    }
}