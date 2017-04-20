import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { AddEditBankPayment } from './aded/bpae.comp';     //Bank Payment
import { ViewBankPayment } from './view/bpview.comp';      //Bank Bayment View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, DataListModule, CheckboxModule, TriStateCheckboxModule, AutoCompleteModule, DialogModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';
import { AuditLogModule } from '../../usercontrol/auditlog';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class BankPaymentComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankPaymentComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View

                    { path: 'add', component: AddEditBankPayment, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/add" }, },
                    { path: 'details/:id', component: AddEditBankPayment, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/edit" }, },
                    { path: 'edit/:id', component: AddEditBankPayment, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/edit" }, },
                    { path: '', component: ViewBankPayment, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/bankpayment" }, },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,
        CalendarModule, NumTextModule, AuditLogModule, DataTableModule, DataListModule, CheckboxModule,
        DialogModule, TriStateCheckboxModule, AutoCompleteModule],
    declarations: [
        AddEditBankPayment,
        ViewBankPayment,
        BankPaymentComp
    ],
    providers: [AuthGuard]
})

export default class BankPaymentModule {
}