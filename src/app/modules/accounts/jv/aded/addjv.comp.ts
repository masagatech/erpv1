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

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addjv.comp.html',
    providers: [JVService, CommonService, ALSService]
})

export class AddJV implements OnInit, OnDestroy {
    viewCustomerDT: any[];
    loginUser: LoginUserModel;

    jvmid: number = 0;
    docdate: any = "";
    narration: string = "";

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    jvRowData: any = [];
    duplicateaccount: boolean = true;

    newjvdid: number = 0;
    newacid: number = 0;
    newacname: string = "";
    newdramt: any = "";
    newcramt: any = "";
    newdetnarr: string = "";
    counter: any;
    title: string = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";
    @ViewChild("jvdate")
    jvdate: CalendarComp;
    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _jvservice: JVService, private _userService: UserService, private _commonservice: CommonService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();

        this.module = "JV";
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "jv", "fyid": that.loginUser.fyid
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.jvdate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.jvdate.initialize(this.loginUser);
        this.jvdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.title = "Edit Journal Voucher";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.jvmid = params['id'];
                this.getJVDataById(this.jvmid);

                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);
            }
            else {
                this.title = "Add Journal Voucher";

                var date = new Date();
                this.jvdate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
            }
        });
    }

    private isFormChange() {
        return (this.formvals == $("#frmjv").serialize());
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            if (this.isFormChange()) {
                this._msg.Show(messageType.info, "info", "No save! There is no change!");
                return;
            };

            var validateme = commonfun.validate();

            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }

            this.saveJVData();
        } else if (evt === "edit") {
            $('input').prop('disabled', false);
            $('select').prop('disabled', false);
            $('textarea').prop('disabled', false);

            this.formvals = $("#frmjv").serialize();
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    // add jv details

    isDuplicateAccount() {
        for (var i = 0; i < this.jvRowData.length; i++) {
            var field = this.jvRowData[i];

            if (field.acid == this.newacid) {
                this._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");

                this.newacid = 0;
                this.newacname = "";
                this.newdramt = "";
                this.newcramt = "";
                return true;
            }
        }

        return false;
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.jvRowData.length; i++) {
            var items = this.jvRowData[i];
            DebitAmtTotal += parseInt(items.dramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.jvRowData.length; i++) {
            var items = this.jvRowData[i];
            CreditAmtTotal += parseInt(items.cramt);
        }

        return CreditAmtTotal;
    }

    private NewRowAdd() {
        // Validation

        if (this.newacname == "") {
            this._msg.Show(messageType.error, "Error", "Please Enter Account Name");
            return;
        }

        if (this.newdramt === "") {
            this._msg.Show(messageType.error, "Error", "Please Enter Debit Amount");
            return;
        }

        if (this.newcramt === "") {
            this._msg.Show(messageType.error, "Error", "Please Enter Credit Amount");
            return;
        }

        // Duplicate items Check
        this.duplicateaccount = this.isDuplicateAccount();

        // Add New Row
        if (this.duplicateaccount === false) {
            this.jvRowData.push({
                'counter': this.counter,
                'jvdid': this.newjvdid,
                'acid': this.newacid,
                'acname': this.newacname,
                'dramt': this.newdramt,
                'cramt': this.newcramt
            });

            this.counter++;
            this.newjvdid = 0;
            this.newacid = 0;
            this.newacname = "";
            this.newdramt = "";
            this.newcramt = "";
            var that = this;

            // setTimeout(function () {
            //     that.bindAutoComplete();
            // }, 0);

            $(".accname").focus();
        }
    }

    deleteJVRow(row) {
        this.jvRowData.splice(this.jvRowData.indexOf(row), 1);
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

    getAutoComplete(me: any, arg: number) {
        var that = this;

        that._commonservice.getAutoData({ "type": "customer", "cmpid": that.loginUser.cmpid, "search": arg == 0 ? me.newacname : me.acname }).subscribe(data => {
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
                        me.newacname = ui.item.label;
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

        that._jvservice.getJVDetails({ "flag": "edit", "cmpid": that.loginUser.cmpid, "fyid": that.loginUser.fyid, "jvmid": pjvmid }).subscribe(data => {
            var _jvdata = data.data[0]._jvdata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _docfile = data.data[0]._docfile;

            that.jvmid = _jvdata[0].jvmid;

            var date = new Date(_jvdata[0].docdate);
            this.jvdate.setDate(date);
            that.docdate = _jvdata[0].docdate;
            that.narration = _jvdata[0].narration;

            that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            that.docfile = _docfile == null ? [] : _docfile;

            that.getJVDetailsByJVID(pjvmid);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // get jv details by id

    getJVDetailsByJVID(pjvmid: number) {
        this._jvservice.getJVDetails({ "flag": "details", "jvmid": pjvmid }).subscribe(data => {
            this.jvRowData = data.data;
            console.log(this.jvRowData);
        }, err => {
            console.log("Error");
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
            that.docfile.push({ "id": e[i].id });
        }

        that.actionButton.find(a => a.id === "save").enabled = true;
    }

    saveJVData() {
        var that = this;

        if (that.jvRowData.length > 0) {
            var saveJV = {
                "jvmid": that.jvmid,
                "loginsessionid": that.loginUser._sessiondetails.sessionid,
                "uid": that.loginUser.uid,
                "fyid": that.loginUser.fyid,
                "cmpid": that.loginUser.cmpid,
                "docdate": that.jvdate.getDate(),
                "docfile": that.docfile.length === 0 ? null : that.docfile,
                "narration": that.narration,
                "uidcode": that.loginUser.login,
                "jvdetails": that.jvRowData
            }

            that._jvservice.saveJVDetails(saveJV).subscribe(data => {
                var dataResult = data.data;
                console.log(dataResult);

                if (dataResult[0].funsave_jv.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_jv.msg);
                    that._router.navigate(['/accounts/jv']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_jv.msg);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
        else {
            that._msg.Show(messageType.error, "Error", "Fill atleast 1 Fill Account Details");
            $(".accname").focus();
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
