import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddRBI } from './aded/addrbi.comp';
import { ViewRBI } from './view/viewrbi.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule, DataListModule, PanelModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class ReceiptBookIssuedComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ReceiptBookIssuedComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddRBI, canActivateChid: [AuthGuard],  data: { "module": "accs", "submodule":"ap", "rights": "add", "urlname": "/add" }, },
                    { path: 'edit/:irbid', component: AddRBI, canActivateChid: [AuthGuard],  data: { "module": "accs", "submodule":"ap", "rights": "add", "urlname": "/edit" }, },
                    { path: '', component: ViewRBI, canActivateChid: [AuthGuard],  data: { "module": "accs", "submodule":"ap", "rights": "add", "urlname": "/receiptbookissued" }, },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, DataListModule, PanelModule],
    declarations: [
        AddRBI,
        ViewRBI,
        ReceiptBookIssuedComp
    ],
    providers: [AuthGuard]
})

export default class ReceiptBookIssuedModule {
}