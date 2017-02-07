export class ActionBtnProp {
    constructor(_id: string,
        _text: string,
        _icon: string,
        _enabled: boolean,
        _hide: boolean) {
        this.id = _id;
        this.text = _text;
        this.icon = _icon,
            this.enabled = _enabled;
        this.hide = _hide;
    }
    id: string
    text: string
    icon: string
    enabled: boolean
    hide: boolean
}



export class Details {
    constructor(_type: string,
        _details: any) {
        this.type = _type;
        this.details = _details;
    }
    type: string
    details: any
}

