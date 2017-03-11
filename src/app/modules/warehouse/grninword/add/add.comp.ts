import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { grnInwordService } from "../../../../_service/grninword/grninword-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable, AutoCompleteModule, RadioButtonModule } from 'primeng/primeng';


import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [grnInwordService, CommonService]

}) export class grnInwordAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;



    // local veriable 
    docno: number = 0;
    subdoc: any = "";
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
    inworddetails: any = [];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;


    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private grnServies: grnInwordService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("GRN Inword")
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.docno = params['id'];
                this.Edit(this.docno);
                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });

        setTimeout(function () {
            commonfun.addrequire();
            // var date = new Date();
            // that.lrdatecal.setDate(date);
        }, 0);
        this.getdocumentno();
    }

    //Page Load Event Get Document No 
    getdocumentno() {
        try {
            this.grnServies.getgrninworddetal({
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
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Get type
    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Documenty No Click Event
    GetDetails(item) {
        try {
            this.docno = 0;
            this.grnServies.getgrninworddetal({
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
                this.subdoc = dataset[0][0]._fromwhdetai[0].subdoc;
                this.towh = dataset[0][0].towhdetail[0].towhname;
                this.towhid = dataset[0][0].towhdetail[0].toid;
                this.toemial = dataset[0][0].towhdetail[0].email;
                this.tomob = dataset[0][0].towhdetail[0].mob;
                this.towhadr = dataset[0][0].towhdetail[0].address;
                this.actionButton.find(a => a.id === "save").hide = false;
                this.inworddetails = dataset[1];
            }, err => {
                console.log("Error");
            }, () => {
                //compeletd
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Edit Row 
    Edit(docno) {
        try {
            this.grnServies.getgrninworddetal({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": docno,
                "flag": "edit"
            }).subscribe(result => {
                var dataset = result.data;
                this.fromwh = dataset[0][0]._fromwhdetai[0].fromwhname;
                this.fromwhid = dataset[0][0]._fromwhdetai[0].fromid;
                this.fromemail = dataset[0][0]._fromwhdetai[0].email;
                this.frommob = dataset[0][0]._fromwhdetai[0].mob
                this.fromwhadr = dataset[0][0]._fromwhdetai[0].address;
                this.docdate = dataset[0][0]._fromwhdetai[0].docdate;
                this.docno = docno;
                this.subdoc = dataset[0][0].subdoc;
                this.towh = dataset[0][0].towhdetail[0].towhname;
                this.towhid = dataset[0][0].towhdetail[0].toid;
                this.toemial = dataset[0][0].towhdetail[0].email;
                this.tomob = dataset[0][0].towhdetail[0].mob;
                this.towhadr = dataset[0][0].towhdetail[0].address;
                this.actionButton.find(a => a.id === "save").hide = false;
                this.inworddetails = dataset[1];
            }, err => {
                console.log("Error");
            }, () => {
                //compeletd
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Quntity Culculation
    CulculateQty(row) {
        try {
            if (parseFloat(row.qty) <= parseFloat(row.oldqty)) {
                return row.amount = row.qty * row.rate;
            }
            else {
                this._msg.Show(messageType.error, "error", "Invalid Quntity");
                row.qty = row.oldqty;
                return;
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Total Quntity
    TotalQty() {
        try {
            var tqty = 0;
            for (let item of this.inworddetails) {
                tqty += parseFloat(item.qty);
            }
            return tqty;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Total Amount
    TotalAmt() {
        try {
            var tamt = 0;
            for (let item of this.inworddetails) {
                tamt += parseFloat(item.amount);
            }
            return tamt;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Clear Control
    ClearControl() {
        this.fromwh = "";
        this.fromwhid = 0;
        this.towh = "";
        this.towhid = 0;
        this.remark = "";
        this.inworddetails = [];
        this.fromwhadr = "";
        this.fromemail = "";
        this.frommob = "";
        this.towhadr = "";
        this.toemial = "";
        this.tomob = "";
        this.getdocumentno();
    }

    //Detail Paramter
    paramdetails() {
        try {
            var param = [];
            for (let item of this.inworddetails) {
                param.push({
                    "autoid": item.autoid,
                    "docno": item.docno,
                    "outwordid": item.outwordid,
                    "docdate": this.docdate,
                    "fromid": this.fromwhid,
                    "toid": this.towhid,
                    "itemid": item.itemsid,
                    "qty": item.qty,
                    "rate": item.rate,
                    "rateid": item.rateid,
                    "amt": item.amount,
                    "createdby": this.loginUser.login,
                    "remark": this.remark,
                    "remark1": "",
                    "remark2": "",
                    "remark3": []
                })
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
        return param;
    }

    //Saveing Paramter
    paramjson() {
        try {
            var param = {
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "docno": this.docno,
                "subdoc": this.subdoc,
                "grnindetails": this.paramdetails()
            }
            return param;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControl();
        }
        else if (evt === "back") {
            this._router.navigate(['warehouse/grninword']);
        }
        else if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            try {
                this.actionButton.find(a => a.id === "save").enabled = false;
                this.grnServies.savegrninword(
                    this.paramjson()
                ).subscribe(result => {
                    var dataset = result.data[0];
                    if (dataset.funsave_grninword.maxid > 0) {
                        this._msg.Show(messageType.success, "success", dataset.funsave_grninword.msg);
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
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
            }
            this.actionButton.find(a => a.id === "save").enabled = true;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
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