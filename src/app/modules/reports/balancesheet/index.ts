import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { BSRReports } from './viewbsr.comp';
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

export class BanlanceSheetComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BanlanceSheetComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: BSRReports, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "BSR", "rights": "view", "urlname": "/profitnloss" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataGridModule, PanelModule, DataTableModule, CheckboxModule, CalendarModule, NumTextModule],
    declarations: [
        BSRReports,
        BanlanceSheetComp
    ],
    providers: [AuthGuard]
})

export default class BalanceSheetModule {
}