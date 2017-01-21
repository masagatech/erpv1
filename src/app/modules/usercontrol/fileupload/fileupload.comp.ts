import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FileUploadModule, FileUpload } from 'primeng/primeng';
import { AttachService } from '../../../_service/attach/attach-service' /* add reference for ass attach */
import { CommonService } from '../../../_service/common/common-service' /* add reference for view file type */

declare var $: any;

@Component({
    selector: '<fileupload></fileupload>',
    templateUrl: 'fileupload.comp.html',
    providers: [AttachService, CommonService]
})

export class FileUploadComponent implements OnInit, OnDestroy {
    @ViewChild('fuimg')
    fileupload: FileUpload;
    invalidFileSizeMessageSummary: string;

    @Input() attachfile: any = [];
    @Input() module: string = "";
    @Input() multi: boolean = false;
    @Input() isRaw: boolean = false;
    @Output() onStart = new EventEmitter();
    @Output() onComplete = new EventEmitter();
    //@Output() onError = new EventEmitter();

    headertitle: string = "";
    filetype: string = "";
    filesize: string = "";
    maxfilesize: string = "";

    @Input() uploadedFiles: any = [];
    fileTypeDT: any = [];

    // Pre Render

    constructor(private _attachservice: AttachService, private _commonservice: CommonService) {
        this.getFileType();
        this.getFileSize();
    }

    // Page Load

    ngOnInit() {
        setTimeout(function () {
            $(".ui-fileupload").find('button:first').removeAttr('class').addClass('ui-fileupload-choose btn btn-theme btn-xs');
            $(".ui-fileupload").find('button:not(:first)').hide();
        }, 0);

        this.fileupload.multiple = this.multi;

        this.getFileVal("filetype");
        this.getFileVal("filesize");
        this.getHeaderTitle();
    }

    // Get Header Title

    getHeaderTitle() {
        if (this.module == "Employee") {
            this.headertitle = "Upload Photo";
        }
        else if (this.module == "DocRepo") {
            this.headertitle = "Upload Docs";
        }
        else {
            this.headertitle = "Supporting Docs";
        }
    }

    // Get File Type

    getFileType() {
        var that = this;

        that._commonservice.getMOM({ "flag": "fileicon", "type": "all" }).subscribe(data => {
            that.fileTypeDT = data.data;
        });
    }

    // Get File Size

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

    getFileSize() {
        var that = this;

        that._commonservice.getMOM({ "flag": "filesize" }).subscribe(data => {
            that.maxfilesize = that.formatSizeUnits(data.data[0].filesize);
        });
    }

    getFileVal(flag) {
        var that = this;

        that._commonservice.getMOM({ "flag": flag }).subscribe(data => {
            if (flag == "filetype") {
                if (that.module == "Employee") {
                    that.filetype = "image/*";
                }
                else {
                    that.filetype = data.data[0].filetype;
                }
            }
            else if (flag == "filesize") {
                that.filesize = data.data[0].filesize;
            }
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    removeFileUpload() {
        this.uploadedFiles.splice(0, 1);
    }

    // Save Attach File

    saveAttach(saveAttach: any) {
        var that = this;
        that.onStart.emit();

        that._attachservice.saveAttach(saveAttach).subscribe(data => {
            var dataResult = data.data;
            that.onComplete.emit(dataResult[0].funsave_attach.athids);
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    saveMultiUploadedFile(event) {
        var that = this;
        var type, validmsg;

        for (let file of event.files) {
            if (that.module == "Employee") {
                that.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": "fa fa-file-photo-o" });
            }
            else {
                type = file.name.split('.').pop();

                that._commonservice.getMOM({ "flag": "fileicon", "type": type }).subscribe(data => {
                    if (data.data.length === 0) {
                        if (that.module == "Employee") {
                            validmsg = "success";
                        }
                        else {
                            validmsg = "failed";
                        }
                    }
                    else {
                        validmsg = "success";
                    }

                    if (validmsg === "success") {
                        that.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": data.data[0].fileicon });
                    }
                });
            }
        }

        that._commonservice.getMOM({ "flag": "fileicon", "type": type }).subscribe(data => {
            if (validmsg === "success") {
                var saveAttach = {
                    "files": that.uploadedFiles,
                    "module": that.module,
                    "cmpid": 2,
                    "uid": "1:vivek"
                }

                if (that.isRaw) {
                    that.onComplete.emit(saveAttach);
                }
                else {
                    that.saveAttach(saveAttach);
                }
            }
            else {
                alert(type + " file not allowed !!!!");
            }
        });
    }

    saveSingleUploadedFile(event) {
        var that = this;

        that.uploadedFiles = [];
        var file = event.files[0];

        var that = this;
        var type, validmsg;

        if (that.module == "Employee") {
            that.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": "fa fa-file-photo-o" });
        }
        else {
            type = file.name.split('.').pop();

            that._commonservice.getMOM({ "flag": "fileicon", "type": type }).subscribe(data => {
                if (data.data.length === 0) {
                    if (that.module == "Employee") {
                        validmsg = "success";
                    }
                    else {
                        validmsg = "failed";
                    }
                }
                else {
                    validmsg = "success";
                }

                if (validmsg === "success") {
                    that.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": data.data[0].fileicon });

                    var saveAttach = {
                        "files": that.uploadedFiles,
                        "module": that.module,
                        "cmpid": 2,
                        "uid": "1:vivek"
                    }

                    if (that.isRaw) {
                        that.onComplete.emit(saveAttach);
                    }
                    else {
                        that.saveAttach(saveAttach);
                    }
                }
                else {
                    alert(type + " file not allowed !!!!");
                }
            });
        }
    }

    onUpload(event) {
        var that = this;

        if (that.multi) {
            that.saveMultiUploadedFile(event);
        }
        else {
            that.saveSingleUploadedFile(event);
        }
    }

    ngOnDestroy() {
    }
}