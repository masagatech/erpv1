import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service'
import { attributeService } from "../../../_service/attribute/attr-service";

declare var $: any;
@Component({
    templateUrl: 'hieview.comp.html',
    providers: [attributeService, CommonService]

}) export class hierview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    addNewhrar: any = [];
    newhirarname: any = "";
    newhrid: any = 0;
    // hrname: any = "";
    // hrid: any = 0;
    counter: any = 0;
    attid: any = 0;
    val: any;

    constructor(private setActionButtons: SharedVariableService, private hrarServies: attributeService, private _autoservice: CommonService) {
        this.counter = 0;
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $("#attnam").focus();
    }

    paramjson() {
        var param = {
            "harardetail": this.addNewhrar,
           // "hrarid": this.newhrid,
            "typ": 'hr',
            "createdby": "admin",
            "cmpid": 1
        }
        console.log(JSON.stringify(param));
        return param;
    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            this.hrarServies.attsave(
                this.paramjson()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_attribute.msg = "save") {
                    alert("Data Save Successfully");
                    this.addNewhrar = [];
                    $("#attnam").focus();
                    return;
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    getAutoCompleteAtt(me: any, arg: number) {
        var that = this;
        
        this._autoservice.getAutoData({ "type": "attribute", "search": arg == 0 ? me.newhirarname : me.hrname }).subscribe(data => {
            $(".hirar").autocomplete({
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
                        me.hrname = ui.item.label;
                        me.hrid = ui.item.value;
                    } else {
                        me.newhirarname = ui.item.label;
                        me.newhrid = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    private NewRowAdd() {
        this.addNewhrar.push({
            'hrname': this.newhirarname,
            'hrid':this.newhrid,
            'counter': this.counter
        });
        this.counter++;
        this.newhirarname = "";
        this.newhrid=0;
        //$("#attnam").focus();
    }

    private DeleteRow(val) {
        var index = -1;
        for (var i = 0; i < this.addNewhrar.length; i++) {
            if (this.addNewhrar[i].counter === val) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.addNewhrar.splice(index, 1);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}