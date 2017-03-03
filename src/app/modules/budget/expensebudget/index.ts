import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddExpenseBudgetComp } from './aded/addexpbudget.comp';
//import { ViewExpenseBudgetComp } from './view/viewexpbudget.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class ExpenseBudgetComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ExpenseBudgetComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: AddExpenseBudgetComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"sf", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddExpenseBudgetComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"sf", "rights": "edit", "urlname": "/edit" } },
                    //{ path: '', component: ViewExpenseBudgetComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"sf", "rights": "view", "urlname": "/expensebudget" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, NumTextModule],
    declarations: [
        AddExpenseBudgetComp,
        //ViewExpenseBudgetComp,
        ExpenseBudgetComp
    ],
    providers: [AuthGuard]
})

export default class ExpenseModule {
}