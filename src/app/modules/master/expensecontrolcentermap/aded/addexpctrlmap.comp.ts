import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../../../_service/common/common-service" /* add reference for master of master */
import { ECMService } from "../../../../_service/expensecontrolcentermap/ecm-service" /* add reference for master of master */
import { MessageService, messageType } from "../../../../_service/messages/message-service";

declare var $: any;

@Component({
    templateUrl: "addexpctrlmap.comp.html",
    providers: [CommonService, ECMService]
})

export class AddExpenseComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    title: string = "";

    autoid: number = 0;
    docno: number = 0;
    expid: number = 0;
    expname: string = "";
    docdate: any = "";

    iscmplevel: boolean = false;
    isemplevel: boolean = false;
    contrcenterid: number = 0;
    isprofitcenter: boolean = false;
    iscostcenter: boolean = false;
    narration: string = "";

    counter: number = 0;
    ctrlcentermapDT: any = [];
    ctrlcenterDT: any = [];

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _ecmservice: ECMService, private _message: MessageService) {
        this.module = "Expense Control Center Mapping";
        this.getCtrlCenter();
    }

    // File Upload

    getExpenseAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "expense", "cmpid": 1, "fyid": 5, "search": that.expname }).subscribe(data => {
            //debugger;
            $(".expense").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 1,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.expid = ui.item.value;
                    me.expname = ui.item.label;
                }
            });

        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

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

    saveExpenseCtrlMap() {
        var that = this;

        console.log("expid : " + that.expid);

        var saveExpense = {
            "autoid": that.autoid,
            "cmpid": 2,
            "fyid": 7,
            "docdate": that.docdate,
            "expid": that.expid,
            "iscmplevel": that.iscmplevel,
            "isemplevel": that.isemplevel,
            "ctrlcentermap": that.ctrlcentermapDT,
            "narration": that.narration,
            "createdby": "1:admin",
            "docfile": that.docfile
        }

        that._ecmservice.saveExpenseCtrlMap(saveExpense).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_expensectrlmap.msgid != "-1") {
                that._message.Show(messageType.success, "Confirmed", dataResult[0].funsave_expensectrlmap.msg.toString());
                that._router.navigate(["/master/expensecontrolcentermap"]);
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

    getCtrlCenter() {
        var that = this;

        that._commonservice.getAutoData({ "type": "ctrl", "cmpid": 1, "fy": 5, "search": "" }).subscribe(data => {
            that.ctrlcenterDT = data.data;

            for (var i = 0; i < that.ctrlcenterDT.length; i++) {
                that.ctrlcentermapDT.push({
                    "ctrlcenterid": that.ctrlcenterDT[i].value,
                    "ctrlcentername": that.ctrlcenterDT[i].label,
                    "isprofitcenter": that.isprofitcenter,
                    "iscostcenter": that.iscostcenter
                });
            }
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    getExpenseCtrlMap(pautoid: number) {
        var that = this;

        this._ecmservice.getExpenseCtrlMap({ "flag": "id", "cmpid":"2", "fyid":"7", "autoid": pautoid }).subscribe(data => {
            var dataresult = data.data;

            var _ecmdata = dataresult[0]._ecmdata;
            var _uploadedfile = dataresult[0]._uploadedfile;
            var _docfile = dataresult[0]._docfile;

            that.expid = _ecmdata[0].expid;
            that.expname = _ecmdata[0].expname;
            that.docdate = _ecmdata[0].docdate;
            that.iscmplevel = _ecmdata[0].iscmplevel;
            that.isemplevel = _ecmdata[0].isemplevel;
            that.narration = _ecmdata[0].narration;

            that.ctrlcentermapDT = _ecmdata[0].ctrlcentermap;

            that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            that.docfile = _docfile == null ? [] : _docfile;
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
            if (params["id"] !== undefined) {
                this.title = "Expesne : Edit";
                this.autoid = params["id"];
                this.getExpenseCtrlMap(this.autoid);
            }
            else {
                this.title = "Expesne : Add";
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this._message.confirm("Are you sure that you want to save?", () => {
                this.saveExpenseCtrlMap();
            });
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}