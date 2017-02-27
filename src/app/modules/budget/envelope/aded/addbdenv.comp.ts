import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addbdenv.comp.html',
    providers: [BudgetService]
})

export class AddEnvelopeComp implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    BudgetDT: any = [];
    envelopeDT: any = [];

    envRowData: any = [];
    duplicateenv: boolean = true;

    bid: number = 0;
    newbeid: number = 0;
    envtype: string = "";
    coaid: number = 0;
    coaname: string = "";
    newenvtitle: string = "";

    counter: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _budgetservice: BudgetService, private _userService: UserService, private _msg: MessageService) {
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
        this.setActionButtons.setTitle("Envelope");

        this.setBudgetEnvelope();

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    // add, edit, delete button

    private isFormChange() {
        return (this.formvals == $("#frmbudget").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveEnvelopeData();
        } else if (evt === "edit") {
            this._router.navigate(['/budget/envelope/edit', this.bid]);
        } else if (evt === "back") {
            this._router.navigate(['/budget/envelope']);
        }
    }

    setBudgetEnvelope() {
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Budget Envelope");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', false);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Budget Envelope");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.getEnvelopeData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else {
                this.setActionButtons.setTitle("Details Of Budget Envelope");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.getEnvelopeData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
            }
        });
    }

    fillBudgetDropDown() {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "dropdown", "search": "" }).subscribe(data => {
            that.BudgetDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    isDuplicateEnvelope() {
        for (var i = 0; i < this.envRowData.length; i++) {
            var field = this.envRowData[i];

            if (field.envtitle == this.newenvtitle) {
                this._msg.Show(messageType.error, "Error", "Duplicate Envelope not Allowed");
                this.newenvtitle = "";
                return true;
            }
        }

        return false;
    }

    getAutoCOA(me: any) {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "autocoa", "search": me.coaname }).subscribe(data => {
            $(".coaname").autocomplete({
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
                    me.coaname = ui.item.label;
                    me.coaid = ui.item.value;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    private addBudgetEnvelope() {
        var that = this;

        // Duplicate Envelope Check
        that.duplicateenv = that.isDuplicateEnvelope();

        // Add New Row
        if (that.duplicateenv === false) {
            that.envRowData.push({
                'counter': that.counter,
                'bid': that.bid,
                'beid': that.newbeid,
                'coaid': that.coaid,
                'coaname': that.coaname,
                'envtype': that.envtype,
                'envtitle': that.newenvtitle,
                'uidcode': that.loginUser.login,
                "isactive": true
            });

            that.counter++;
            that.newbeid = 0;
            that.newenvtitle = "";

            $(".envtitle").focus();
        }
    }

    deleteBudgetEnvelope(row) {
        row.isactive = false;
    }

    // get Envelope by ID

    getEnvelopeData(pbid) {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "edit", "bid": pbid }).subscribe(data => {
            if (data.data.length !== 0) {
                that.envtype = data.data[0].envtype;
                that.coaid = data.data[0].coaid;
                that.coaname = data.data[0].coaname;
                that.envRowData = data.data;
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // save budget

    saveEnvelopeData() {
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

        if (that.envRowData.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Envelope Details");
            return;
        }

        var saveEnvelope = {
            "envelope": that.envRowData
        }

        that._budgetservice.saveEnvelope(saveEnvelope).subscribe(data => {
            try {
                var dataResult = data.data;

                if (dataResult[0].funsave_bdgenv.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bdgenv.msg);
                    that._router.navigate(['/budget/envelope']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bdgenv.msg);
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

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}