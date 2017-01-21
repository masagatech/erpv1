import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddExpenseComp } from './aded/addexpctrlmap.comp';
import { ViewExpenseComp } from './view/viewexpctrlmap.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class ExpenseComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ExpenseComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddExpenseComp, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: AddExpenseComp, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewExpenseComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        FileUploadModule],
    declarations: [
        AddExpenseComp,
        ViewExpenseComp,
        ExpenseComp
    ],
    providers: [AuthGuard]
})

export default class ExpenseModule {
}