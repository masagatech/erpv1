import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddStartForecastingComp } from './aded/addbdsf.comp';
import { ViewStartForecastingComp } from './view/viewbdsf.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class StartForecastingComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: StartForecastingComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddStartForecastingComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdsf", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddStartForecastingComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdsf", "rights": "edit", "urlname": "/edit" } },
                    { path: 'details/:id', component: AddStartForecastingComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdsf", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewStartForecastingComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdsf", "rights": "view", "urlname": "/StartForecasting" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, NumTextModule],
    declarations: [
        AddStartForecastingComp,
        ViewStartForecastingComp,
        StartForecastingComp
    ],
    providers: [AuthGuard]
})

export default class StartForecastingModule {
}