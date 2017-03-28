import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service'
import { attributeService } from "../../../_service/attribute/attr-service";
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { LazyLoadEvent, DataTable, TreeNode, MenuItem } from 'primeng/primeng';


declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'attview.comp.html',
    providers: [attributeService, CommonService]
    //,AutoService
}) export class attrview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    attrList: any = [];
    addNewAttr: any = [];
    counter: any = 0;
    attid: any = 0;
    attributegrouplist: any = [];
    val: any;
    attrgrp: any = 0;
    attsub: any = 0;
    groupkey: any = "";
    key: any = "";
    keyid: number = 0;
    totalRecords: number = 0;
    parentattrlist: any = [];
    // isactive: boolean = false;
    AttributeAutodata: any[];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;
    dialogShow: boolean;
    selectedNode: any = [];
    attrname: string = "";
    attnam_normal: string = "";
    selectedFile: TreeNode;
    isDisabled: boolean = true;
    private items: MenuItem[];

    constructor(private setActionButtons: SharedVariableService, private attributeServies: attributeService,
        private _autoservice: CommonService, private _commonservice: CommonService, private _msg: MessageService,
        private _userService: UserService) {
        this.counter = 0;
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Attribute");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.getattributegroup();
        $("#attrdrop").focus();
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);
    }

    //Dropdown Attribute
    getattributegroup() {
        var that = this;
        this._commonservice.getMOM({
            "group": "attrgrp",
            "flag": "attrgrp"
        }).subscribe(data => {
            //that.attributegrouplist = data.data;
            var _d = data.data;
            for (var i = 0; i <= _d.length - 1; i++) {
                _d[i]["parent"] = true;
                _d[i]["leaf"] = (parseInt(_d[i]["ct"]) > 0 ? false : true);
            }
            that.parentattrlist = _d;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    funAddClild(node) {
        console.log(node);
        this.selectedNode = node;
        this.showDialog();
    }

    //Edit Dialog box
    funEditClild(node) {
        console.log(node);
        this.selectedNode = node;
        var that = this;
        that.showDialog();

    }

    //Dialog Modal 
    onAfterShow($event) {
        var that = this;
        if (that.selectedNode.parent) {
            setTimeout(function () {
                that.attrname = "";
                that.attid = 0;
                that.attrgrp = that.selectedNode.id;
                that.groupkey=that.selectedNode.key;
            }, 0);

        } else {
            setTimeout(function () {
                that.attrname = that.selectedNode.val;
                that.attid = that.selectedNode.sid;
                that.attrgrp = that.selectedNode.id;
                that.groupkey=that.selectedNode.key;
            }, 0);
        }
    }


    //Show Dialog Modal
    showDialog() {
        this.dialogShow = true;
        setTimeout(function () {
            $(".attrname").focus();
        }, 0)
    }

    //Hide Dialog Modal
    hideDialog() {
        this.dialogShow = false;
    }

    //Tree Save  
    saveSubAttr(isAttr) {
        var that = this;
        if (this.attrname == "") {
            this._msg.Show(messageType.error, "error", "Please enter attribute group name");
            return;
        }
        this.attributeServies.attsave(
            this.jsonparam()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_attribute.maxid == "-1") {
                this._msg.Show(messageType.error, "error", "Duplicate attribute");
                $(".attrname").focus();
                return;
            }
            if (dataset[0].funsave_attribute.maxid > 0) {
                that._msg.Show(messageType.success, "success", "Data Save Successfully");
                if (!that.selectedNode.children) that.selectedNode.children = [];
                if (that.selectedNode.parent) {
                    that.selectedNode.children.push({
                        "pid": that.selectedNode.id,
                        "val": that.attrname
                    });
                } else {
                    that.selectedNode.val = that.attrname;
                }
                that.hideDialog();
            }
            else {
                $("#attrdrop").focus();
                return;
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
        // if (onClose == 1) {
        //     this.hideDialog();
        // }
    }

    //Tree Expand
    nodeExpand(event) {
        var that = this;
        this.selectedNode = event.node;
        var pid = event.node
        this.attributeServies.attget({
            "pid": pid.id,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "fy": this.loginUser.login,
            "flag": "attrsub",
            "parentGrp":""
        }).subscribe(result => {
            var resultdata = result.data;
            that.selectedNode.children = resultdata[0];
        })

    }

    getgridSubAttribute() {
        commonfun.loader("#pnlGriddata");
        var that = this;
        that.attrList = [];
        that.attributeServies.attget({
            "cmpid": that.loginUser.cmpid,
            "createdby": that.loginUser.login,
            "fy": that.loginUser.login,
            "pid": that.attrgrp,
            "sub": that.attsub,
            "flag": ""
        }).subscribe(result => {
            var resultdata = result.data;
            that.totalRecords = resultdata[1][0].recordstotal;
            that.attrList = resultdata[0];
            commonfun.loaderhide("#pnlGriddata");
        })
    }

    //Tree Selected 
    onSelect(event) {
        this.items = [];
        var that = this;
        var _d = event.node;
        that.attrgrp = _d.id;
        that.attsub = _d.sid || 0;
        if (that.attsub == 0) {
            that.isDisabled = true;
            that.attrList = [];
        } else {
            //bind grid here  this.attrgrp && this.attsub
            this.items.push({ label: _d.val });
            that.getgridSubAttribute();
            this.isDisabled = false;
        }
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

    //Parameter Json
    jsonparam() {
        var Param = {
            "flag": "at",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "typ": "at",
            "attsub": this.attsub,
            "attid": this.attid,
            "attname": this.attrname,
            "attgroup": this.attrgrp,
            "attkey": this.groupkey,
            "createdby": this.loginUser.login,
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }
        console.log(Param);
        return Param;
    }

    //Get Sub Attribute 
    getAttribute(from: number, to: number) {
        this.attributeServies.attget({
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "fy": this.loginUser.login,
            "sub": this.attsub
        }).subscribe(result => {
            var resultdata = result.data;
            this.totalRecords = resultdata[1][0].recordstotal;
            this.addNewAttr = resultdata[0];
        })
    }

    loadRBIGrid(event: LazyLoadEvent) {
        //this.getAttribute(event.first, (event.first + event.rows));
    }

    //Add Subgroup Insert And Update 
    private NewRowAdd() {
        commonfun.loader();
        var that = this;
        var validateme = commonfun.validate();
        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }
        if (that.attnam_normal == "") {
            that._msg.Show(messageType.error, "error", "Please enter sub attribute");
            $(".attrname").focus();
            return;
        }
        that.attrname = that.attnam_normal;
        this.attributeServies.attsave(
            {
                "flag": "at",
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "typ": "at",
                "attsub": that.attsub,
                "attid": that.attid,
                "attname": that.attrname,
                "attgroup": that.attrgrp,
                //"attkey": this.att,
                "createdby": that.loginUser.login,
                "remark1": "",
                "remark2": "",
                "remark3": ""
            }
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_attribute.maxid == "-1") {
                that._msg.Show(messageType.error, "error", "Duplicate attribute");
                $(".attrname").focus();
                return;
            }
            if (dataset[0].funsave_attribute.maxid > 0) {
                that._msg.Show(messageType.success, "success", "Data Save Successfully");
                that.attnam_normal = "";
                that.attid = 0;
                $(".attrname").focus();

                that.getgridSubAttribute();
            }
            else {
                $("#attrdrop").focus();
                return;
            }
        }, err => {
            console.log("Error");
        }, () => {
            commonfun.loaderhide();
            // console.log("Complete");
        })
    }

    //Grid Row Click Event (Sub Attribute Edit)
    Editattr(event) {
        var data = event.data;
        if (data != undefined) {
            data = event.data;
        }
        else {
            data = event;
        }
        if (!data.islocked) {
            this.attid = data.autoid;
            this.attnam_normal = data.atname;
            $("#attrdrop").focus();
        }
    }

    //Clear Control
    ClearRow() {
        this.attid = 0;
        this.attrname = "";
        this.attrgrp = "";
        $("#attrdrop").focus();
    }

    DeleteRow(row) {
        this.attributeServies.attsave({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "del",
            "createdby": this.loginUser.login,
            "isact": row.active,
            "attid": row.autoid
        }).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_attribute.maxid > 0) {
                this.getgridSubAttribute();
            }
        })
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}