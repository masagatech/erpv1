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
    styles: [`
.threat{
    background-color: #FFC6A4;
}

.opportunity
{
     background-color: #B2FFA4;   
}

.weakness
{
    background-color: #FFE7A4;
}

.strength
{
    background-color: #E9FFA4;
}
`],
    templateUrl: 'addbdint.comp.html',
    providers: [BudgetService, CommonService, FYService, ALSService]
})

export class AddInitiateComp implements OnInit {
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

    @ViewChild('attr')
    attr: AttributeComp;

    milestoneDT: any = [];
    duplicatemilestone: boolean = true;

    newmsname: string = "";
    newmsdate: string = "";

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

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Budget Initiate > Add");

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
                this.setActionButtons.setTitle("Budget Initiate > Edit");

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
                this.setActionButtons.setTitle("Budget Initiate > Details");

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

        this.attr.attrparam = ["compinfo_attr"];
    }

    //Attribute Tab Click Event

    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    createattrjson() {
        var attrid = [];
        if (this.attr.attrlist.length > 0) {
            for (let items of this.attr.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    // add, edit, delete button

    private isFormChange() {
        return (this.formvals == $("#frmbudget").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveInitiate("edit", true);
        } else if (evt === "edit") {
            this._router.navigate(['/budget/initiate/edit', this.bid]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveInitiate("delete", false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/budget/initiate']);
        }
    }

    // add budget details

    isDuplicateMilestone() {
        for (var i = 0; i < this.milestoneDT.length; i++) {
            var field = this.milestoneDT[i];

            if (field.msname == this.newmsname) {
                this._msg.Show(messageType.error, "Error", "Duplicate Milestone not Allowed");

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
                'msdate': that.newmsdate
            });

            that.counter++;
            that.newmsname = "";
            that.newmsdate = "";

            $(".msname").focus();
        }
    }

    deleteMilestone(row) {
        this.milestoneDT.splice(this.milestoneDT.indexOf(row), 1);
    }

    // get budget master by id

    getBudgetDataById(pbid: number) {
        var that = this;

        that._budgetservice.getInitiate({ "flag": "edit", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "bid": pbid }).subscribe(data => {
            try {
                var _budgetdata = data.data[0]._budgetdata;
                var _budgetdetails = data.data[0]._budgetdetails;
                var _uploadedfile = data.data[0]._uploadedfile;
                var _suppdoc = data.data[0]._suppdoc;

                that.bid = _budgetdata[0].bid;
                that.btitle = _budgetdata[0].btitle;
                that.bobj = _budgetdata[0].bobj;
                that.fy = _budgetdata[0].fy;

                var fromdate = new Date(_budgetdata[0].frmdt);
                that.frmdt.setDate(fromdate);
                var todate = new Date(_budgetdata[0].todt);
                that.todt.setDate(todate);

                that.narration = _budgetdata[0].narration;
                that.milestoneDT = _budgetdata[0].milestone;
                that.strength = _budgetdata[0].strength;
                that.weakness = _budgetdata[0].weakness;
                that.opportunity = _budgetdata[0].opportunity;
                that.threat = _budgetdata[0].threat;
                that.attr.attrlist = data.data[0]._attrdata == null ? [] : data.data[0]._attrdata;
                that.isactive = _budgetdata[0].isactive;

                that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
                that.suppdoc = _suppdoc == null ? [] : _suppdoc;
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
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

    saveInitiate(flag, isactive) {
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
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Milestone Details");
            return;
        }

        var saveinitiate = {
            "bid": that.bid,
            "btitle": that.btitle,
            "bobj": that.bobj,
            "fy": that.fy,
            "frmdt": that.frmdt.getDate(),
            "todt": that.todt.getDate(),
            "milestone": that.milestoneDT,
            "narration": that.narration,
            "strength": that.strength,
            "weakness": that.weakness,
            "opportunity": that.opportunity,
            "threat": that.threat,
            "attr": that.createattrjson(),
            "uidcode": that.loginUser.login,
            "suppdoc": that.suppdoc.length === 0 ? null : that.suppdoc,
            "isactive": isactive,
            "flag": flag
        }

        that.duplicatemilestone = that.isDuplicateMilestone();

        if (that.duplicatemilestone == false) {
            that._budgetservice.saveInitiate(saveinitiate).subscribe(data => {
                try {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_bdginitiate.msgid == "1") {
                        that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bdginitiate.msg);
                        that._router.navigate(['/budget/initiate']);
                    }
                    else {
                        that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bdginitiate.msg);
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

    removeFileUpload() {
        this.uploadedFiles.splice(0, 1);
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}