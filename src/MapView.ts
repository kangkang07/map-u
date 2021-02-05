import {IRenderContext, IShapeStyle, IPromiseCallback, LngLat, EventType, Pixel  } from '../index.d'
import { MapElement } from './MapElement';
import { MapEvent } from './Models';
import { AsyncQueue } from './Utils/asyncQueue';
import { EventManager } from './Utils/eventManager';

const AMap:any = (window as any).AMap
export class MapView extends MapElement{

    /**
     * 高德地图实例
     * Gaode map instance
     */
    map: AMap.Map
    ready: -1|0|1 = 0

    private readyQueue = new AsyncQueue()

    /**
     * the map's zoom level.
     */
    zoomLevel?:number

    /**
     * the map rectangle bounds
     */
    mapBounds:[LngLat, LngLat] = [[0,0],[0,0]]
    
    /**
     * the canvas layer of Gaode map
     */
    customCanvasLayer: any

    /**
     * the flag for render 
     * when called render, the canvas is rendered in next event loop
     */
    private renderFlag:boolean = false

    // 空事件处理。当没有触发任何定义事件的时候，触发空事件
    /**
     * when an event is triggered while no custom handler was called, will call this event
     */
    eventEmptyManager:EventManager<MapEvent> = new EventManager()

    // 事件相关
    mouseDown: boolean = false
    mouseDownTime: number = null

    protected zoomLayers = [5,10]

    private renderedImg?: any

    extraData:any = {}
    

    constructor(el?:HTMLElement,config?:any){
        super()
        this.view = this
        if(el){
            this.init(el, config)
        }
    }
  
    async init(el: any, config:any, plugins: string[] = ['AMap.MouseTool']) {
        this.map = new AMap.Map(el, config) 
        
        return new Promise<void>((resolve, reject) => {
            this.map.plugin(plugins, () => {
                // this.pixiApp = new PIXI.Application({
                //     transparent:true,
                // })

                let canvas = document.createElement('canvas')
                this.canvas = canvas

                let layer = new (AMap as any).CustomLayer(canvas,{
                    // alwaysRender: true,
                    map: this.map,
                    zIndex:100
                })

                layer.render = (rctx?: IRenderContext) => {
                    let size = this.map.getSize();//resize
                    
                    let width = size.getWidth();
                    let height = size.getHeight();
                    let retina = AMap.Browser.retina;
                  
                    canvas.width = width;
                    canvas.height = height;//清除画布
                    canvas.style.width = width+'px'
                    canvas.style.height = height + 'px'

                    if (!rctx) {
                        rctx = {
                            // callByMap: true
                        }
                    }
                    if(rctx.callByMap === undefined){
                        rctx.callByMap = true
                    }
                    rctx.ctx = canvas.getContext('2d')
                    rctx.retina = retina
                    rctx.canvas = canvas
                    let bounds = this.map.getBounds()
                    let latRange = [], lngRange = []
                    let ne = bounds.getNorthEast(), sw = bounds.getSouthWest()
                    this.bounds = [[sw.getLng(), sw.getLat()],[ne.getLng(),ne.getLat()]]
                    this.zoomLevel = this.map.getZoom()
                
                    rctx.mapBounds = this.mapBounds
                    this.eachChildren(ele=>{
                        // console.log('each ch of view', ele)
                        ele.render(rctx)
                    })
                   
                }
                ['click','dblclick', 'mousemove'].forEach((ename:EventType) => {
                    canvas.addEventListener(ename, (event: MouseEvent) => {
                        let dur = Date.now() - this.mouseDownTime
                        if (ename === 'click' && dur > 300) {
                            return
                        }
                        // 鼠标按下时不响应事件
                        if (this.mouseDown) {
                            return
                        }

                        let lnglat = this.pixelToLngLat(event.offsetX, event.offsetY)
              
                        const mapEvent = MapEvent.create(event, lnglat)
                        
                        let flag = false
                        this.eachChildren(ele=>{
                            
                            if(ele.trigger(ename,mapEvent)){
                               
                                flag = true
                                return false
                            }
                        },true)
                        if(!flag ){
                            this.eventEmptyManager.trigger(ename, mapEvent)
                        }
                            
                       
                    })
                })
                canvas.addEventListener('mousedown', ev => {
                    this.mouseDownTime = Date.now()
                    this.mouseDown = true
                })
                canvas.addEventListener('mouseup', ev => {
                    this.mouseDown = false
                })

                this.customCanvasLayer = layer

                this.ready = 1
                this.readyQueue.ready()
                resolve()
            });
        })
    }

    async render() {
        this.renderFlag = true
        setTimeout(() => {
            if (this.renderFlag) {
                this.renderFlag = false
                this.renderedImg = null
                this.customCanvasLayer.render({callByMap:false})
            }
        })

    }

    setCity(city:any){
        this.readyQueue.call(()=>{
            this.map.setCity(city,null)
        })
    }

    contain(pos:LngLat){
        return false
    }
    makeBounds(){return null}


    pixelToLngLat(x:number,y:number):LngLat{
        let [sw, ne] = this.bounds
        
        let lngRatio = x / this.canvas.width 
        let latRatio = y / this.canvas.height
        let lng = (ne[0] - sw[0]) * lngRatio + sw[0]
        let lat = (ne[1] - sw[1]) * (1-latRatio) + sw[1]
        return [lng,lat]
    
    }
   
    lnglatToPixel(lnglat: LngLat):Pixel {

        let [sw, ne] = this.bounds
      
        let lngRatio = (lnglat[0] - sw[0]) / (ne[0] - sw[0])
        let latRatio = (lnglat[1] - sw[1]) / (ne[1] - sw[1])
        let x = lngRatio * this.canvas.width
        let y = (1 - latRatio) * this.canvas.height
        return { x, y }
    
    }

}

export default new MapView()