import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddReceiptBook } from './aded/addrb.comp';
import { ViewReceiptBook } from './view/viewrb.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class ReceiptBookComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ReceiptBookComp,
        canActivate: [AuthGuard],
        data: { "module": "invaccs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddReceiptBook, canActivateChid: [AuthGuard],  data: { "module": "invaccs", "submodule":"rb", "rights": "add", "urlname": "/add" }},
                    { path: 'edit/:rbid', component: AddReceiptBook, canActivateChid: [AuthGuard], data: { "module": "invaccs", "submodule":"rb", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewReceiptBook, canActivateChid: [AuthGuard], data: { "module": "invaccs", "submodule":"rb", "rights": "view", "urlname": "/receiptbook" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddReceiptBook,
        ViewReceiptBook,
        ReceiptBookComp
    ],
    providers: [AuthGuard]
})

export default class ReceiptBookModule {
}