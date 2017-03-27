import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { ViewBankBook } from './viewbb.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule, RadioButtonModule, CalendarModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class BankBookComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankBookComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: ViewBankBook, canActivateChid: [AuthGuard], data: { "module": "rptaccs", "submodule": "bb", "rights": "view", "urlname": "/bankbook" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, RadioButtonModule, CalendarModule],
    declarations: [
        ViewBankBook,
        BankBookComp
    ],
    providers: [AuthGuard]
})

export default class BankBookModule {
}