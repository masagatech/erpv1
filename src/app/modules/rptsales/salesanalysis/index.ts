import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SalesAnalysis } from './viewsa.comp';
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

export class SalesAnalysisComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: SalesAnalysisComp,
        canActivate: [AuthGuard],
        data: { "module": "rptsale" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: SalesAnalysis, canActivateChid: [AuthGuard], data: { "module": "rptsale", "submodule": "sa", "rights": "view", "urlname": "/salesanalysis" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, AutoCompleteModule, CalendarModule, NumTextModule],
    declarations: [
        SalesAnalysis,
        SalesAnalysisComp
    ],
    providers: [AuthGuard]
})

export default class SalesAnalysisModule {
}