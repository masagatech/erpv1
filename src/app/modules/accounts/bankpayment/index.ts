import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { bankpaymentaddedit } from './aded/bpae.comp';     //Bank Payment
import { bankpaymentview } from './view/bpview.comp';      //Bank Bayment View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

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

                    { path: 'add', component: bankpaymentaddedit, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/add" }, },
                    { path: 'edit/:id', component: bankpaymentaddedit, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/edit" }, },
                    { path: '', component: bankpaymentview, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ap", "rights": "add", "urlname": "/bankpayment" }, },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,
        CalendarModule, NumTextModule],
    declarations: [
        bankpaymentaddedit,
        bankpaymentview,
        BankPaymentComp
    ],
    providers: [AuthGuard]
})

export default class BankPaymentModule {
}