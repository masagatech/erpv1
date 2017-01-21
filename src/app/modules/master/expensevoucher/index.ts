import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddExpenseVocuherComp } from './aded/addexpvoucher.comp';
import { ViewExpenseVoucherComp } from './view/viewexpvoucher.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'
//import { FilterByPipe } from '../../../_pipe/filterby.pipe';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class ExpenseVoucherComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ExpenseVoucherComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddExpenseVocuherComp, canActivateChid: [AuthGuard], },
                    { path: 'edit/:docno', component: AddExpenseVocuherComp, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewExpenseVoucherComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule],
    declarations: [
        AddExpenseVocuherComp,
        ViewExpenseVoucherComp,
        ExpenseVoucherComp
    ],
    providers: [AuthGuard]
})

export default class ExpenseModule {
}