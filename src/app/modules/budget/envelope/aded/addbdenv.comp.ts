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

export class AddEnvelopeComp implements OnInit {
    loginUser: LoginUserModel;

    BudgetDT: any = [];
    envelopeDT: any = [];

    envRowData: any = [];
    duplicatecoa: boolean = true;

    bid: number = 0;
    newbeid: number = 0;
    newcoaid: number = 0;
    newcoaname: string = "";
    newenvtitle: string = "";

    counter: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _budgetservice: BudgetService, private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillBudgetDropDown();
        //this.fillCOAGrid();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.setActionButtons.setTitle("Envelope");

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

    fillBudgetDropDown() {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "dropdown" }).subscribe(data => {
            that.BudgetDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    isDuplicateCOA() {
        for (var i = 0; i < this.envRowData.length; i++) {
            var field = this.envRowData[i];

            if (field.coaid == this.newcoaid) {
                this._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");

                this.newcoaid = 0;
                this.newcoaname = "";
                this.newenvtitle = "";
                return true;
            }
        }

        return false;
    }

    getAutoCOA(me: any, arg: number) {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "autocoa", "search": arg == 0 ? me.newcoaname : me.coaname }).subscribe(data => {
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
                    if (arg === 1) {
                        me.coaname = ui.item.label;
                        me.coaid = ui.item.value;
                    } else {
                        me.newcoaname = ui.item.label;
                        me.newcoaid = ui.item.value;
                    }
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

        // Validation

        if (that.newcoaname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Chart of Accounts");
            return;
        }

        // Duplicate items Check
        that.duplicatecoa = that.isDuplicateCOA();

        // Add New Row
        if (that.duplicatecoa === false) {
            that.envRowData.push({
                'counter': that.counter,
                'bid': that.bid,
                'beid': that.newbeid,
                'coaid': that.newcoaid,
                'coaname': that.newcoaname,
                'envtitle': that.newenvtitle,
                'uidcode': that.loginUser.login,
                "isactive": true
            });

            that.counter++;
            that.newbeid = 0;
            that.newcoaid = 0;
            that.newcoaname = "";
            that.newenvtitle = "";

            $(".coaname").focus();
        }
    }

    deleteBudgetEnvelope(row) {
        row.isactive = false;
    }

    fillCOAGrid() {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "coa" }).subscribe(data => {
            that.envelopeDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // get Envelope by ID

    getEnvelopeData() {
        var that = this;

        that._budgetservice.getEnvelope({ "flag": "edit", "bid": that.bid }).subscribe(data => {
            that.envRowData = data.data;

            // for (var i = 0; i < that.envelopeDT.length; i++) {
            //     that.envelopeDT[i].beid = envdtls[i].beid;
            //     that.envelopeDT[i].envtitle = envdtls[i].envtitle;
            // }
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
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}