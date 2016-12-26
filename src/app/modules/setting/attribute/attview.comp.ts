import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service'
import { attributeService } from "../../../_service/attribute/attr-service";

declare var $: any;
@Component({
    templateUrl: 'attview.comp.html',
    providers: [attributeService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
}) export class attrview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    addNewAttr: any = [];
    attName: any = "";
    counter: any = 0;
    attid: any = 0;
    val: any;

    constructor(private setActionButtons: SharedVariableService, private attributeServies: attributeService, private _autoservice: CommonService) { //Inherit Service dcmasterService
        this.counter = 0;
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.getAttribute();
        $("#attnam").focus();
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    jsonparam() {
        var Param = {
            "flag": "",
            "cmpid": 1,
            "fy": 5,
            "typ": "at",
            "attid": this.attid,
            "attname": this.attName,
            "createdby": "admin",
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }
        return Param;
    }

    getAttribute() {
        this.attributeServies.attget({
            "cmpid": 1
        }).subscribe(result => {
            this.addNewAttr = result.data;

        })
    }

    private NewRowAdd() {
        this.attributeServies.attsave(
            this.jsonparam()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_attribute.maxid == "-1") {
                alert("Record already exists");
                $("#attnam").focus();
                return;
            }
            if (dataset[0].funsave_attribute.maxid > 0) {
                alert("Data Save Successfully");
                this.addNewAttr.push({
                    'atname': this.attName,
                    'isact': true,
                    'counter': this.counter
                });
                this.counter++;
                this.attName = "";
                $(".attname").focus();
                this.getAttribute();
            }
            else {
                console.log("Error");
                $("#attnam").focus();
                return;
            }
        })
    }

    editrow(row) {
        if (row.val) {
            this.attid = row.autoid;
            this.attName = row.atname;
            $("#attnam").focus();
        }
    }

    DeleteRow(row) {
        this.attributeServies.attsave({
            "cmpid": 1,
            "fy": 5,
            "flag": "del",
            "createdby":"admin",
            "isact": row.val,
            "attid": row.autoid
        }).subscribe(result => {
            var dataset = result.data;
            console.log(dataset);
            if (dataset[0].funsave_attribute.maxid > 0) {
                alert("Data Delete Successfully");
            }
            else {
                console.log("Error");
                $("#attnam").focus();
                return;
            }
        })
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}