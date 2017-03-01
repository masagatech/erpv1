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
    templateUrl: 'addbdowners.comp.html',
    providers: [BudgetService]
})

export class AddOwnershipComp implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    BudgetDT: any = [];
    EnvelopeDT: any = [];
    CtrlCenterDT: any = [];

    ownersRowData: any = [];
    duplicateowner: boolean = true;

    bid: number = 0;
    newboid: number = 0;
    newenvid: number = 0;
    newempid: number = 0;
    newempname: string = "";
    newccid: number = 0;

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
        this.fillDropDownList();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.setActionButtons.setTitle("Ownership");

        this.setBudgetOwnership();

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    // add, edit, delete button

    private isFormChange() {
        return (this.formvals == $("#frmbudget").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveOwnershipData();
        } else if (evt === "edit") {
            this._router.navigate(['/budget/ownership/edit', this.bid]);
        } else if (evt === "back") {
            this._router.navigate(['/budget/ownership']);
        }
    }

    setBudgetOwnership() {
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Budget Ownership");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', false);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Budget Ownership");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.fillEnvelopeDDL();
                this.getOwnershipData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
            else {
                this.setActionButtons.setTitle("Details Of Budget Ownership");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);
                $('#bid').prop('disabled', true);

                this.bid = params['id'];
                this.fillEnvelopeDDL();
                this.getOwnershipData(this.bid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
            }
        });
    }

    fillDropDownList() {
        var that = this;

        that._budgetservice.getOwnership({ "flag": "dropdown", "search": "" }).subscribe(data => {
            that.BudgetDT = data.data[0]._bdgddl;
            that.CtrlCenterDT = data.data[0]._ccddl;
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    fillEnvelopeDDL() {
        var that = this;

        that._budgetservice.getOwnership({ "flag": "dropdown", "bid": that.bid, "search": "" }).subscribe(data => {
            that.EnvelopeDT = data.data[0]._envddl;
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    isDuplicateOwnership() {
        for (var i = 0; i < this.ownersRowData.length; i++) {
            var field = this.ownersRowData[i];

            if ((field.envid == this.newenvid) && (field.empid == this.newempid) && (field.ccid == this.newccid)) {
                this._msg.Show(messageType.error, "Error", "Duplicate Ownership not Allowed");

                this.newenvid = 0;
                this.newempid = 0;
                this.newempname = "";
                this.newccid = 0;
                return true;
            }
        }

        return false;
    }

    getAutoEmp(me: any, arg: number) {
        var that = this;

        that._budgetservice.getOwnership({ "flag": "autoemp", "search": arg == 0 ? me.newempname : me.empname }).subscribe(data => {
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
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    private addBudgetOwnership() {
        var that = this;

        // Validation

        if (that.newempname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Chart of Accounts");
            return;
        }

        // Duplicate items Check
        that.duplicateowner = that.isDuplicateOwnership();

        // Add New Row
        if (that.duplicateowner === false) {
            that.ownersRowData.push({
                'counter': that.counter,
                'boid': that.newboid,
                'bid': that.bid,
                'envid': that.newenvid,
                'empid': that.newempid,
                'empname': that.newempname,
                'ccid': that.newccid,
                'uidcode': that.loginUser.login,
                "isactive": true
            });

            that.counter++;
            that.newboid = 0;
            that.newenvid = 0;
            that.newempid = 0;
            that.newempname = "";
            that.newccid = 0;
        }
    }

    deleteBudgetOwnership(row) {
        row.isactive = false;
    }

    // get Ownership by ID

    getOwnershipData(pbid) {
        var that = this;

        that._budgetservice.getOwnership({ "flag": "edit", "bid": pbid }).subscribe(data => {
            that.ownersRowData = data.data;
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    // save budget

    saveOwnershipData() {
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

        if (that.ownersRowData.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Ownership Details");
            return;
        }

        var saveOwnership = {
            "ownership": that.ownersRowData
        }

        that._budgetservice.saveOwnership(saveOwnership).subscribe(data => {
            try {
                var dataResult = data.data;

                if (dataResult[0].funsave_bdgowner.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bdgowner.msg);
                    that._router.navigate(['/budget/ownership']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bdgowner.msg);
                }
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e.message);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
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