import { distance } from '../Utils';
import { LngLat, IShapeStyle, IRenderContext, IFillImage, Bounds, Pixel } from "../../index";
import { MapElement } from '../MapElement';

export class Marker extends MapElement {
    location: LngLat
    pixel:Pixel = {x:0,y:0}
    scale?:(zoom:number)=>number
    
    constructor(location: LngLat, style?: IShapeStyle) {
        super()
        this.type = 'marker'
        this.location = location
        this.style = Object.assign({},this.style, style)
    }
    async customRender(rctx:IRenderContext, renderStyle:IShapeStyle) {
      
        let ctx = rctx.ctx
        ctx.fillStyle = renderStyle.fillColor
        ctx.strokeStyle = renderStyle.strokeColor
        ctx.lineWidth = renderStyle.strokeWidth
        ctx.globalAlpha = renderStyle.opacity || 1

    
        let pixel:Pixel = this.view.lnglatToPixel(this.location)
        this.pixel = pixel
        let ratio = 1
        if(this.scale){
            ratio = this.scale(this.view.zoomLevel)
        }
        if(renderStyle.fillImage){
            let height = renderStyle.fillImage.height || renderStyle.fillImage.imgData.height as number
            let width = renderStyle.fillImage.width || renderStyle.fillImage.imgData.width as number
            ctx.drawImage(renderStyle.fillImage.imgData, pixel.x - (width / 2), pixel.y - (height / 2),width * ratio, height * ratio)
        } else {
            ctx.beginPath()
            ctx.arc(pixel.x, pixel.y, renderStyle.strokeWidth * ratio, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.fill()
        }

    }
    contain(pos:LngLat, pixel:Pixel){
        return this.visible && distance(pixel, this.pixel) < this.style.strokeWidth
    }

    protected makeBounds():Bounds{
        return null
        
    }
}
