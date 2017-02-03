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
    opedate: any = "";

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("jvdate")
    jvdate: CalendarComp;

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
                that.jvdate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.jvdate.initialize(this.loginUser);
        this.jvdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".ware").focus();

        setTimeout(function () {
            var date = new Date();
            var opeingdate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#opedate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#opedate").datepicker('setDate', opeingdate);
            commonfun.addrequire();
        }, 0);



        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                // this.docno = params['id'];
                // this.editMode(this.docno);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                var date = new Date();
                this.jvdate.setDate(date);
                
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    ItemsSelected(val: number) {
        this.Openinglist = [];
        if (val != 0) {
            this.opeingServies.getopeningstock({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "flag": "wardetails",
                "wareid": val,
                "createdby": this.loginUser.login
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data;
                if (ItemsResult.length > 0) {
                    this.Openinglist = ItemsResult;
                }
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        }
    }

    getAutoCompleteWare(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "warehouse", "search": _me.warehousename, "cmpid": _me.loginUser.cmpid }).subscribe(data => {
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

    ratechange(row: any = []) {
        if (row.qty > 0) {
            row.amt = row.qty * row.ratename.split(':')[1];
        }
    }

    tablejson() {
        var that = this;
        var opestock = [];
        for (let item of that.Openinglist) {
            if (item.qty != "") {
                opestock.push({
                    "autoid": item.autoid,
                    "itemid": item.value,
                    "rate": item.ratename.split(':')[0],
                    "qty": item.qty,
                    "typ": "OB",
                    "amt": item.amt,
                    "rem": item.remark,
                    "wareid": that.warehouseid,
                    "opedate": $('#opedate').datepicker('getDate'),
                    "remark": that.remark,
                    "fy": that.loginUser.fy,
                    "cmpid": that.loginUser.cmpid,
                    "createdby": that.loginUser.login
                })
            }

        }
        return opestock;
    }

    Paramter() {
        var param = {
            "openstockdetails": this.tablejson()
        }
        return param;
    }

    ClearControll() {
        this.warehousename = "";
        this.warehouseid = 0;
        this.remark = "";
        this.Openinglist = [];
        $(".ware").focus();
    }


    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/openingbal']);
        }
        if (evt === "save") {
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
                    alert("Data Save Successfully");
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
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
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