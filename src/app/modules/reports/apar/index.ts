import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { APARReports } from './apar.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScheduleModule, DataTableModule, CheckboxModule, ListboxModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class APARComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: APARComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: APARReports, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "bv", "rights": "view", "urlname": "/bankview" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        ScheduleModule, DataTableModule, CheckboxModule, ListboxModule, NumTextModule],
    declarations: [
        APARReports,
        APARComp
    ],
    providers: [AuthGuard]
})

export default class APARModule {
}