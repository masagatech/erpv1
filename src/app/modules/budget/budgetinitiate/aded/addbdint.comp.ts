import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addbdint.comp.html',
    providers: [BudgetService, CommonService, FYService, ALSService]
})

export class AddBudgetInitiateComponent implements OnInit {
    loginUser: LoginUserModel;

    bid: number = 0;
    btitle: string = "";
    bobj: string = "";
    fy: number = 0;
    FYDT: any = [];

    @ViewChild("frmdt")
    frmdt: CalendarComp;

    @ViewChild("todt")
    todt: CalendarComp;

    milestoneDT: any = [];
    duplicatemilestone: boolean = true;

    newmsname: string = "";
    newmsdate: string = "";

    //@ViewChild("newmsdate")
    counter: any;

    narration: string = "";
    strength: string = "";
    weakness: string = "";
    opportunity: string = "";
    threat: string = "";

    isactive: boolean = false;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    title: string = "";

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
        this.module = "budget";
        this.getFYDetails();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    getFYDetails() {
        var that = this;

        that._fyservice.getfy({ "flag": "all", "isactive": true }).subscribe(data => {
            that.FYDT = data.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "budget", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;

            if (lockdate != "") {
                that.frmdt.setMinMaxDate(new Date(lockdate), null);
                that.todt.setMinMaxDate(new Date(lockdate), null);
                //that.newmsdate.setMinMaxDate(new Date(lockdate), null);
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.frmdt.initialize(this.loginUser);
        this.frmdt.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        this.todt.initialize(this.loginUser);
        this.todt.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        // this.newmsdate.initialize(this.loginUser);
        // this.newmsdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Journal Voucher > Add");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                var date = new Date();
                this.frmdt.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Journal Voucher > Edit");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.bid = params['id'];
                this.getBudgetDataById(this.bid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("Journal Voucher > Details");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.bid = params['id'];
                this.getBudgetDataById(this.bid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    private isFormChange() {
        return (this.formvals == $("#frmbudget").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveBudgetData(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/budget/edit/', this.bid]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveBudgetData(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/budget']);
        }
    }

    // add budget details

    isDuplicateMilestone() {
        for (var i = 0; i < this.milestoneDT.length; i++) {
            var field = this.milestoneDT[i];

            if (field.msname == this.newmsname) {
                this._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");

                this.newmsname = "";
                this.newmsdate = "";
                return true;
            }
        }

        return false;
    }

    private NewRowAdd() {
        var that = this;

        // Validation

        if (that.newmsname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Milestone");
            return;
        }

        // Duplicate items Check
        that.duplicatemilestone = that.isDuplicateMilestone();

        // Add New Row
        if (that.duplicatemilestone === false) {
            that.milestoneDT.push({
                'counter': that.counter,
                'msname': that.newmsname,
                'msdate': that.newmsdate,
                "isactive": true
            });

            that.counter++;
            that.newmsname = "";
            that.newmsdate = "";

            $(".accname").focus();
        }
    }

    deleteBudgetRow(row) {
        row.isactive = false;
    }

    getAutoComplete(me: any, arg: number) {
        var that = this;

        that._commonservice.getAutoData({ "type": "customer", "cmpid": that.loginUser.cmpid, "search": arg == 0 ? me.newmsname : me.acname }).subscribe(data => {
            $(".accname").autocomplete({
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
                        me.acname = ui.item.label;
                        me.acid = ui.item.value;
                    } else {
                        me.newmsname = ui.item.label;
                        me.newacid = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // get budget master by id

    getBudgetDataById(pbid: number) {
        var that = this;

        that._budgetservice.getBudget({ "flag": "edit", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "bid": pbid }).subscribe(data => {
            var _budgetdata = data.data[0]._budgetdata;
            var _budgetdetails = data.data[0]._budgetdetails;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.bid = _budgetdata[0].bid;

            var date = new Date(_budgetdata[0].docdate);
            that.frmdt.setDate(date);
            that.narration = _budgetdata[0].narration;
            that.isactive = _budgetdata[0].isactive;

            that.milestoneDT = _budgetdetails;

            that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            that.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // save budget

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        var that = this;

        for (var i = 0; i < e.length; i++) {
            that.suppdoc.push({ "id": e[i].id });
        }

        that.actionButton.find(a => a.id === "save").enabled = true;
    }

    saveBudgetData(isactive: boolean) {
        var that = this;

        if (that.isFormChange()) {
            that._msg.Show(messageType.info, "info", "No save! There is no change!");
            return;
        };

        var validateme = commonfun.validate();

        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        if (that.milestoneDT.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Account Details");
        }

        var savebudget = {
            "bid": that.bid,
            "bobj": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "frmdt": that.frmdt.getDate(),
            "todt": that.todt.getDate(),
            "milestone": that.milestoneDT,
            "narration": that.narration,
            "strength": that.strength,
            "weakness": that.weakness,
            "opportunity": that.opportunity,
            "threat": that.threat,
            "uidcode": that.loginUser.login,
            "suppdoc": that.suppdoc.length === 0 ? null : that.suppdoc,
            "isactive": isactive
        }

        that.duplicatemilestone = that.isDuplicateMilestone();

        if (that.duplicatemilestone == false) {
            that._budgetservice.saveBudget(savebudget).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_budget.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_budget.msg);
                    that._router.navigate(['/accounts/budget']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_budget.msg);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    removeFileUpload() {
        this.uploadedFiles.splice(0, 1);
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}