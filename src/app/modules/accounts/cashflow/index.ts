import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddCashFlow } from './aded/addcf.comp';
import { ViewCashFlow } from './view/viewcf.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class CashFlowComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: CashFlowComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddCashFlow, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cf", "rights": "add", "urlname": "/add" } },
                    { path: 'details/:id', component: AddCashFlow, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cf", "rights": "edit", "urlname": "/edit" } },
                    { path: 'edit/:id', component: AddCashFlow, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cf", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewCashFlow, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cf", "rights": "view", "urlname": "/cashflow" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddCashFlow,
        ViewCashFlow,
        CashFlowComp
    ],
    providers: [AuthGuard]
})

export default class CashFlowModule {
}