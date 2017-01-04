import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DRService } from '../../../_service/docrepo/dr-service'; /* add reference for view document repository */
import { CommonService } from '../../../_service/common/common-service'; /* add reference for view document repository */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'adddr.comp.html',
    providers: [DRService, CommonService]
})

export class AddDR implements OnInit, OnDestroy {
    docid: number = 0;
    uid: number = 0;
    uname: string = "";
    cmpid: number = 0;
    fyid: number = 0;

    newdoctitle: string = "";
    newtag: string = "";
    newdocfile: string = "";
    newfilesize: string = "";
    newfiletype: string = "";

    counter: any;
    title: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    TagDT: any = [];
    drRowData: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _drservice: DRService, private _commonservice: CommonService) {
        this.getDocType();
    }

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        //this.attachfile = e.files[0].path;
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    // Get User Auto

    getUserAuto(me: any) {
        debugger;
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": that.uname }).subscribe(data => {
            $(".uname").autocomplete({
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
                    me.uid = ui.item.value;
                    me.uname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDocType() {
        debugger;
        this._commonservice.getMOM({ "flag": "", "group": "DocType" }).subscribe(data => {
            this.TagDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    // Add Doc Repo

    private NewRowAdd() {
        if (this.newdoctitle == "" || this.newdoctitle == null) {
            alert("Please Enter Doc Title");
            return;
        }

        if (this.newtag == "" || this.newtag == null) {
            alert("Please Select Tag");
            return;
        }

        //Add New Row
        this.drRowData.push({
            'counter': this.counter,
            'doctitle': this.newdoctitle,
            'tag': this.newtag,
            'docfile': this.newdocfile
        });

        this.counter++;
        this.newdoctitle = "";
        this.newtag = "";
        this.newdocfile = "";
    }

    // Get DR By DR ID

    getDRDataByID(puid: number) {
        this._drservice.getDocRepo({ "flag": "id", "uid": puid }).subscribe(data => {
            var viewEmpData = data.data;

            this.uid = viewEmpData[0].uid;
            this.uname = viewEmpData[0].fullname;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveDRData() {
        var saveDR = {
            "docrepo": this.drRowData
        }

        this._drservice.saveDocRepo(saveDR).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/docrepo/view']);
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

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['uid'] !== undefined) {
                this.title = "Edit Document Repository";

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                this.uid = params['uid'];
                this.getDRDataByID(this.uid);
            }
            else {
                this.title = "Add Document Repository";

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveDRData();
        } else if (evt === "edit") {
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