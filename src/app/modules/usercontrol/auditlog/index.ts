import { NgModule, Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { LogService } from '../../../_service/auditlog/log-service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DialogModule, DataGridModule, PanelModule } from 'primeng/primeng';

declare var $: any;

@Component({
    selector: '<auditlog></auditlog>',
    templateUrl: 'auditlog.comp.html',
    providers: [LogService]
})

export class AuditLogComp implements OnInit, OnDestroy {
    @Input() module: string = "";
    @Input() cmpid: number = 0;
    @Input() fy: number = 0;
    @Input() parentid: number = 0;

    auditLogDT: any = [];

    constructor(private _logservice: LogService, private _msg: MessageService) {
        this.getAuditLog();
    }

    ngOnInit() {
    }

    getAuditLog() {
        var that = this;

        that._logservice.getAuditLog({
            "module": that.module, "parentid": that.parentid, "cmpid": that.cmpid, "fy": that.fy
        }).subscribe(log => {
            that.auditLogDT = log.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    closeLogPopup() {
        $('#divLogModel').modal('hide');
    }

    ngOnDestroy() {
    }
}

@NgModule({
    imports: [CommonModule, FormsModule, DialogModule, DataGridModule, PanelModule],
    declarations: [
        AuditLogComp
    ],
    exports: [AuditLogComp]
})

export class AuditLogModule {

}