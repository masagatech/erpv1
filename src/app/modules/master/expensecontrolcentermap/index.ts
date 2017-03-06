import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddExpenseComp } from './aded/addexpctrlmap.comp';
import { ViewExpenseComp } from './view/viewexpctrlmap.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

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
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddExpenseComp, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "eccm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: AddExpenseComp, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "eccm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewExpenseComp, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "eccm", "rights": "view", "urlname": "/expensecontrolcentermap" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        FileUploadModule, CalendarModule, NumTextModule],
    declarations: [
        AddExpenseComp,
        ViewExpenseComp,
        ExpenseComp
    ],
    providers: [AuthGuard]
})

export default class ExpenseModule {
}