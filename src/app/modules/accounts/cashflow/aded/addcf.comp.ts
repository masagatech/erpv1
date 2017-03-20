import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CashFlowService } from '../../../../_service/cashflow/cf-service' /* add reference for add cash flow */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addcf.comp.html',
    providers: [CashFlowService, CommonService, ALSService]
})

export class AddCashFlow implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    cfid: number = 0;
    docno: number = 0;
    cftitle: string = "";
    narration: string = "";
    isactive: boolean = false;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    cfRowData: any = [];
    duplicateCOA: boolean = true;

    newcfid: number = 0;
    newcoaid: number = 0;
    newcoanm: string = "";
    newdispnm: string = "";
    counter: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    @ViewChild("docdate")
    docdate: CalendarComp;

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _cfservice: CashFlowService, private _userService: UserService, private _commonservice: CommonService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Cash Flow";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "cf", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.docdate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.docdate.initialize(this.loginUser);
        this.docdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Cash Flow");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                var date = new Date();
                this.docdate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Cash Flow");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.docno = params['id'];
                this.getCashFlowByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("Details Of Cash Flow");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.docno = params['id'];
                this.getCashFlowByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    private isFormChange() {
        return (this.formvals == $("#frmcashflow").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveCashFlow(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/cashflow/edit/', this.docno]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveCashFlow(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/cashflow']);
        }
    }

    // add cash flow details

    isDuplicateCOA() {
        for (var i = 0; i < this.cfRowData.length; i++) {
            var field = this.cfRowData[i];

            if (field.acid == this.newcoaid) {
                this._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");

                this.newcoaid = 0;
                this.newcoanm = "";
                this.newdispnm = "";
                return true;
            }
        }

        return false;
    }

    private addCashFlow() {
        var that = this;
        
        // Validation

        if (that.newcoanm == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Chart Of Accounts");
            return;
        }

        if (that.newdispnm == "")  {
            that._msg.Show(messageType.error, "Error", "Please Enter Display Name");
            return;
        }

        // Duplicate items Check
        that.duplicateCOA = that.isDuplicateCOA();

        // Add New Row
        if (that.duplicateCOA === false) {
            that.cfRowData.push({
                'cfid': that.newcfid,
                'coaid': that.newcoaid,
                'coanm': that.newcoanm,
                'dispnm': that.newdispnm,
                "isactive": true
            });

            that.counter++;
            that.newcfid = 0;
            that.newcoaid = 0;
            that.newcoanm = "";
            that.newdispnm = "";

            $(".accname").focus();
        }
    }

    deleteCashFlow(row) {
        row.isactive = false;
    }

    getAutoCOA(me: any, arg: number) {
        var that = this;

        that._cfservice.getCashFlow({ "flag": "autocoa", "search": arg == 0 ? me.newcoanm : me.coanm }).subscribe(data => {
            $(".coanm").autocomplete({
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
                        me.coanm = ui.item.label;
                        me.coaid = ui.item.value;
                    } else {
                        me.newcoanm = ui.item.label;
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

    // save cash flow

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

    saveCashFlow(isactive: boolean) {
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

        if (that.cfRowData.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Chart Of Accounts");
            return;
        }

        console.log(that.cfRowData);

        var saveCF = {
            "cfid": that.cfid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docdate": that.docdate.getDate(),
            "cftitle": that.cftitle,
            "cfdetails": that.cfRowData,
            "narration": that.narration,
            "suppdoc": that.suppdoc.length === 0 ? null : that.suppdoc,
            "uidcode": that.loginUser.login,
            "isactive": isactive
        }

        that.duplicateCOA = that.isDuplicateCOA();

        if (that.duplicateCOA == false) {
            that._cfservice.saveCashFlow(saveCF).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_cashflow.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_cashflow.msg);
                    that._router.navigate(['/accounts/cashflow']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_cashflow.msg);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    // get cash flow by id

    getCashFlowByID(pdocno: number) {
        var that = this;

        that._cfservice.getCashFlow({ "flag": "edit", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "docno": pdocno }).subscribe(data => {
            var _cfdata = data.data[0]._cfdata;
            var _cfdetails = data.data[0]._cfdetails;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.cfid = _cfdata[0].cfid;
            var date = new Date(_cfdata[0].docdate);
            that.docdate.setDate(date);
            that.cftitle = _cfdata[0].cftitle;
            that.narration = _cfdata[0].narration;
            that.isactive = _cfdata[0].isactive;

            that.cfRowData = _cfdetails;

            that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            that.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    removeFileUpload() {
        this.uploadedFiles.splice(0, 1);
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}


// account details

// bindAutoComplete() {
//     var that = this;

//     $(".accname").each(function () {

//         if ($(this).attr("added")) {
//             return;
//         }
//         $(this).attr("added", "1");
//         $(this).autocomplete({
//             source: function (request, response) {
//                 that._commonservice.getAutoData({ "type": "customer", "cmpid": that.loginUser.cmpid, "search": request.term }).subscribe(data => {
//                     response($.map(data.data, function (item) {
//                         return {
//                             label: item.label,
//                             value: item.label,
//                             "iid": item.value
//                         }
//                     }));
//                 }, err => {
//                     console.log("Error");
//                 }, () => {
//                     // console.log("Complete");
//                 })
//             },
//             width: 300,
//             max: 20,
//             delay: 100,
//             minLength: 0,
//             autoFocus: true,
//             cacheLength: 1,
//             scroll: true,
//             highlight: false,
//             select: function (event, ui) {
//                 event.preventDefault();
//                 $(event.target).val(ui.item.label);
//                 console.log(ui.item.iid)
//                 $(event.target).trigger('input');

//             }
//         });
//     })
// }