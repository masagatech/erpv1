import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DRService } from '../../../_service/docrepo/dr-service'; /* add reference for view document repository */
import { CommonService } from '../../../_service/common/common-service'; /* add reference for view document repository */
import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewdr.comp.html',
    providers: [DRService, CommonService]
})

export class ViewDR implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    DocRepoDT: any = [];
    TagDT: any = [];

    constructor(private _drservice: DRService, private setActionButtons: SharedVariableService, private _router: Router,
        private _commonservice: CommonService) {
        this.getAllDocs();
        this.getDocType();
    }

    getAllDocs() {
        var that = this;

        that._drservice.getEmpDocRepo({ "flag": "alldocs" }).subscribe(data => {
            that.DocRepoDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDocType() {
        this._commonservice.getMOM({ "flag": "", "group": "DocType" }).subscribe(data => {
            this.TagDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    formatSizeUnits(bytes) {
        if (bytes >= 1073741824) {
            bytes = (bytes / 1073741824).toFixed(2) + ' GB';
        }
        else if (bytes >= 1048576) {
            bytes = (bytes / 1048576).toFixed(2) + ' MB';
        }
        else if (bytes >= 1024) {
            bytes = (bytes / 1024).toFixed(2) + ' KB';
        }
        else if (bytes > 1) {
            bytes = bytes + ' bytes';
        }
        else if (bytes == 1) {
            bytes = bytes + ' byte';
        }
        else {
            bytes = '0 byte';
        }

        return bytes;
    }

    saveDRData() {
        var that = this;

        var saveDR = {
            "empdocrepo": that.DocRepoDT
        }

        console.log(that.DocRepoDT);

        that._drservice.saveEmpDocRepo(saveDR).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].msgid != "-1") {
                alert(dataResult[0].funsave_empdocrepo.msg);
                that._router.navigate(['/docrepo']);
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

    actionBarEvt(evt) {
        var that = this;

        if (evt === "add") {
            that._router.navigate(['/docrepo/add']);
        }
        else if (evt === "save") {
            this.saveDRData();
        }
    }

    ngOnInit() {
        var that = this;

        that.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        that.setActionButtons.setActionButtons(this.actionButton);
        that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
    }

    ngOnDestroy() {
        var that = this;

        that.subscr_actionbarevt.unsubscribe();
    }
}