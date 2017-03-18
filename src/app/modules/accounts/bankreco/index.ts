import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddBankReco } from './add/addbr.comp';
import { ViewBankReco } from './view/viewbr.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule, CalendarModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class BankRecoComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: BankRecoComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add/:date', component: AddBankReco, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "brc", "rights": "add", "urlname": "/edit" } },
                    { path: '', component: ViewBankReco, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "brc", "rights": "view", "urlname": "/bankreco" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CheckboxModule, CalendarModule],
    declarations: [
        AddBankReco,
        ViewBankReco,
        BankRecoComp
    ],
    providers: [AuthGuard]
})

export default class BankRecoModule {
}