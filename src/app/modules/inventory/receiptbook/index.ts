import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddReceiptBook } from './aded/addrb.comp';
import { ViewReceiptBook } from './view/viewrb.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'
import { GroupByPipe } from '../../../_pipe/groupby.pipe'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule, DataListModule, PanelModule } from 'primeng/primeng';

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
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddReceiptBook, canActivateChid: [AuthGuard], },
                    { path: 'edit/:rbid', component: AddReceiptBook, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewReceiptBook, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, DataListModule, PanelModule],
    declarations: [
        AddReceiptBook,
        ViewReceiptBook,
        ReceiptBookComp,
        GroupByPipe
    ],
    providers: [AuthGuard]
})

export default class ReceiptBookModule {
}