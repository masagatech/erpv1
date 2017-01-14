import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../../../_service/common/common-service" /* add reference for master of master */
import { ExpVoucherService } from "../../../../_service/expensevoucher/expvoucher-service" /* add reference for master of master */
import { MessageService, messageType } from "../../../../_service/messages/message-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: "addexpvoucher.comp.html",
    providers: [CommonService, ExpVoucherService]
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
    ctrlcenter: string = "";
    employee: string = "";
    exphead: string = "";

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

    expensevoucherDT: any = [];
    isadd_edit: boolean = true;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _expvoucherservice: ExpVoucherService, private _message: MessageService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.module = "Expense Voucher";

        this.fillControllingCenterDDL();
        this.fillEmployeeDDL();
        this.fillExpenseHeadDDL();
    }

    fillControllingCenterDDL() {
        this._commonservice.getAutoData({ "type": "ctrlcenter" }).subscribe(data => {
            this.ctrlcenterDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    fillEmployeeDDL() {
        this._commonservice.getAutoData({ "type": "employee" }).subscribe(data => {
            this.employeeDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    fillExpenseHeadDDL() {
        this._commonservice.getMOM({ "flag": "idwithname", "group": "Expense Head" }).subscribe(data => {
            this.expheadDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    addExpenseVoucher() {
        var that = this;

        var ctrlcenterid = that.ctrlcenter.toString().split(':')[0];
        var ctrlcentername = that.ctrlcenter.toString().split(':')[1];
        var empid = that.employee.toString().split(':')[0];
        var empname = that.employee.toString().split(':')[1];
        var expheadid = that.exphead.toString().split(':')[0];
        var expheadname = that.exphead.toString().split(':')[1];

        that.expensevoucherDT.push({
            "expvid": 0,
            "cmpid": that.loginUser.cmpid,
            "fyid": that.loginUser.fyid,
            "ctrlcenterid": ctrlcenterid,
            "ctrlcentername": ctrlcentername,
            "empid": empid,
            "empname": empname,
            "period": that.period,
            "expheadid": expheadid,
            "expheadname": expheadname,
            "amount": that.amount,
            "noofdocs": that.noofdocs,
            "narration": that.narration,
            "uidcode": that.loginUser.login,
            "isactive": true
        });

        that.ctrlcenter = "";
        that.employee = "";
        that.period = "";
        that.exphead = "";
        that.amount = 0;
        that.noofdocs = 0;
        that.narration = "";
    }

    updateExpenseVoucher() {
        var that = this;

        var ctrlcenterid = that.ctrlcenter.toString().split(':')[0];
        var ctrlcentername = that.ctrlcenter.toString().split(':')[1];
        var empid = that.employee.toString().split(':')[0];
        var empname = that.employee.toString().split(':')[1];
        var expheadid = that.exphead.toString().split(':')[0];
        var expheadname = that.exphead.toString().split(':')[1];

        that.selectedrow.ctrlcenterid = ctrlcenterid;
        that.selectedrow.ctrlcentername = ctrlcentername;
        that.selectedrow.empid = empid;
        that.selectedrow.empname = empname;
        that.selectedrow.period = that.period;
        that.selectedrow.expheadid = expheadid;
        that.selectedrow.expheadname = expheadname;
        that.selectedrow.amount = that.amount;
        that.selectedrow.noofdocs = that.noofdocs;
        that.selectedrow.narration = that.narration;

        that.clearExpenseVoucher();
    }

    editExpenseVoucher(row) {
        var that = this;
        this.isadd_edit = false;
        that.selectedrow = row;
        that.ctrlcenter = row.ctrlcenterid + ":" + row.ctrlcentername;
        that.employee = row.empid + ":" + row.empname;
        that.period = row.period;
        that.exphead = row.expheadid + ":" + row.expheadname;
        that.amount = row.amount;
        that.noofdocs = row.noofdocs;
        that.narration = row.narration;
    }

    deleteExpenseVoucher(row) {
        // row.isactive = false;
        // var evdt = this.expensevoucherDT;
        // evdt.filter(a => a.isactive === true);
        
        this.expensevoucherDT.splice(this.expensevoucherDT.indexOf(row), 1);
    }

    clearExpenseVoucher() {
        var that = this;
        this.isadd_edit = true;
        that.ctrlcenter = "";
        that.employee = "";
        that.period = "";
        that.exphead = "";
        that.amount = 0;
        that.noofdocs = 0;
        that.narration = "";
    }

    // File Upload

    // onUploadStart(e) {
    //     this.actionButton.find(a => a.id === "save").enabled = false;
    // }

    // onUploadComplete(e) {
    //     for (var i = 0; i < e.length; i++) {
    //         this.docfile.push({ "id": e[i].id });
    //     }

    //     this.actionButton.find(a => a.id === "save").enabled = true;
    // }

    // save expense

    saveExpenseVoucher() {
        var that = this;

        that._expvoucherservice.saveExpenseVoucher({
            "expensevoucher": that.expensevoucherDT
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

    // add expense details

    getExpenseVoucher(pdocno: number) {
        var that = this;

        this._expvoucherservice.getExpenseVoucherDetails({ "flag": "id", "docno": pdocno }).subscribe(data => {
            var dataresult = data.data;
            that.expensevoucherDT = dataresult[0].edetails.filter(a => a.isactive === true);

            // var _ecmdata = dataresult[0]._ecmdata;
            // var _uploadedfile = dataresult[0]._uploadedfile;
            // var _docfile = dataresult[0]._docfile;

            // that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            // that.docfile = _docfile == null ? [] : _docfile;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
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