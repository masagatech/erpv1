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
        children: [
            {
                path: '',
                children: [
                    { path: '', component: AddExpenseBudgetComp, canActivateChid: [AuthGuard], },
                    { path: 'edit/:docno', component: AddExpenseBudgetComp, canActivateChid: [AuthGuard], },
                    //{ path: '', component: ViewExpenseBudgetComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule],
    declarations: [
        AddExpenseBudgetComp,
        //ViewExpenseBudgetComp,
        ExpenseBudgetComp
    ],
    providers: [AuthGuard]
})

export default class ExpenseModule {
}