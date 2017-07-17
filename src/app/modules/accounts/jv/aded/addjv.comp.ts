import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service'; /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
import { AuditLogComp } from '../../../usercontrol/auditlog';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addjv.comp.html',
    providers: [JVService, CommonService, ALSService]
})

export class AddJV implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    jvmid: number = 0;
    narration: string = "";
    isactive: boolean = false;

    createdby: string = "";
    createdon: any = "";
    updatedby: string = "";
    updatedon: string = "";

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    acid: number = 0;
    acname: string = "";
    accountsDT: any = [];
    jvRowData: any = [];
    duplicateaccount: boolean = true;

    newjvdid: number = 0;
    newcustid: any = 0;
    newcustcode: string = "";
    newcustname: string = "";
    newdramt: any = "";
    newcramt: any = "";
    counter: any;
    title: string = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    @ViewChild("jvdate")
    jvdate: CalendarComp;

    @ViewChild("auditlog")
    auditlog: AuditLogComp;

    isauditlog: boolean = false;

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    // Page Load

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _jvservice: JVService, private _userService: UserService, private _autoservice: CommonService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "JV";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // clear all controls

    resetJVFields() {
        this.setAuditDate();
        this.narration = "";
        this.isactive = true;
        this.jvRowData = [];
    }

    // set audit date in doc date

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "jv", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;

            if (lockdate != "") {
                // that.jvdate.setMinMaxDate(new Date(lockdate), null);
                var date = new Date(lockdate);
                this.jvdate.setDate(date);
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // Document Ready

    ngOnInit() {
        // setTimeout(function () {
        //     $(".jvdate input").focus();
        // }, 0);

        this.jvdate.initialize(this.loginUser);
        this.jvdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Journal Voucher");
                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.resetJVFields();

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Journal Voucher");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.jvmid = params['id'];
                this.getJVDataById(this.jvmid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("Details Of Journal Voucher");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.jvmid = params['id'];
                this.getJVDataById(this.jvmid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    private isFormChange() {
        return (this.formvals == $("#frmjv").serialize());
    }

    // action button

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveJVData(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/jv/edit/', this.jvmid]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveJVData(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/jv']);
        }
    }

    // audit log

    openAuditLog() {
        this.isauditlog = true;
        this.auditlog.getAuditLog();
    }

    //AutoCompletd Customer

    getAutoAccounts(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "customercc",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "uid": this.loginUser.uid,
            "typ": "",
            "search": query
        }).then(data => {
            this.accountsDT = data;
        });
    }

    //Selected Inline Item Selected

    selectAutoAccounts(event, arg) {
        var that = this;
        if (arg === 1) {
            that.acid = event.value;
            that.acname = event.label;
        } else {
            that.newcustid = event.value;
            that.newcustcode = event.custcode,
            that.newcustname = event.label;
        }
    }

    // add jv details

    isDuplicateAccount() {
        for (var i = 0; i < this.jvRowData.length; i++) {
            var field = this.jvRowData[i];

            if (field.acid == this.newcustid) {
                this._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");
                return true;
            }
        }

        return false;
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;
        var jvRowDr = this.jvRowData.filter(a => a.isactive === true);

        for (var i = 0; i < jvRowDr.length; i++) {
            var items = jvRowDr[i];
            DebitAmtTotal += parseFloat(items.dramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;
        var jvRowCr = this.jvRowData.filter(a => a.isactive === true);

        for (var i = 0; i < jvRowCr.length; i++) {
            var items = jvRowCr[i];
            CreditAmtTotal += parseFloat(items.cramt);
        }

        return CreditAmtTotal;
    }

    private addJVRow() {
        var that = this;

        // Validation

        if (that.newcustname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Account Name");
            return;
        }

        if ((that.newdramt == "") && (that.newcramt == "")) {
            that._msg.Show(messageType.error, "Error", "Please Enter Debit Amount / Credit Amount");
            return;
        }

        // Duplicate items Check
        that.duplicateaccount = that.isDuplicateAccount();

        // Add New Row
        if (that.duplicateaccount === false) {
            that.jvRowData.push({
                'counter': that.counter,
                'jvdid': that.newjvdid,
                'acid': that.newcustid,
                'accode': that.newcustcode,
                'acname': that.newcustname,
                'dramt': that.newdramt,
                'cramt': that.newcramt,
                "isactive": true
            });

            that.counter++;
            that.newjvdid = 0;
            that.newcustid = 0;
            that.newcustcode = "";
            that.newcustname = "";
            that.newdramt = "";
            that.newcramt = "";

            $(".accname").focus();
        }
    }

    deleteJVRow(row) {
        row.isactive = false;
    }

    // set total debit amount

    setDrAmt(me: any, arg: number) {
        if (arg === 1) {
            if (me.cramt > 0) {
                me.dramt = 0;
            }
        }
        else {
            if (me.newcramt > 0) {
                me.newdramt = 0;
            }
        }
    }

    // set total credit amount

    setCrAmt(me: any, arg: number) {
        if (arg === 1) {
            if (me.dramt > 0) {
                me.cramt = 0;
            }
        }
        else {
            if (me.newdramt > 0) {
                me.newcramt = 0;
            }
        }
    }

    // get jv master by id

    getJVDataById(pjvmid: number) {
        var that = this;

        that._jvservice.getJVDetails({
            "flag": "edit", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "jvmid": pjvmid
        }).subscribe(data => {
            try {
                var _jvdata = data.data[0]._jvdata;
                var _jvdetails = data.data[0]._jvdetails;
                var _uploadedfile = data.data[0]._uploadedfile;
                var _suppdoc = data.data[0]._suppdoc;

                that.jvmid = _jvdata[0].jvmid;

                var date = new Date(_jvdata[0].docdate);
                that.jvdate.setDate(date);
                that.narration = _jvdata[0].narration;
                that.isactive = _jvdata[0].isactive;
                that.createdby = _jvdata[0].createdby;
                that.createdon = _jvdata[0].createdon;
                that.updatedby = _jvdata[0].updatedby;
                that.updatedon = _jvdata[0].updatedon;

                that.jvRowData = _jvdetails;

                that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
                that.suppdoc = _suppdoc == null ? [] : _suppdoc;
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    // save jv

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

    saveJVData(isactive: boolean) {
        var that = this;

        if (that.isFormChange()) {
            that._msg.Show(messageType.info, "info", "No save! There is no change!");
            return;
        };

        if (that.TotalDebitAmt() !== that.TotalCreditAmt()) {
            that._msg.Show(messageType.error, "Error", "Total Debit Amount and Total Credit Amount not Same !!!");
            return;
        }

        var validateme = commonfun.validate();

        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        if (that.jvRowData.length === 0) {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Account Details");
        }

        var saveJV = {
            "jvmid": that.jvmid,
            "loginsessionid": that.loginUser._sessiondetails.sessionid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docdate": that.jvdate.getDate(),
            "suppdoc": that.suppdoc.length === 0 ? null : that.suppdoc,
            "narration": that.narration,
            "uidcode": that.loginUser.login,
            "isactive": isactive,
            "jvdetails": that.jvRowData
        }

        that.duplicateaccount = that.isDuplicateAccount();

        if (that.duplicateaccount == false) {
            that._jvservice.saveJVDetails(saveJV).subscribe(data => {
                try {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_jv.msgid != "-1") {
                        that._msg.Show(messageType.success, "Success", dataResult[0].funsave_jv.msg);
                        that._router.navigate(['/accounts/jv']);
                    }
                    else {
                        that._msg.Show(messageType.error, "Error", dataResult[0].funsave_jv.msg);
                    }
                }
                catch (e) {
                    that._msg.Show(messageType.error, "Error", e);
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
//                 that._autoservice.getAutoData({ "type": "customer", "cmpid": that.loginUser.cmpid, "search": request.term }).subscribe(data => {
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