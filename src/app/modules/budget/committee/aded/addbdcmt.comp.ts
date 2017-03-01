import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addbdcmt.comp.html',
    providers: [BudgetService, CommonService, FYService, ALSService]
})

export class AddCommitteeComp implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    committeeDT: any = [];
    duplicatecommittee: boolean = true;

    BudgetDT: any = [];

    bid: number = 0;
    newbcid: number = 0;
    newempid: number = 0;
    newempname: string = "";
    newrole: string = "";
    resp: string = "";

    counter: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _budgetservice: BudgetService, private _userService: UserService, private _commonservice: CommonService, private _msg: MessageService,
        private _fyservice: FYService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.fillBudgetDropDown();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.setActionButtons.setTitle("Committee");

        this.setBudgetCommittee();

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    // add, edit, delete button

    private isFormChange() {
        return (this.formvals == $("#frmbudget").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveCommitteeData("edit", true);
        } else if (evt === "edit") {
            this._router.navigate(['/budget/committee/edit', this.bid]);
        } else if (evt === "back") {
            this._router.navigate(['/budget/committee']);
        }
    }

    setBudgetCommittee() {
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Budget Committee");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', false);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Budget Committee");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.getCommitteeData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else {
                this.setActionButtons.setTitle("Details Of Budget Committee");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.getCommitteeData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
            }
        });
    }

    fillBudgetDropDown() {
        var that = this;

        that._budgetservice.getCommittee({ "flag": "dropdown" }).subscribe(data => {
            that.BudgetDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    // add committee details

    isDuplicateCommittee() {
        for (var i = 0; i < this.committeeDT.length; i++) {
            var field = this.committeeDT[i];

            if (field.msname == this.newempname) {
                this._msg.Show(messageType.error, "Error", "Duplicate Committee not Allowed");

                this.newempname = "";
                this.newrole = "";
                return true;
            }
        }

        return false;
    }

    private addCommittee() {
        var that = this;

        // Validation
        if (that.newempname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Committee");
            return;
        }

        // Duplicate items Check
        that.duplicatecommittee = that.isDuplicateCommittee();

        // Add New Row
        if (that.duplicatecommittee === false) {
            that.committeeDT.push({
                "counter": that.counter,
                "bcid": "0",
                "empid": that.newempid,
                "empname": that.newempname,
                "role": that.newrole,
                "isactive": true
            });

            that.counter++;
            that.newempid = 0;
            that.newempname = "";
            that.newrole = "";

            $(".empname").focus();
        }
    }

    deleteCommittee(row) {
        row.isactive = false;
    }

    getEmpAuto(me: any, arg: number) {
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": arg == 0 ? me.newempname : me.empname }).subscribe(data => {
            $(".empname").autocomplete({
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
                        me.empname = ui.item.label;
                        me.empid = ui.item.value;
                    } else {
                        me.newempname = ui.item.label;
                        me.newempid = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    // get Committee by ID

    getCommitteeData(pbid) {
        var that = this;

        that._budgetservice.getCommittee({ "flag": "edit", "bid": pbid }).subscribe(data => {
            var _committeedata = data.data;

            if (_committeedata.length !== 0) {
                that.committeeDT = _committeedata;
                that.resp = _committeedata[0].resp;
            }
            else {
                that.committeeDT = [];
                that.resp = "";
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    // save budget

    saveCommitteeData(flag, isactive) {
        var that = this;
        var bdcmtDT: any = [];

        if (that.isFormChange()) {
            that._msg.Show(messageType.info, "info", "No save! There is no change!");
            return;
        };

        var validateme = commonfun.validate();

        if (!validateme.status) {
            that._msg.Show(messageType.error, "Error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        if (that.committeeDT.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Committee Details");
            return;
        }

        that.duplicatecommittee = that.isDuplicateCommittee();

        for (var i = 0; i < that.committeeDT.length; i++) {
            bdcmtDT.push({
                "bcid": that.committeeDT[i].bcid,
                "bid": that.bid,
                "empid": that.committeeDT[i].empid,
                "empname": that.committeeDT[i].empname,
                "role": that.committeeDT[i].role,
                "resp": that.resp,
                "uidcode": that.loginUser.login,
                "isactive": that.committeeDT[i].isactive,
            });
        }

        if (that.duplicatecommittee == false) {
            that._budgetservice.saveCommittee({ "committee": bdcmtDT }).subscribe(data => {
                try {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_bdgcmt.msgid != "-1") {
                        that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bdgcmt.msg);
                        that._router.navigate(['/budget/committee']);
                    }
                    else {
                        that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bdgcmt.msg);
                    }
                }
                catch (e) {
                    that._msg.Show(messageType.error, "Error", e.message);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}