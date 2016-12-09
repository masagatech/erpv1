import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DRService } from '../../../_service/documentrepository/dr-service'; /* add reference for view document repository */
import { CommonService } from '../../../_service/common/common-service'; /* add reference for view document repository */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'adddr.comp.html',
    providers: [DRService, CommonService]
})

export class DRAddEdit implements OnInit, OnDestroy {
    drAutoID: any;
    UserID: any;
    EmpCode: any;
    EmpName: any;
    newDocTitle: any;
    newTag: any;
    newFilePath: any;

    counter: any;
    title: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    TagDT: any[];

    viewEmpDT: any[] = [];

    drRowData: any[] = [];
    viewDNData: any[] = [];
    viewEmpData: any[] = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _drservice: DRService, private _commonservice: CommonService) {
        this._commonservice.getMasterOfMaster({ "MasterType": "DocumentRepository" }).subscribe(data => {
            var d = JSON.parse(data.data);

            // BIND Gender TO DROPDOWN
            this.TagDT = d.filter(a => a.Group === "DocType");
            this.newTag = this.TagDT[0].ID; // SET DEFAULT Gender VALUE
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    filesToUpload: any[] = [];

    public fileChangeEvent(fileInput: any) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e: any) {
                console.log(e.target);
                $('.imgFilePath').attr('src', e.target.result);
            }

            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }

    private NewRowAdd() {
        if (this.newDocTitle == "" || this.newDocTitle == null) {
            alert("Please Enter Doc Title");
            return;
        }

        if (this.newTag == "" || this.newTag == null) {
            alert("Please Select Tag");
            return;
        }

        //Add New Row
        this.drRowData.push({
            'counter': this.counter,
            'DocTitle': this.newDocTitle,
            'Tag': this.newTag,
            'FilePath': this.newFilePath
        });

        this.counter++;
        this.newDocTitle = "";
        this.newTag = "";
        this.newFilePath = "";
    }

    getAutoComplete() {
        this._commonservice.getAutoCompleteData({ "Type": "EmpWithCode", "Key": this.EmpName }).subscribe(data => {
            $(".empame").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    this.EmpName = ui.item.label;
                    this.EmpCode = ui.item.value;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDRDataByUserID(drUserID: string) {
        this._drservice.viewDocumentRepository({ "UserID": drUserID, "Flag": "EmpWiseDocs" }).subscribe(data => {
            this.drRowData = JSON.parse(data.data);
            this.viewEmpData = JSON.parse(data.Table4);

            console.log(this.drRowData);
            console.log(this.viewEmpData);

            this.EmpCode = this.viewEmpData[0].EmpCode;
            this.EmpName = this.viewEmpData[0].EmpFullName;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveDRData() {
        var xmldt = "<r>";

        for (var i = 0; i < this.drRowData.length; i++) {
            var field = this.drRowData[i];
            xmldt += "<i>";

            xmldt += "<EID>" + field.EmpCode + "</EID>";
            xmldt += "<DT>" + field.DocTitle + "</DT>";
            xmldt += "<Tag>" + field.Tag + "</Tag>";
            xmldt += "<FP>" + field.FilePath + "</FP>";
            xmldt += "<FT>" + field.FileType + "</FT>";
            xmldt += "<R1></R1>";
            xmldt += "<R2></R2>";
            xmldt += "<R3></R3>";
            xmldt += "</i>";
        }

        xmldt += "</r>";
        console.log(xmldt);

        var saveDR = {
            "DocumentRepository": xmldt
        }

        this._drservice.saveDocumentRepository(saveDR).subscribe(data => {
            var dataResult = JSON.parse(data.data);
            debugger;
            console.log(dataResult);

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/documentrepository/view']);
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
        this.title = "Add dn";
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;

            this.UserID = params['UserID'];
            this.getDRDataByUserID(this.UserID);
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