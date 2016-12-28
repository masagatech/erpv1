import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FileUploadModule, FileUpload } from 'primeng/primeng';
import { AttachService } from '../../../_service/attach/attach-service' /* add reference for ass attach */

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

    constructor(private _attachservice: AttachService) {

    }

    uploadedFiles: any[] = [];

    onUpload(event) {
        var that = this;
        debugger;
        var xhr = JSON.parse(event.xhr.response); 
        console.log(xhr);

        for (let file of xhr) {
            this.uploadedFiles.push({ "name": file.name, "size": file.size, "path": file.path, "type": file.type });
        }

        var saveAttach = {
            "files": that.uploadedFiles,
            "module": that.module,
            "cmpid": 2,
            "uid": "1:vivek"
        }

        if (that.isRaw) {
            console.log(that.uploadedFiles);
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