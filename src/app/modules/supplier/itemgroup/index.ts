import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { itemgroupAdd } from './add/add.comp';
import { itemgroupView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumTextModule } from '../../usercontrol/numtext';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule, CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class ItemGroupComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ItemGroupComp,
        canActivate: [AuthGuard],
        data: { "module": "sup" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: itemgroupAdd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ig", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: itemgroupAdd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ig", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: itemgroupView, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ig", "rights": "view", "urlname": "/itemgroup" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig),
        SharedComponentModule, FormsModule, CommonModule, NumTextModule, DataTableModule, CheckboxModule, AutoCompleteModule],
    declarations: [
        itemgroupAdd,
        itemgroupView,
        ItemGroupComp
    ],
    providers: [AuthGuard]
})

export default class ItemGroupModule {
}