import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { PDCReports } from './viewpdc.comp';
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

export class PDCComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PDCComp,
        canActivate: [AuthGuard],
        data: { "module": "rptaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: PDCReports, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "pdcr", "rights": "view", "urlname": "/pdc" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, AutoCompleteModule, CalendarModule, NumTextModule],
    declarations: [
        PDCReports,
        PDCComp
    ],
    providers: [AuthGuard]
})

export default class LedgerModule {
}