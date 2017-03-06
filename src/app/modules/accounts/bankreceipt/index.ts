import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { AddEditBankReceipt } from './aded/braded.comp';     //Bank Payment
import { ViewBankReceipt } from './view/brview.comp';      //Bank Bayment View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class BankReceiptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankReceiptComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View

                    { path: 'add', component: AddEditBankReceipt, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ar", "rights": "add", "urlname": "/add" } },
                    { path: 'details/:id', component: AddEditBankReceipt, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ar", "rights": "edit", "urlname": "/edit" } },
                    { path: 'edit/:id', component: AddEditBankReceipt, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ar", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewBankReceipt, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "ar", "rights": "view", "urlname": "/bankreceipt" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,
        DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddEditBankReceipt,
        ViewBankReceipt,
        BankReceiptComp
    ],
    providers: [AuthGuard]
})

export default class BankReceiptModule {
}