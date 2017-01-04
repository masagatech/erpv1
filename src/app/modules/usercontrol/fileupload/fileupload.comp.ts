import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FileUploadModule, FileUpload } from 'primeng/primeng';
import { AttachService } from '../../../_service/attach/attach-service' /* add reference for ass attach */
import { CommonService } from '../../../_service/common/common-service' /* add reference for view file type */

declare var $: any;

@Component({
    selector: '<fileupload></fileupload>',
    templateUrl: 'fileupload.comp.html',
    providers: [AttachService]
})

export class FileUploadComponent implements OnInit, OnDestroy {
    @ViewChild('fuimg')
    fileupload: FileUpload;

    @Input() attachfile: any = [];
    @Input() module: string = "";
    @Input() multi: boolean = false;
    @Input() isRaw: boolean = false;
    @Output() onStart = new EventEmitter();
    @Output() onComplete = new EventEmitter();
    public progress: number = 0;

    constructor(private _attachservice: AttachService, private _commonservice: CommonService) {

    }

    uploadedFiles: any = [];

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

    onUpload(event) {
        var that = this;
        var i = 0;
        var path = null;

        if (that.multi) {
            for (let file of event.files) {
                this._commonservice.getMOM({ "flag": "allowedext", "val": file.name.split('.').pop() }).subscribe(data => {
                    var filetype = data.data[0].fileicon;
                    this.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": filetype });
                }, err => {
                    console.log("Error");
                }, () => {
                    console.log("Complete");
                })
            }
        }
        else {
            this.uploadedFiles = [];
            var file = event.files[0];

            this._commonservice.getMOM({ "flag": "allowedext", "val": file.name.split('.').pop() }).subscribe(data => {
                var filetype = data.data[0].fileicon;
                this.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.name, "type": filetype });
            }, err => {
                console.log("Error");
            }, () => {
                console.log("Complete");
            })
        }

        console.log(this.uploadedFiles);

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

    ngOnInit() {
        setTimeout(function () {
            $(".ui-fileupload").find('button:first').removeAttr('class').addClass('ui-fileupload-choose btn btn-theme btn-xs');
            $(".ui-fileupload").find('button:not(:first)').hide();
        }, 0);

        this.fileupload.multiple = this.multi;
    }

    ngOnDestroy() {
    }
}