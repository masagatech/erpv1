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
    ccid: number = 0;
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
    suppdoc: any = [];
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
            if (params["id"] !== undefined) {
                $(".period").focus();
                this.setActionButtons.setTitle("Edit Expesne Voucher");
                this.docno = params["id"];
                this.getExpenseVoucher(this.docno);
            }
            else {
                $(".period").focus();
                this.setActionButtons.setTitle("Add Expesne Voucher");
            }
        });
    }

    fillControllingCenterDDL() {
        var that = this;

        that._expvoucherservice.getAllExpenseVoucher({ "flag": "empwisecc", "uid": that.loginUser.uid }).subscribe(data => {
            that.ctrlcenterDT = data.data[0];
            var ishide = that.ctrlcenterDT[0].ishide;

            if (ishide === 1) {
                that.ccid = this.ctrlcenterDT[0].ccid;
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
        this._expvoucherservice.getAllExpenseVoucher({ "flag": "empwisecc", "uid": this.loginUser.uid, "ccid": this.ccid }).subscribe(data => {
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
        this._expvoucherservice.getExpenseVoucherDetails({ "flag": "expheadddl", "uid": this.loginUser.uid, "ccid": this.ccid, "expfor": this.empid }).subscribe(data => {
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
            that._message.Show(messageType.warn, "Warning", "Please Select Expense Head");
        }
        else if (that.amount === 0) {
            that._message.Show(messageType.warn, "Warning", "Please Enter Amount");
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
        this.ccid = 0;
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
            this.suppdoc.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    // save expense

    saveExpenseVoucher() {
        var that = this;

        if (that.period === "") {
            that._message.Show(messageType.warn, "Warning", "Please Select Period");
        }
        else if (that.noofdocs === 0) {
            that._message.Show(messageType.warn, "Warning", "Please Enter No of Docs");
        }
        else if (that.ccid === 0) {
            that._message.Show(messageType.warn, "Warning", "Please Select Control Center");
        }
        else if (that.empid === 0) {
            that._message.Show(messageType.warn, "Warning", "Please Select Expense For");
        }
        else if (that.expenseheadDT.length === 0) {
            that._message.Show(messageType.warn, "Warning", "Please fill atleast 1 Expense Head and Amount");
        }
        else {
            that._expvoucherservice.saveExpenseVoucher({
                "expvid": that.expvid,
                "loginsessionid": that.loginUser._sessiondetails.sessionid,
                "uid": that.loginUser.uid,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "period": that.period,
                "noofdocs": that.noofdocs,
                "ccid": that.ccid,
                "empid": that.empid,
                "narration": that.narration,
                "uidcode": that.loginUser.login,
                "suppdoc": that.suppdoc,
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
            that.docno = _expvdata[0].docno;
            that.period = _expvdata[0].period;
            that.noofdocs = _expvdata[0].noofdocs;
            that.ccid = _expvdata[0].ccid;

            that.fillEmployeeDDL();
            that.empid = _expvdata[0].empid;

            that.fillExpenseHeadDDL();
            that.expenseheadDT = dataresult[0]._eddetails;
            that.narration = _expvdata[0].narration;

            var _uploadedfile = dataresult[0]._uploadedfile;
            var _suppdoc = dataresult[0]._suppdoc;

            that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            that.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveExpenseVoucher();
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}