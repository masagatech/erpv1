import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { WareopebalAdd } from './add/add.comp';
import { WareopebalView } from './view/view.comp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class WarehouseOpeComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: WarehouseOpeComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: WareopebalAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "os", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: WareopebalAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "os", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: WareopebalView, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "os", "rights": "view", "urlname": "/openingbal" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule, CalendarModule],
    declarations: [
        WareopebalAdd,
        WareopebalView,
        WarehouseOpeComp
    ],
    providers: [AuthGuard]
})

export default class WarehouseOpenModule {
}