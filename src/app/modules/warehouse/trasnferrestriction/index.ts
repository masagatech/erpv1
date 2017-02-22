import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { TRAdd } from './add/add.comp';
import { TRView } from './view/view.comp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class TransferResComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TransferResComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: TRAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "tr", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: TRAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "tr", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: TRView, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "tr", "rights": "view", "urlname": "/transferres" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,
        DataTableModule],
    declarations: [
        TRAdd,
        TRView,
        TransferResComp
    ],
    providers: [AuthGuard]
})

export default class TransferResModule {
}