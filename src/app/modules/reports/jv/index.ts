import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { JVReports } from './viewjv.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableModule, CheckboxModule, AutoCompleteModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class JVRptComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: JVRptComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: JVReports, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "jvr", "rights": "view", "urlname": "/jv" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, AutoCompleteModule, CalendarModule, NumTextModule],
    declarations: [
        JVReports,
        JVRptComp
    ],
    providers: [AuthGuard]
})

export default class DebtorsModule {
}