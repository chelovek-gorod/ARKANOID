import { Application } from 'pixi.js'
import { playMusic, stopMusic } from './sound'
import { screenResize, pointerMove } from './events'

const isOnRightClickScreenshot = false

const isNeedCursorPositionUpdate = true
const isCursorHidden = false
if (isCursorHidden) document.body.style.cursor = 'none'

const app = new Application()

const autoFullScreen = false
function setFullScreen( canvas ) {
    canvas.onclick = () => {
        if (document.fullscreenEnabled
        && !document.fullscreenElement) {
            document.body.requestFullscreen();
        }
    }
}

const appSettings = {
    background: 0x000000,
    antialias: true, // сглаживание
    resolution: 2,
    resizeTo: window
}

Promise.all( [app.init( appSettings )] ).then( appReady )
function appReady() {
    app.ticker.add( time => tick(time) )
    document.body.append( app.canvas )
    if (!isOnRightClickScreenshot) app.canvas.oncontextmenu = (event) => event.preventDefault()
    resize()

    if (isNeedCursorPositionUpdate) {
        app.stage.eventMode = 'static'
        app.stage.on('pointermove', (e) => pointerMove(e) )
    }

    if (autoFullScreen) setFullScreen( app.canvas )
}

let tickerArr = [] // entities for update (need e.tick(delta) method)

const appScreen = {}

function resize() {
    appScreen.width = app.screen.width
    appScreen.height = app.screen.height
    appScreen.centerX = app.screen.width / 2
    appScreen.centerY = app.screen.height / 2
    appScreen.minSize = app.screen.width > app.screen.height ? app.screen.height : app.screen.width
    appScreen.offsetX = (appScreen.width - appScreen.minSize) / 2
    appScreen.offsetY = (appScreen.height - appScreen.minSize) / 2

    screenResize( appScreen )
}


export function getAppScreen() {
    return appScreen
}

export function sceneAdd(element) {
    app.stage.addChild( element )
}

export function sceneRemove(element) {
    app.stage.removeChild( element )
}

let orientation = window.matchMedia("(orientation: portrait)");
orientation.addEventListener("change", () => setTimeout(resize, 0))
window.addEventListener('resize', () => setTimeout(resize, 0))

let isOnFocus = true
window.addEventListener('focus', playMusic)
window.addEventListener('blur', stopMusic)
if ('hidden' in document) document.addEventListener('visibilitychange', visibilityOnChange)
function visibilityOnChange( isHide ) {
    if (isHide) stopMusic()
    else playMusic()
    isOnFocus = !isHide
}

export function checkFocus() {
    return isOnFocus
}

let isTick = true

export function stopTicker() {
    isTick = false
}

export function startTicker() {
    isTick = true
}

function tick(time) {
    if (!isTick) return
    // if (delta = 1) -> FPS = 60 (16.66ms per frame)
    tickerArr.forEach( element => element.tick(time) )
    // time.elapsedMS - in milliseconds
    // time.deltaMS   - ???
    // time.deltaTime - in frame
}

export function tickerAdd( element ) {
    if ('tick' in element) tickerArr.push( element )
    else console.warn( 'TRY TO ADD ELEMENT IN TICKER WITHOUT .tick() METHOD:', element)
}

export function tickerRemove( element ) {
    tickerArr = tickerArr.filter( e => e !== element )
}