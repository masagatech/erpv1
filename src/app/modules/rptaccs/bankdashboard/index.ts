import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { BankDashboardReports } from './viewbdb.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectButtonModule, DataGridModule, PanelModule, DataTableModule, CheckboxModule, ChartModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class BankDashboardComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankDashboardComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: BankDashboardReports, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "bv", "rights": "view", "urlname": "/bankview" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        SelectButtonModule, DataGridModule, PanelModule, DataTableModule, CheckboxModule, ChartModule],
    declarations: [
        BankDashboardReports,
        BankDashboardComp
    ],
    providers: [AuthGuard]
})

export default class APARModule {
}