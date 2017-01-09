import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service'; /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addjv.comp.html',
    providers: [JVService, CommonService]
})

export class AddJV implements OnInit, OnDestroy {
    viewCustomerDT: any[];

    jvmid: number = 0;
    docdate: any = "";
    narration: string = "";

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    jvRowData: any[] = [];

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

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _jvservice: JVService, private _commonservice: CommonService) {
        this.module = "JV";
        this.docdate = Date.now();
    }

    // add jv details

    private NewRowAdd() {
        this.jvRowData.push({
            'counter': this.counter,
            'jvdid': this.newjvdid,
            'acid': this.newacid,
            'acname': this.newacname,
            'dramt': this.newdramt,
            'cramt': this.newcramt,
            'detnarr': this.newdetnarr
        });

        this.counter++;
        this.newjvdid = 0;
        this.newacid = 0;
        this.newacname = "";
        this.newdramt = "";
        this.newcramt = "";
        this.newdetnarr = "";
    }

    // account details

    getAutoComplete(me: any, arg: number) {
        var that = this;

        that._commonservice.getAutoData({ "type": "customer", "search": arg == 0 ? me.newacname : me.acname }).subscribe(data => {
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

        that._jvservice.getJVDetails({ "flag": "edit", "cmpid": 2, "fyid": 7, "jvmid": pjvmid }).subscribe(data => {
            var _jvdata = data.data[0]._jvdata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _docfile = data.data[0]._docfile;

            that.jvmid = _jvdata[0].jvmid;
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

        var saveJV = {
            "jvmid": that.jvmid,
            "fyid": "7",
            "cmpid": "2",
            "docdate": that.docdate,
            "docfile": that.docfile,
            "narration": that.narration,
            "createdby": "1:vivek",
            "updatedby": "1:vivek",
            "jvdetails": that.jvRowData
        }

        that._jvservice.saveJVDetails(saveJV).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_jv.msgid != "-1") {
                alert(dataResult[0].funsave_jv.msg);
                that._router.navigate(['/accounts/jv']);
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

    removeFileUpload() {
        this.uploadedFiles.splice(0, 1);
    }

    ngOnInit() {
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

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Journal Voucher";

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveJVData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}