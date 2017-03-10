import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { grnOutwordService } from "../../../../_service/grnoutword/grnoutword-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable, AutoCompleteModule, RadioButtonModule } from 'primeng/primeng';


import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [grnOutwordService, CommonService, ALSService]

}) export class grnoutwordAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;



    // local veriable 
    docno: number = 0;
    newdocno: number = 0;
    docdate: any = "";
    doclist: any = [];
    fromwh: any = "";
    fromwhid: number = 0;
    fromemail: any = "";
    frommob: any = "";
    towh: any = "";
    towhid: number = 0;
    toemial: any = "";
    tomob: any = "";
    remark: any = "";
    fromwhadr: any = "";
    towhadr: any = "";
    transferdetails: any = [];
    transname: any = "";
    transid: number = 0;
    lrno: any = 0;
    lrdate: any = "";
    paid: any = "paid";
    amount: any = 0;
    radioflag: boolean = false;
    // ToWarehouseAutodata: any = [];
    // FromWarehouseAutodata: any = [];
    TranspoterAutodata: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;


    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private grnServies: grnOutwordService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "jv", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.lrdatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {




        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("GRN Outword")
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

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

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
        this.actionButton.find(a => a.id === "save").hide = true;

        setTimeout(function () {
            commonfun.addrequire();
            // var date = new Date();
            // that.lrdatecal.setDate(date);
        }, 0);
        this.getdocumentno();
    }

    //Page Load Event Get Document No 
    getdocumentno() {
        this.grnServies.getgrndetal({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "docno"
        }).subscribe(result => {
            this.doclist = result.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            //compeletd
        })
    }

    //Get type
    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Transpoter Auto Extender
    TranspoterAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "transpoter",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.TranspoterAutodata = data;
        });
    }

    //Transpoter Selectec
    TranspoterSelect(event) {
        this.transid = event.value;
        this.transname = event.label;
    }

    //Documenty No Click Event
    GetDetails(item) {
        this.grnServies.getgrndetal({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "docno": item.docno,
            "flag": ""
        }).subscribe(result => {
            var dataset = result.data;

            this.fromwh = dataset[0][0]._fromwhdetai[0].fromwhname;
            this.fromwhid = dataset[0][0]._fromwhdetai[0].fromid;
            this.fromemail = dataset[0][0]._fromwhdetai[0].email;
            this.frommob = dataset[0][0]._fromwhdetai[0].mob
            this.fromwhadr = dataset[0][0]._fromwhdetai[0].address;
            this.docdate = dataset[0][0]._fromwhdetai[0].docdate;
            this.docno = item.docno;

            this.towh = dataset[0][0].towhdetail[0].towhname;
            this.towhid = dataset[0][0].towhdetail[0].toid;
            this.toemial = dataset[0][0].towhdetail[0].email;
            this.tomob = dataset[0][0].towhdetail[0].mob;
            this.towhadr = dataset[0][0].towhdetail[0].address;
            this.actionButton.find(a => a.id === "save").hide = false;

            this.transferdetails = dataset[1];
        }, err => {
            console.log("Error");
        }, () => {
            //compeletd
        })
    }

    //Quntity Culculation
    CulculateQty(row) {
        return row.amount = row.qty * row.rate;
    }

    //Total Quntity
    TotalQty() {
        var tqty = 0;
        for (let item of this.transferdetails) {
            tqty += parseFloat(item.qty);
        }
        return tqty;
    }

    //Total Amount
    TotalAmt() {
        var tamt = 0;
        for (let item of this.transferdetails) {
            tamt += parseFloat(item.amount);
        }
        return tamt;
    }

    //Clear Control
    ClearControl() {
        this.fromwh = "";
        this.fromwhid = 0;
        this.towh = "";
        this.towhid = 0;
        this.remark = "";
        this.transferdetails = [];
        this.fromwhadr = "";
        this.fromemail = "";
        this.frommob = "";
        this.towhadr = "";
        this.toemial = "";
        this.tomob = "";
        $("#docdate").val("");
        this.getdocumentno();
    }

    //Detail Paramter
    paramdetails() {
        var param = [];
        for (let item of this.transferdetails) {
            param.push({
                "autoid": 0,
                "docno": item.docno,
                "docdate": this.docdate,
                "fromid": this.fromwhid,
                "toid": this.towhid,
                "itemid": item.itemsid,
                "qty": item.qty,
                "rate": item.rate,
                "rateid": item.rateid,
                "amt": item.amount,
                "transid": this.transid,
                "tranferid": item.transferid,
                "lrno": this.lrno,
                "lrdate": this.docdate,
                "transamt": this.paid === "Paid" ? 0 : this.amount,
                "paid": this.paid === "Paid" ? true : false,
                "createdby": this.loginUser.login,
                "remark": this.remark,
                "remark1": "",
                "remark2": "",
                "remark3": []
            })
        }
        return param;
    }

    //Saveing Paramter
    paramjson() {
        var param = {
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "docno": this.docno,
            "newdocno":this.newdocno,
            "grndetails": this.paramdetails()
        }
        console.log(param);
        return param;
    }

    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControl();
        }
        else if (evt === "back") {
            this._router.navigate(['warehouse/grnoutword']);
        }
        else if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.transid == 0) {
                this._msg.Show(messageType.error, "error", "Please Select Transpoter");
                $(".trans input").focus();
                return;
            }
            if (this.lrno == "0") {
                this._msg.Show(messageType.error, "error", "Please Enter LR No");
                $("#lrno").focus();
                return;
            }
            if (this.paid == "tobepaid" && this.amount == 0) {
                this._msg.Show(messageType.error, "error", "Please Enter Amount");
                $(".amount").focus();
                return;
            }
            this.actionButton.find(a => a.id === "save").enabled = false;
            this.grnServies.savegrnoutword(
                this.paramjson()
            ).subscribe(result => {
                var dataset = result.data[0];
                if (dataset.funsave_grnoutword.maxid > 0) {
                    this._msg.Show(messageType.success, "success", dataset.funsave_grnoutword.msg);
                    this.ClearControl();
                }
                else {
                    this._msg.Show(messageType.error, "error", "Data Not Saveing");
                }
            }, err => {
                console.log("Error");
            }, () => {
                //compeletd
            })
            this.actionButton.find(a => a.id === "save").enabled = true;
        } else if (evt === "edit") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("")
    }

}