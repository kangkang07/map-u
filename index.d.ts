export declare interface IShapeStyle {
    fillColor?: string // 多边形填充颜色
    strokeWidth?: number // 线条宽度
    strokeColor?: string // 线条颜色
    opacity?: number
    fillImage?:IFillImage
    [other: string]: any
}

export declare interface IFillImage {
    imgData?: CanvasImageSource
    height?:number
    width?:number
}

export declare interface IRenderContext{
    ctx?: CanvasRenderingContext2D |OffscreenCanvasRenderingContext2D
    event?: MapEvent
    retina?: boolean
    canvas?: HTMLCanvasElement |OffscreenCanvas
    mapBounds?: [any, any]
    callByMap?: boolean
    fullRender?:boolean
    zoomLevel?:number
    offScreen?:boolean
}

export declare interface ITile{
    key:string
    x?:number
    y?:number
    resolution?:number
    data?:ImageBitmap
    bounds?:Bounds
}



export declare interface IPromiseCallback{
    resolve:Function
    reject:Function
}

export declare type LngLat = [number, number]
export declare type Pixel = {x:number,y:number}

export declare type Bounds = [LngLat, LngLat]


export declare class MapEvent extends MouseEvent {
    extData:any
    pos:LngLat
    mapElement:MapElement
    static create(mouseEv: MouseEvent, extData?:any) : MapEvent
}


export declare type EventType = 'click' | 'hover' | 'dblclick' | 'mousemove' |'unmousemove'

export declare type ElementType = 'layer'|'circle'|'line'|'marker'|'polygon'|'shape'|'groupmarker'

export declare class MapElement {
    id:string
    name?:string
    parent?:MapElement
    type: ElementType
    style:IShapeStyle
    view:MapView
    dataset?:any
    bounds:Bounds

    render(rctx?:IRenderContext): Promise<ImageBitmap|void>
    renderView(): void
    contain(pos:LngLat):boolean
    addChildren(el:MapElement)
    removeChildren(el:MapElement)

    hide(): void
    show(): void

    clear(repaint?:boolean)
    setZIndex(zIndex:number)
    getZIndex()
    eachChildren(cb:(item:MapElement)=>boolean|void)
    on(eventName:EventType, handler:(el:MapEvent)=>any)
    off(eventName:EventType, handler?:(el:MapEvent)=>any)
    trigger(eventName:EventType, ev:MapEvent)

    makeBounds(): Bounds

}

export declare class MapView extends MapElement {
    map:AMap.Map
    constructor(el?:HTMLElement,config?:any)
    init(el:HTMLElement, config:any)
    pixelToLngLat(x:number,y:number):LngLat
    lnglatToPixel(lnglat: LngLat)
}

export declare class Layer extends MapElement {

}


export declare class Polygon extends MapElement {
    path: LngLat[]
    constructor(path: LngLat[], style?: IShapeStyle)
}

export declare class Circle extends MapElement {
    center: LngLat
    radius: number
    constructor(center: LngLat, radius: number, style?: IShapeStyle)
}

export declare class PolyLine extends MapElement {
    path: LngLat[]
    constructor(path: LngLat[], style?: IShapeStyle)

}

export declare class Marker extends MapElement {
    constructor(location: LngLat, style?: IShapeStyle)
    position:LngLat
    scale?:(zoom:number)=>number
}


export declare interface IRenderer {
    renderCircle
}

declare class GroupMarker extends Marker {
    constructor(marker:Marker)

    markers:Marker[]
    offset:Pixel
    numOffset:Pixel


    textStyle:{
        fontSize:number
        color:string
    }
}

export declare class MarkerLayer extends Layer{
    groupThreshold:number
    canMerge?:(m1:Marker, m2:Marker, zoom:number)=>boolean 
    beforeRender:(gm:GroupMarker)=>any
    addChildren(el:Marker)
}