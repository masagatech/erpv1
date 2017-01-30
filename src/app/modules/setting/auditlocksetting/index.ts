import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { ALSAddEdit } from './addals.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class AuditLockSettingComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: AuditLockSettingComp,
        canActivate: [AuthGuard],
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: ALSAddEdit, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"als", "rights": "add", "urlname": "/auditlocksetting" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
    declarations: [
        AuditLockSettingComp,
        ALSAddEdit
    ],
    providers: [AuthGuard]
})

export default class AuditLockSettingModule {
}