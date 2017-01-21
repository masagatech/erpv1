import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { ExpVoucherService } from "../../../../_service/expensevoucher/expvoucher-service" /* add reference for Expense Voucher */
import { MessageService, messageType } from "../../../../_service/messages/message-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: "addexpvoucher.comp.html",
    providers: [ExpVoucherService]
})

@ViewChild("id")

export class AddExpenseVocuherComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    title: string = "";
    id: number = 0;

    expvid: number = 0;
    docno: number = 0;
    ctrlcenterid: number = 0;
    empid: number = 0;
    expheadid: number = 0;

    period: string = "";
    amount: number = 0;
    noofdocs: number = 0;
    narration: string = "";

    ctrlcenterDT: any = [];
    employeeDT: any = [];
    periodDT: any = [];
    expheadDT: any = [];

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    selectedrow: any = [];

    expenseheadDT: any = [];
    isadd_edit: boolean = true;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _expvoucherservice: ExpVoucherService, private _message: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.module = "Expense Voucher";

        this.fillControllingCenterDDL();
        //this.fillEmployeeDDL();
        //this.fillExpenseHeadDDL();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params["docno"] !== undefined) {
                this.title = "Expesne Voucher : Edit";
                this.docno = params["docno"];
                this.getExpenseVoucher(this.docno);
            }
            else {
                this.title = "Expesne Voucher : Add";
            }
        });
    }

    fillControllingCenterDDL() {
        var that = this;

        that._expvoucherservice.getAllExpenseVoucher({ "flag": "empwisecc", "uid": that.loginUser.uid }).subscribe(data => {
            that.ctrlcenterDT = data.data[0];
            var ishide = that.ctrlcenterDT[0].ishide;

            if (ishide === 1) {
                that.ctrlcenterid = this.ctrlcenterDT[0].ctrlcenterid;
                that.fillEmployeeDDL();
                that.fillExpenseHeadDDL();
                $('#ccid').attr('disabled', 'disabled');
            }
            else {
                $('#ccid').removeAttr('disabled');
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    fillEmployeeDDL() {
        this._expvoucherservice.getAllExpenseVoucher({ "flag": "empwisecc", "uid": this.loginUser.uid, "ccid": this.ctrlcenterid }).subscribe(data => {
            this.employeeDT = data.data[1];
            var ishide = this.employeeDT[0].ishide;

            if (ishide === 1) {
                this.empid = this.employeeDT[0].empid;
                $('#empid').attr('disabled', 'disabled');
            }
            else {
                $('#empid').removeAttr('disabled');
            }
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    fillExpenseHeadDDL() {
        this._expvoucherservice.getExpenseVoucherDetails({ "flag": "expheadddl", "uid": this.loginUser.uid, "ccid": this.ctrlcenterid, "expfor": this.empid }).subscribe(data => {
            this.expheadDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    addExpenseVoucher() {
        var that = this;

        if (that.expheadid === 0) {
            that._message.Show(messageType.success, "Confirmed", "Please Select Expense Head");
        }
        else if (that.amount === 0) {
            that._message.Show(messageType.success, "Confirmed", "Please Enter Amount");
        }
        else {
            that.expenseheadDT.push({
                "expvid": 0,
                "expheadid": that.expheadid,
                "amount": that.amount
            });

            that.expheadid = 0;
            that.amount = 0;
        }
    }

    deleteExpenseVoucher(row) {
        this.expenseheadDT.splice(this.expenseheadDT.indexOf(row), 1);
    }

    clearExpenseVoucher() {
        this.isadd_edit = true;
        this.expvid = 0;
        this.period = "";
        this.noofdocs = 0;
        this.ctrlcenterid = 0;
        this.empid = 0;
        this.expheadid = 0;
        this.amount = 0;
        this.narration = "";
    }

    // File Upload

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.docfile.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    // save expense

    saveExpenseVoucher() {
        var that = this;

        if (that.expheadid === 0) {
            that._message.Show(messageType.success, "Confirmed", "Please Select Expense Head");
        }
        else if (that.amount === 0) {
            that._message.Show(messageType.success, "Confirmed", "Please Enter Amount");
        }
        else {
            that._expvoucherservice.saveExpenseVoucher({
                "expvid": that.expvid,
                "cmpid": that.loginUser.cmpid,
                "fyid": that.loginUser.fyid,
                "period": that.period,
                "noofdocs": that.noofdocs,
                "ctrlcenterid": that.ctrlcenterid,
                "empid": that.empid,
                "narration": that.narration,
                "uidcode": that.loginUser.login,
                "docfile": that.docfile,
                "expensehead": that.expenseheadDT
            }).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_expensevoucher.msgid != "-1") {
                    that._message.Show(messageType.success, "Confirmed", dataResult[0].funsave_expensevoucher.msg.toString());
                    that._router.navigate(["/master/expensevoucher"]);
                }
                else {
                    alert("Error");
                }
            }, err => {
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    // add expense details

    getExpenseVoucher(pdocno: number) {
        var that = this;

        this._expvoucherservice.getExpenseVoucherDetails({ "flag": "id", "docno": pdocno }).subscribe(data => {
            var dataresult = data.data;
            //that.expenseheadDT = dataresult[0]._eddetails.filter(a => a.isactive === true);

            var _expvdata = dataresult[0]._expvdata;

            that.expvid = _expvdata[0].expvid;
            that.period = _expvdata[0].period;
            that.noofdocs = _expvdata[0].noofdocs;
            that.ctrlcenterid = _expvdata[0].ctrlcenterid;

            that.fillEmployeeDDL();
            that.empid = _expvdata[0].empid;

            that.fillExpenseHeadDDL();
            that.expenseheadDT = dataresult[0]._eddetails;
            that.narration = _expvdata[0].narration;

            var _uploadedfile = dataresult[0]._uploadedfile;
            var _docfile = dataresult[0]._docfile;

            that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            that.docfile = _docfile == null ? [] : _docfile;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this._message.confirm("Are you sure that you want to save?", () => {
                this.saveExpenseVoucher();
            });
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}