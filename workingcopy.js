
function run() {
    /** Maximum number of DOM elements to inspect */
    const limit = 1000;

    /** Retrieve viewport width and height for canvas */
    vw = window.innerWidth;
    vh = window.innerHeight;

    /** Append debug div for Matter.JS to mount canvas */
    debug = document.createElement("div");
    debug.id = "debug";
    debug.style = `position:fixed;top:0;left:0;z-index:666;width:${vw}px;height:${vh}px;opacity:0.7;display:block;`;
    document.getElementsByTagName("html").item(0).appendChild(debug);

    /** Set up viewing canvas relative to center of viewport */
    VIEW = {};
    VIEW.width    = vw;
    VIEW.height   = vh;
    VIEW.centerX  = VIEW.width / 2;
    VIEW.centerY  = VIEW.height / 2;
    VIEW.offsetX  = VIEW.width / 2;
    VIEW.offsetY  = VIEW.height / 2;

    // Matter.js module aliases
    Engine    = Matter.Engine,
        Render    = Matter.Render,
        Runner    = Matter.Runner,
        Common    = Matter.Common,
        World     = Matter.World,
        Bodies    = Matter.Bodies,
        Body      = Matter.Body,
        Events    = Matter.Events,
        Query     = Matter.Query,
        MouseConstraint = Matter.MouseConstraint,
        Mouse     = Matter.Mouse;

    /** DOM elements and their physics counterparts */
    bodies = [];
    bodiesDom = [];
    initMap = new Map();
    objMap = new Map();

    // Initialise engine and renderer
    engine    = Engine.create();
    world     = engine.world;
    render = Render.create({
        engine: engine,
        element: document.getElementById("debug"),
        options: {
            width: vw,
            height: vh,
            background: 'white',                    // Transparent canvas
            wireframeBackground: 'transparent',     // Transparent canvas
            hasBounds: false,
            enabled: true,
            wireframes: true,
            showSleeping: true,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showAxes: true,
            showPositions: true,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false
        }
    });

    // Disable to hide debug
    Render.run(render);

    // Create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    //ceiling, wallLeft, wallRight, ground;

    // Options for bounding borders
    wallOpts = {
        isStatic:     true,
        restitution:  0.75,
        friction:     0.05
    };
    groundOpts = {
        isStatic:     true,
        restitution:  0.75,
        friction:     0.05
    };

    // Add rectangles to bound canvas area to viewport
    World.add(world, [
        ground    = Bodies.rectangle(vw / 2, vh + 128, vw, 256, groundOpts),
        ceiling   = Bodies.rectangle(vw / 2, -128, vw, 256, groundOpts),
        wallRight = Bodies.rectangle(vw + 128, vh / 2, 256, vh, wallOpts),
        wallLeft  = Bodies.rectangle(-128, vh / 2, 256, vh, wallOpts)
    ]);

    // Gravity settings
    gravity = world.gravity;
    gravity.x = 0;
    gravity.y = 0.05;

    // Update physics bodies and DOM element mappings when page is scrolled
    function updateBodies() {
        VIEW.anchorX = window.scrollX;
        VIEW.anchorY = window.scrollY;
        initMap = new Map();
        objMap = new Map();
        //bodiesDom = detectAds();
        bodiesDom = document.querySelectorAll("div,p,span,img,svg,label,h1,h2,h3,h4,h5,iframe");
        console.log("The following bodies were detected:")
        console.log(bodiesDom)

        for (i = 0; i < limit; i++) {
            // Skip if there are fewer than (limit) elements
            if (i >= bodiesDom.length) continue;

            const ele = bodiesDom[i];
            const pos = ele.getBoundingClientRect();

            // Avoid adding element to playground if an ancestor is already mapped
            skip = false;
            curr = ele;
            while (curr != document) {
                curr = curr.parentNode;
                if (curr.id != "" && !isNaN(curr.id)) {
                    skip = true;
                    break;
                }
            }

            if (skip) {
                continue;
            }

            // Ignore this <div> if it contains no innate text
            if (ele instanceof HTMLDivElement) {
                const copy = ele.cloneNode(true);
                while (copy.lastElementChild) {
                    copy.removeChild(copy.lastElementChild);
                }
                if (!copy.innerText && !copy.style.backgroundColor) {
                    continue;
                }
            }

            // Avoid adding element to playground if not fully within viewport
            if (pos.left < 0 || pos.right > vw || pos.top < 0 || pos.bottom > vh) {
                continue;
            }
            const left = pos.left;
            const right = pos.right;
            const top = pos.top;
            const bottom = pos.bottom;

            const w = right - left;
            const h = bottom - top;

            // Avoid adding zero-sized or excessively large HTML elements
            if (w < 16 || h < 16 || w > 1024 || h > 1024) {
                continue;
            }

            if (ele.tagName == "SPAN") {
                ele.style.display = "inline-block";
            }

            // Treat every container as a rectangle
            body = Bodies.rectangle(
                (left + right) / 2,
                (top + bottom) / 2,
                w,
                h,
                {
                    restitution: 0.8,
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                    density: 0.05,
                    chamfer: { radius: 4 },
                    angle: 0
                }
            );

            ele.id = body.id;
            bodies.push(body);
            initMap.set(ele.id, { left, top, right, bottom, w, h });
            objMap.set(ele.id, ele);
        }

        World.add(engine.world, bodies);
    }

    updateBodies();

    // Bind mouse and sync with renderer
    mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });

    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    var mouseX, mouseY, mouseXO, mouseYO, mouseXN, mouseYN;

    /** ==== Add handlers for canvas mount events ==== */

    // Helper: removes old hover mouse pointers
    function removeHovers() {
        hovered = document.getElementsByClassName("hover");
        for (i = 0; i < hovered.length; i++) {
            hovered[i].classList.remove("hover");
        }
        document.body.style.cursor = "auto";
    }

    // Mouse pointer on hover over interactive DOM element
    Events.on(mouseConstraint, "mousemove", function(e) {
        mouseX = e.mouse.absolute.x;
        mouseY = e.mouse.absolute.y;
        // Remove existing hovers
        removeHovers();
        if (Query.point(bodies, { x: mouseX, y: mouseY }).length) {
            underMouse = Query.point(bodies, { x: mouseX, y: mouseY })[0].id;
            document.getElementById(underMouse)?.classList.add("hover");
            document.body.style.cursor = "pointer";
        }
    });

    // Press (1)
    Events.on(mouseConstraint, "mousedown", function(e) {
        mouseXO = e.mouse.absolute.x;
        mouseYO = e.mouse.absolute.y;
    });

    // Press (2), part 1 and 2 checks is not end of drag
    Events.on(mouseConstraint, "mouseup", function(e) {
        mouseXN = e.mouse.absolute.x;
        mouseYN = e.mouse.absolute.y;
        if ((mouseXO == mouseXN) && (mouseYO == mouseYN)) {
            underMouse = null;
            if (Query.point(bodies, { x: mouseXN, y: mouseYN }).length) {
                underMouse = Query.point(bodies, { x: mouseXN, y: mouseYN })[0].id;
            }
            if (underMouse) {
                // If element contains an anchor, proceed to URL of first anchor child element
                const under = document.getElementById(underMouse);
                const numLinks = Array.from(under.childNodes).filter(x => x.tagName == "A");
                if (numLinks.length > 0) {
                    numLinks[0].click();
                } else {
                    // Otherwise determine if an ancestor is anchor node, then click that instead
                    curr = under;
                    while (curr != document) {
                        curr = curr.parentNode;
                        if (curr.tagName == "A") {
                            curr.click();
                        }
                    }
                }
    //          window.location.href = document.getElementById(underMouse).getAttribute("href");
            }
        }
        removeHovers();
    });

    window.requestAnimationFrame(update);

    function update() {
        // Containers
        for (j = 0; j < bodies.length; j++) {
            body = bodies[j];
            bodyDom = objMap.get("" + body.id);
            if (bodyDom == undefined) continue;

            const displ = initMap.get(bodyDom.id);
            const left = displ.left;
            const top = displ.top;
            const w = displ.w;
            const h = displ.h;
            offsetX = window.scrollX - VIEW.anchorX;
            offsetY = window.scrollY - VIEW.anchorY;
            curr = bodyDom;
            while (curr != document) {
                curr = curr.parentNode;
                if (curr.tagName == "HEADER") {
                    offsetX = 0;
                    offsetY = 0;
                    break;
                }
            }
            bodyDom.style.transform = "translate( " +
                (body.position.x + offsetX - left - w / 2) +
                "px, " +
                (body.position.y + offsetY - top - h / 2) +
                "px )";
            bodyDom.style.transform += "rotate( " + body.angle + "rad )";
        }

        window.requestAnimationFrame(update);
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    }

    refreshWorld = debounce(function() {
        location.reload();
    }, 5000);

    refreshObjects = debounce(function() {
        // This API actually works and leaves the borders in
        World.clear(world, true);
        updateBodies();
    }, 2000);

    window.addEventListener('resize', refreshWorld);
    // window.addEventListener('scroll', refreshObjects);

}

setTimeout(run, 2000)
