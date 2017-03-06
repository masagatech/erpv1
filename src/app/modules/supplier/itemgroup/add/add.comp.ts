import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { itemGroupService } from "../../../../_service/itemgroup/itemgroup-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable, AutoCompleteModule, CheckboxModule } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [itemGroupService, CommonService]

}) export class itemgroupAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable
    NewRowAdd: any = [];
    itemcombo: any = "";
    desc: any = "";
    NewItemsName: any = "";
    itemsname: any = "";
    itemsid: number = 0;
    Duplicateflag: boolean;
    rateslist: any = [];
    qty: any = 0;
    dis: any = 0;
    amount: any = 0;
    counter: any = 0;
    newrate: any = 0;
    autoid: number = 0;
    disTotal: any = 0;
    isactive: boolean;
    editmode: boolean = false;
    docno: number = 0;


    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private ItemgroupServies: itemGroupService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _userService: UserService,
        private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Item Group");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            commonfun.addrequire();
            $(".itemconbo").focus();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.docno = params['id'];
                this.EditItem(this.docno);

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

    EditItem(docno) {
        try {
            this.ItemgroupServies.getitemdetail({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "docno": docno,
                "flag": "edit"
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data[0];
                this.itemcombo = ItemsResult[0].itemcombo;
                this.desc = ItemsResult[0].description;
                this.NewRowAdd = itemsdata.data[1];
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Delete Button Click 
    private DeleteRow(val, DcDelid) {
        var index = -1;
        for (var i = 0; i < this.NewRowAdd.length; i++) {
            if (this.NewRowAdd[i].counter === val) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.NewRowAdd.splice(index, 1);
    }

    //AutoCompletd Product Name
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        try {
            var duplicateitem = true;
            this._autoservice.getAutoData({
                "type": "product",
                "search": arg == 0 ? me.NewItemsName : me.itemsname,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
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
                        me.itemsname = ui.item.label;
                        if (_me.NewRowAdd.length > 0) {
                            for (let item of _me.NewRowAdd) {
                                if (item.itemsname == me.itemsname) {
                                    duplicateitem = false;
                                    break;
                                }
                            }
                        }
                        if (duplicateitem === true) {
                            if (arg === 1) {
                                me.itemsname = ui.item.label;
                                me.itemsid = ui.item.value;
                                _me.ItemsSelected(me.itemsid, arg, me.counter);
                            } else {
                                me.NewItemsName = ui.item.label;
                                me.itemsid = ui.item.value;
                                _me.ItemsSelected(me.itemsid, arg, me.counter);
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

    // //Selected Items
    ItemsSelected(val: number, falg: number, counter: number) {
        try {
            if (val != 0) {
                this.ItemgroupServies.getitemdetail({
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "itemsid": val,
                    "flag": "itemdetail",
                    "createdby": this.loginUser.login
                }).subscribe(itemsdata => {
                    var ItemsResult = itemsdata.data[0];
                    if (falg === 0) {
                        this.qty = 1;
                        this.dis = ItemsResult[0].dis;
                        this.rateslist = ItemsResult[0].rates;
                    }
                    else {
                        for (let item of this.NewRowAdd) {
                            if (item.counter == counter) {
                                item.itemsid = val;
                                item.qty = 0;
                                item.rateslist = ItemsResult[0].rates;
                                item.id = "";
                                item.dis = ItemsResult[0].dis;
                                item.amount = 0;
                                break;
                            }
                        }
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    //console.log("Done");
                });
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;
        }
    }

    //Rate Calculation
    ratechange(qty: any, newrate: any = [], dis: any, row: any = [], agr: number) {
        try {
            if (agr == 0) {
                if (qty != "" && newrate != "") {
                    var amt = 0;
                    var rate = this.rateslist.filter(item => item.id == newrate);
                    amt = +qty * +rate[0].val;
                    this.disTotal = amt * this.dis / 100;
                    this.amount = Math.round(amt - this.disTotal);
                }
            }
            else {
                if (row.qty != "" && row.id != "") {
                    this.disTotal = 0;
                    amt = 0;
                    for (let item of this.NewRowAdd) {
                        if (item.counter == row.counter) {
                            var rate = item.rateslist.filter(itemval => itemval.id == row.id);
                            amt = +item.qty * +rate[0].val;
                            this.disTotal = amt * item.dis / 100;
                            item.amount = Math.round(amt - this.disTotal);
                            break;
                        }
                    }
                }
            }

        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
            return;

        }
    }

    //Inline Table Add Item
    AddNewRow() {
        try {

            if (this.itemsname == '' || this.itemsname == undefined) {
                this._msg.Show(messageType.error, "error", "Please Enter items Name");
                return;
            }
            if (this.qty == '' || this.qty == undefined) {
                this._msg.Show(messageType.error, "error", "Please Enter Quntity");
                return;
            }
            if (this.dis > 100) {
                this._msg.Show(messageType.error, "error", "Please Valid discount");
                return;
            }
            this.Duplicateflag = true;
            for (var i = 0; i < this.NewRowAdd.length; i++) {
                if (this.NewRowAdd[i].ItemsName == this.itemsname) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                this.NewRowAdd.push({
                    "autoid": this.autoid,
                    'itemsname': this.itemsname === "" ? this.NewItemsName : this.itemsname,
                    "itemsid": this.itemsid,
                    'qty': this.qty,
                    'rateslist': this.rateslist,
                    'id': this.newrate,
                    'dis': this.dis == "" ? "0" : this.dis,
                    'amount': this.amount,
                    'counter': this.counter
                });
                this.counter++;
                this.itemsname = "";
                this.NewItemsName = "";
                this.rateslist = [];
                this.newrate = "";
                this.qty = "";
                this.dis = 0;
                this.amount = "";
                $(".ProdName").focus();
            }
            else {
                this._msg.Show(messageType.error, "error", "Duplicate Item");
                return;
            }
        }
        catch (e) {
            this._msg.Show(messageType.error, "error", e);
        }
    }

    //Clear Control
    Clearcontrol() {
        this.NewRowAdd = [];
        this.itemcombo = "";
        this.desc = "";
        $(".itemconbo").focus();
    }

    paramjson() {
        try {
            var jsonparam = [];
            for (let item of this.NewRowAdd) {
                var rate = item.rateslist.filter(itemval => itemval.id == item.id)
                jsonparam.push({
                    "autoid": item.autoid,
                    "itemsid": item.itemsid,
                    "qty": item.qty,
                    "rate": rate[0].val,
                    "rateid": rate[0].id,
                    "dis": item.dis,
                    "amount": item.amount
                })
            }
            return jsonparam;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "clear") {
            // this.ClearControll();
        }
        if (evt === "back") {
            this._router.navigate(['supplier/itemgroup']);
        }
        if (evt === "save") {

            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.NewRowAdd.length == 0) {
                this._msg.Show(messageType.error, "error", "Please Enter Items");
                $(".ProdName").focus();
                return;
            }
            try {
                this.actionButton.find(a => a.id === "save").enabled = false;
                this.ItemgroupServies.saveitemgroup({
                    "itemdetail": this.paramjson(),
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "createdby": this.loginUser.login,
                    "itemcombo": this.itemcombo,
                    "desc": this.desc
                }).subscribe(result => {
                    var dataset = result.data;
                    if (dataset[0].funsave_itemgroup.msgid == '-1') {
                        this._msg.Show(messageType.info, "info", dataset[0].funsave_itemgroup.msg);
                        $(".itemconbo").focus();
                    }
                    if (dataset[0].funsave_itemgroup.msgid > 0) {
                        this._msg.Show(messageType.success, "success", dataset[0].funsave_itemgroup.msg);
                        this.Clearcontrol();
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    console.log("Complete");
                })
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
            }
            this.actionButton.find(a => a.id === "save").enabled = true;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".groupcode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".groupName").focus();
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