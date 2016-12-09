import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubMenuComponent } from '../modules/usercontrol/submenu/submenu.comp';
import { AutoCompleteComponent } from '../modules/usercontrol/autocomplete/autocomplete.comp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

@NgModule({
    imports: [RouterModule, FormsModule, CommonModule],
    declarations: [SubMenuComponent, AutoCompleteComponent],
    exports: [SubMenuComponent, AutoCompleteComponent]
})

export class SharedComponentModule { }
