import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { TrialBalance } from './viewtb.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataGridModule, PanelModule, DataTableModule, CheckboxModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class TBWithCustComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TBWithCustComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: TrialBalance, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "tb", "rights": "view", "urlname": "/trialbalance" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataGridModule, PanelModule, DataTableModule, CheckboxModule, CalendarModule, NumTextModule],
    declarations: [
        TrialBalance,
        TBWithCustComp
    ],
    providers: [AuthGuard]
})

export default class TBWithCustModule {
}