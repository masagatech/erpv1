import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddBudgetInitiateComponent } from './aded/addbdint.comp';
import { ViewBudgetInitiateComponent } from './view/viewbdint.comp';
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

export class BudgetInitiateComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BudgetInitiateComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddBudgetInitiateComponent, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdint", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddBudgetInitiateComponent, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdint", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewBudgetInitiateComponent, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdint", "rights": "view", "urlname": "/budgetinitiate" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddBudgetInitiateComponent,
        ViewBudgetInitiateComponent,
        BudgetInitiateComp
    ],
    providers: [AuthGuard]
})

export default class BudgetInitiateModule {
}