import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { itemadd } from './add/add.comp';                            //item Add
import { itemview } from './view/view.comp';                         //item View

import { LazyLoadEvent, DataTableModule, CheckboxModule, AutoCompleteModule } from 'primeng/primeng';

import { NumTextModule } from '../../usercontrol/numtext';


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class ItemsMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ItemsMasterComp,
        canActivate: [AuthGuard],
        data: { "module": "sup" },
        children: [
            {
                path: '',
                children: [

                    //Bank Payment Add Edit View
                    { path: 'add', component: itemadd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "im", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: itemadd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "im", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: itemview, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "im", "rights": "view", "urlname": "/itemsmaster" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule
        , CheckboxModule, AutoCompleteModule, NumTextModule],
    declarations: [
        itemadd,
        itemview,
        ItemsMasterComp
    ],
    providers: [AuthGuard]
})

export default class ItemsMasterModule {
}