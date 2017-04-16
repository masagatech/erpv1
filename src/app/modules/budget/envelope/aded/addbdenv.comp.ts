import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CommonService } from '../../../../_service/common/common-service'
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addbdenv.comp.html',
    providers: [BudgetService, CommonService]
})

export class AddEnvelopeComp implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    autocoaDT: any = [];
    BudgetDT: any = [];
    envelopeDT: any = [];

    duplicatesubitems: boolean = true;

    beid: number = 0;
    bid: number = 0;
    envtitle: string = "";
    coaid: number = 0;
    coaname: string = "";

    subitems: any = [];
    newsubitem: string = "";

    counter: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _budgetservice: BudgetService, private _userService: UserService, private _autoservice: CommonService, private _msg: MessageService) {
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
            this._router.navigate(['/budget/envelope/edit', this.beid]);
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

                this.beid = params['id'];
                this.getEnvelopeData(this.beid);

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

                this.beid = params['id'];
                this.getEnvelopeData(this.beid);

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

    isDuplicateSubItems() {
        for (var i = 0; i < this.subitems.length; i++) {
            var field = this.subitems[i];

            if (field.envtitle == this.newsubitem) {
                this._msg.Show(messageType.error, "Error", "Duplicate Sub Items not Allowed");
                this.newsubitem = "";
                return true;
            }
        }

        return false;
    }

    //AutoCompletd Customer
    getAutoCOA(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "acgroup",
            "search": query
        }).then(data => {
            this.autocoaDT = data;
        });
    }

    //Selected Customer
    selectAutoCOA(event) {
        this.coaid = event.value;
        this.coaname = event.label;
    }

    private addSubItems() {
        var that = this;

        // Duplicate Sub Items Check
        that.duplicatesubitems = that.isDuplicateSubItems();

        // Add New Row
        if (that.duplicatesubitems === false) {
            that.subitems.push({
                'subitem': that.newsubitem
            });

            that.counter++;
            that.newsubitem = "";

            $(".subitem").focus();
        }
    }

    deleteSubItem(row) {
        this.subitems.splice(this.subitems.indexOf(row), 1);
    }

    // get Envelope by ID

    getEnvelopeData(pbeid) {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "edit", "beid": pbeid }).subscribe(data => {
            if (data.data.length !== 0) {
                that.bid = data.data[0].bid;
                that.envtitle = data.data[0].envtitle;
                that.coaid = data.data[0].coaid;
                that.coaname = data.data[0].coaname;
                that.subitems = data.data[0].subitems;
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

        if (that.subitems.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Envelope Details");
            return;
        }

        var saveEnvelope = {
            "beid": that.beid,
            "envtitle": that.envtitle,
            "bid": that.bid,
            "coaid": that.coaid,
            "coaname": that.coaname,
            "subitems": that.subitems,
            "uidcode": that.loginUser.login,
            "isactive": true
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