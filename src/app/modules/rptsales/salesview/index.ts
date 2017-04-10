import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SalesView } from './viewsv.comp';
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

export class SalesViewComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: SalesViewComp,
        canActivate: [AuthGuard],
        data: { "module": "rptsale" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: SalesView, canActivateChid: [AuthGuard], data: { "module": "rptsale", "submodule": "sv", "rights": "view", "urlname": "/salesview" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, AutoCompleteModule, CalendarModule, NumTextModule],
    declarations: [
        SalesView,
        SalesViewComp
    ],
    providers: [AuthGuard]
})

export default class SalesAnalysisModule {
}