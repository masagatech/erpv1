import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { WarAddOpbal } from "../../../../_service/wareopeningbal/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [WarAddOpbal, CommonService, ALSService]

}) export class WareopebalAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    Openinglist: any = [];
    warehousename: any = "";
    warehouseid: any = 0;
    remark: any = "";

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("openstock")
    openstock: CalendarComp;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private opeingServies: WarAddOpbal, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService, private _alsservice: ALSService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "os", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.openstock.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.openstock.initialize(this.loginUser);
        this.openstock.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Opening Stock");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".ware").focus();

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.warehouseid = params['id'];
                this.editMode(this.warehouseid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                var date = new Date();
                this.openstock.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    ItemsSelected(val: number) {
        try {
            this.Openinglist = [];
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (val != 0) {
                this.opeingServies.getopeningstock({
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy,
                    "flag": "wardetails",
                    "wareid": val,
                    "createdby": this.loginUser.login
                }).subscribe(itemsdata => {
                    var ItemsResult = itemsdata.data;
                    if (ItemsResult[0].length > 0) {
                        this.Openinglist = ItemsResult[0];
                    }
                    else {
                        this.Openinglist = ItemsResult[1];
                    }
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

    loadRBIGrid(event: LazyLoadEvent) {
    }

    getAutoCompleteWare(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.warehousename,
            "cmpid": _me.loginUser.cmpid
        }).subscribe(data => {
            $(".ware").autocomplete({
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
                    me.warehouseid = ui.item.value;
                    me.warehousename = ui.item.label;
                    me.ItemsSelected(me.warehouseid);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    editMode(whid: number) {
        this.opeingServies.getopeningstock({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "wardetails",
            "wareid": whid,
            "createdby": this.loginUser.login
        }).subscribe(itemsdata => {
            var ItemsResult = itemsdata.data;
            if (ItemsResult.length > 0) {
                this.warehouseid = ItemsResult[1][0].whid;
                this.warehousename = ItemsResult[1][0].whname;
                this.remark = ItemsResult[1][0].remark;
                this.openstock.setDate(new Date(ItemsResult[1][0].opendate));
                this.Openinglist = ItemsResult[0];
            }
        }, err => {
            console.log("Error");
        }, () => {
            //console.log("Done");
        });
    }

    ratechange(row: any = []) {
        if (row.id != undefined) {
            var culamt = 0;
            var rateval = row.rate.filter(item => item.id == row.id);
            if (row.qty != "") {
                culamt = +row.qty * +rateval[0].val;
                row.amt = culamt.toFixed(2);
            }
            else {
                row.amt = "";
            }
        }
    }

    tablejson() {
        var that = this;
        try {
            var opestock = [];
            for (let item of that.Openinglist) {
                if (item.qty != "") {
                    var rate = item.rate.filter(itemval => itemval.id == item.id);
                    opestock.push({
                        "autoid": item.autoid === null ? 0 : item.autoid,
                        "ledger": item.ledger === null ? 0 : item.ledger,
                        "itemid": item.value,
                        "rateid": item.rate[0].id,
                        "rate": rate[0].val,
                        "inword": item.qty,
                        "outward": 0,
                        "typ": "OB",
                        "fy": this.loginUser.fy,
                        "cmpid": this.loginUser.cmpid,
                        "createdby": this.loginUser.login,
                        "amt": item.amt,
                        "rem": item.remark,
                        "whid": that.warehouseid,
                        "opedate": this.openstock.getDate(),
                        "remark": that.remark
                    })
                }
            }
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
        }

        return opestock;
    }

    Paramter() {
        var param = {
            "openstockdetails": this.tablejson(),
            "fy": this.loginUser.fy,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login
        }
        console.log(param);
        return param;
    }

    ClearControll() {
        this.warehousename = "";
        this.warehouseid = 0;
        this.remark = "";
        this.Openinglist = [];
        $(".ware").focus();
    }

    //Delete Row 
    private DeleteRow(item) {
        try {
            var index = -1;
            for (var i = 0; i < this.Openinglist.length; i++) {
                if (this.Openinglist[i].itemname === item.itemname) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                console.log("Wrong Delete Entry");
            }
            this.Openinglist.splice(index, 1);
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/openingbal']);
        }
        if (evt === "clear") {
            this.ClearControll();
        }
        if (evt === "save") {
            try {
                var validateme = commonfun.validate();
                if (!validateme.status) {
                    this._msg.Show(messageType.error, "error", validateme.msglist);
                    validateme.data[0].input.focus();
                    return;
                }
                this.opeingServies.saveopeningstock(
                    this.Paramter()
                ).subscribe(result => {
                    if (result.data[0].funsave_wareopeningstock.maxid > 0) {
                        this._msg.Show(messageType.success, "success", result.data[0].funsave_wareopeningstock.msg + ':' +result.data[0].funsave_wareopeningstock.maxid);
                        this.ClearControll();
                    }
                    else {
                        console.log(result.data[0]);
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    //console.log("Done");
                });
            } catch (e) {
                this._msg.Show(messageType.error, "error", e);
            }
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".code").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".ware").focus();
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