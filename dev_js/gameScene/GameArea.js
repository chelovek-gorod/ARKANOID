import { Container, Graphics } from "pixi.js"
import { DropShadowFilter } from 'pixi-filters'
import Brick from "./Brick"
import AnimatedBrick from "./AnimatedBrick"
import Platform from "./Platform"
import Ball from "./Ball"
import SidePoint from "./SidePoint"
import { CEIL_SIZE, CEIL_HALF_SIZE, GAME_AREA, BALL_RADIUS, BALL } from "../constants"
import Protect from "./Protect"
import Guns from "./Guns"

class GameArea extends Container {
    constructor(map, width, height) {
        super()

        this.areaWidth = width
        this.areaHeight = height

        this.dropShadowFilter = new DropShadowFilter()
        this.dropShadowFilter.color = GAME_AREA.shadow.color
        this.dropShadowFilter.alpha = GAME_AREA.shadow.alpha
        //this.dropShadowFilter.blur = 6
        this.filters = [this.dropShadowFilter]

        this.border = new Graphics()
        this.border.roundRect(0, 0, width, height, GAME_AREA.borderRadius)
        this.border.stroke({ width: GAME_AREA.border.width, color: GAME_AREA.border.color })

        this.platform = null
        this.protect = null
        this.sidePoints = new Container()
        this.guns = new Guns(this)

        this.ballPower = BALL.startPower
        this.balls = new Container()

        this.bricks = new Container()
        this.bonuses = new Container()

        this.left = BALL_RADIUS
        this.top = BALL_RADIUS
        this.right = width - BALL_RADIUS
        this.bottom = height - BALL_RADIUS

        map.forEach( (line, y) => {
            for(let i = 0; i < line.length; i++) {

                if (line[i] === '[') {
                    const cx = CEIL_HALF_SIZE * i + CEIL_SIZE
                    const cy = CEIL_SIZE * y + CEIL_HALF_SIZE
                    const char = line[i + 1]
                    if (char === '?' || char === '!') {
                        this.bricks.addChild( new AnimatedBrick(cx, cy, char) )
                    } else {
                        this.bricks.addChild( new Brick(cx, cy, char) )
                    }
                }

                if (line[i] === '(') {
                    const cx = CEIL_HALF_SIZE * i + CEIL_HALF_SIZE
                    const cy = CEIL_SIZE * y + CEIL_HALF_SIZE
                    if (line[i + 1] === ')') {
                        this.sidePoints.addChild( new SidePoint(cx, cy) )
                    } else {
                        let stepSize = 1 
                        while (line[i + stepSize] === '=') stepSize++
                        const platformSize = Math.round((stepSize + 1) * 0.5)
                        this.platform = new Platform(cy, platformSize, width)
                    }
                }

            }
        })

        this.protect = new Protect(this.sidePoints.children[0].position, this.sidePoints.children[1].position)

        this.addChild(
            this.border, this.sidePoints, this.protect,
            this.bricks, this.platform, this.balls, this.bonuses
        )

        this.platform.isActive = true
        setTimeout( () => this.addBall(), 3 )
    }

    addBall( count = 1 ) {
        for(let i = 0; i < count; i++) {
            this.balls.addChild( new Ball(this) )
        }
    }
}

export default GameArea