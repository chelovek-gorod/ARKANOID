import { tickerAdd, tickerRemove } from './application'

// getTickRate -> time / tick
export const tick = 16.66 // milliseconds

// timers (milliseconds)
const smoothInOutTime = 600
// steps alpha
const smoothStepAlpha = 1 / (smoothInOutTime / tick)

export function smoothShowElement( element, side = null, callback = null ) {
    switch(side) {
        case 'top' :
            element.smoothVisibilitySettings = {
                targetPosition : element.position.y,
                isVerticalAxis : true,
                step : (element.height / smoothInOutTime) * tick,
            }
            element.position.y -= element.height
        break;
        case 'bottom' :
            element.smoothVisibilitySettings = {
                targetPosition : element.position.y,
                isVerticalAxis : true,
                step : -((element.height / smoothInOutTime) * tick),
            }
            element.position.y += element.height
        break;
        case 'left' :
            element.smoothVisibilitySettings = {
                targetPosition : element.position.x,
                isVerticalAxis : false,
                step : (element.width / smoothInOutTime) * tick,
            }
            element.position.x -= element.width
        break;
        case 'right' :
            element.smoothVisibilitySettings = {
                targetPosition : element.position.x,
                isVerticalAxis : false,
                step : -((element.width / smoothInOutTime) * tick),
            }
            element.position.x += element.width
        break;
        default: element.smoothVisibilitySettings = null
    }

    if (element.alpha) element.alpha = 0
    
    if (!element.visible) element.visible = true

    element.tick = (delta) =>{
        if(element.smoothVisibilitySettings) {
            if (element.smoothVisibilitySettings.isVerticalAxis) {
                element.position.y += element.smoothVisibilitySettings.step * delta
            } else {
                element.position.x += element.smoothVisibilitySettings.step * delta
            }
        }

        element.alpha += smoothStepAlpha * delta

        if (element.alpha >= 1) {
            if (element.smoothVisibilitySettings) {
                if (element.smoothVisibilitySettings.isVerticalAxis) {
                    element.position.y = element.smoothVisibilitySettings.targetPosition
                } else {
                    element.position.x = element.smoothVisibilitySettings.targetPosition
                }
            }
            element.alpha = 1
            element.smoothVisibilitySettings = null
            tickerRemove( element )
            if (callback) callback()
        }
    }
    
    tickerAdd( element )
}

export function smoothHideElement( element, side = null, callback = null ) {
    switch(side) {
        case 'top' :
            element.smoothVisibilitySettings = {
                isVerticalAxis: true,
                targetPosition: element.position.y,
                step: -((element.height / smoothInOutTime) * tick)
            }
        break;
        case 'bottom' :
            element.smoothVisibilitySettings = {
                isVerticalAxis: true,
                targetPosition: element.position.y,
                step: (element.height / smoothInOutTime) * tick
            }
        break;
        case 'left' :
            element.smoothVisibilitySettings = {
                isVerticalAxis: false,
                targetPosition: element.position.x,
                step: -((element.width / smoothInOutTime) * tick)
            }
        break;
        case 'right' :
            element.smoothVisibilitySettings = {
                isVerticalAxis: false,
                targetPosition: element.position.x,
                step: (element.width / smoothInOutTime) * tick
            }
        break;
        default: element.smoothVisibilitySettings = null
    }

    element.tick = (delta) =>{
        if(element.smoothVisibilitySettings) {
            if (element.smoothVisibilitySettings.isVerticalAxis) {
                element.position.y += element.smoothVisibilitySettings.step * delta
            } else {
                element.position.x += element.smoothVisibilitySettings.step * delta
            }
        }

        element.alpha -= smoothStepAlpha * delta

        if (element.alpha <= 0) {
            if (element.smoothVisibilitySettings) {
                if (element.smoothVisibilitySettings.isVerticalAxis) {
                    element.position.y = element.smoothVisibilitySettings.targetPosition
                } else {
                    element.position.x = element.smoothVisibilitySettings.targetPosition
                }
            }
            element.alpha = 0
            element.visible = false
            element.smoothVisibilitySettings = null
            tickerRemove( element )
            if (callback) callback()
        }
    }

    tickerAdd( element )
}

export function checkLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    if (denom === 0) return null // Параллельные линии

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        // Возвращаем точку пересечения
        return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) }
    }
    return null // Нет пересечения
}

export function getDistance(sprite, target) {
    let dx = target.position.x - sprite.position.x;
    let dy = target.position.y - sprite.position.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function moveSprite(sprite, pathSize) {
    sprite.position.x += Math.cos(sprite.rotation) * pathSize;
    sprite.position.y += Math.sin(sprite.rotation) * pathSize;
}

export function moveToTarget( sprite, target, pathSize ) {
    const distance = getDistance(sprite, target)
    
    if (distance <= pathSize) {
        sprite.position.x = target.position.x
        sprite.position.y = target.position.y

        return true
    }

    const moveRate = pathSize / distance
    sprite.position.x += moveRate * (target.position.x - sprite.position.x)
    sprite.position.y += moveRate * (target.position.y - sprite.position.y)

    return false
}

const _2PI = Math.PI * 2

export function turnSpriteToTarget(sprite, target, turnAngle) {
    let pointDirection = Math.atan2(target.y - sprite.y, target.x - sprite.x);
    let deflection = (pointDirection - sprite.rotation) % _2PI;
    if (!deflection) return true;

    if (deflection < -Math.PI) deflection += _2PI;
    if (deflection >  Math.PI) deflection -= _2PI;

    if (Math.abs(deflection) <= turnAngle) sprite.rotation = pointDirection;
    else sprite.rotation += (deflection <  0) ? -turnAngle : turnAngle;
    return false;
}

export function getLinesIntersectionPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    if (denom === 0) return null // Параллельные линии
       
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        // Возвращаем точку пересечения
        return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) }
    }
    return null // Нет пересечения
}

const colors = [
    0xffffff,
    0xffffcc,
    0x66ffff,
    0xe5ccff,
    0x99ffff,
    0xffccff,
    0xffff99,
    0xccffff, 
    0xccffcc,
    0xe5ffcc,
    0xffff66,
]
let colorIndex = Math.floor(Math.random() * colors.length)

export function drawLightning(object, target, graphics) {
    const lineColor = colors[colorIndex]
    colorIndex++
    if (colorIndex === colors.length) colorIndex = 0
  
    const distance = getDistance(object, target)
    const stepsSize = 9 + Math.ceil(Math.random() * 10)
    const stepsCount = Math.ceil(distance / stepsSize)
    const offsetRate = Math.ceil(stepsSize * 0.75)
  
    let xx = object.position.x
    let yy = object.position.y
    let path = [{x: xx, y: yy}]
    for (let i = stepsCount; i > 1; i--) {
        let pathLength = Math.sqrt((xx - target.position.x) ** 2 + (yy - target.position.y) ** 2)
        let offset = Math.sin((pathLength / distance) * Math.PI) * offsetRate
        xx += (target.position.x - xx) / i + Math.random() * offset * 2 - offset
        yy += (target.position.y - yy) / i + Math.random() * offset * 2 - offset
        path.push({x: xx, y: yy})
    }

    //graphics.clear()
   
    path.forEach( (point, index) => {
      if (index === 0) graphics.moveTo(point.x, point.y);
      else graphics.lineTo(point.x, point.y);
    })
    graphics.stroke({ width: graphics.lineWidth, color: lineColor })
}