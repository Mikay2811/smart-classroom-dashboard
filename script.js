// ==========================================
// SMART CLASSROOM DASHBOARD
// Room 101 + System Overview + Live Graph
// ==========================================

let room = {
    id: 1,
    name: "Room 101",
    occupants: 0,
    capacity: 30,
    device: "ESP32-ROOM-101",
    lastUpdated: new Date()
};

// Stores recent occupancy readings for the live graph
const occupancyHistory = [];
const MAX_GRAPH_POINTS = 12;


// ==========================================
// CREATE LIVE GRAPH
// ==========================================

function createLiveGraph() {

    // Do not create it twice
    if (document.getElementById("live-occupancy-graph")) {
        return;
    }

    const overviewSection =
        document.querySelector(".overview-section");

    if (!overviewSection) {
        return;
    }

    const graphPanel = document.createElement("div");

    graphPanel.id = "live-graph-panel";

    graphPanel.innerHTML = `
        <div class="live-graph-header">

            <div>
                <h2>Live Occupancy Graph</h2>

                <p>
                    Real-time Room 101 occupancy over
                    the latest readings.
                </p>
            </div>

            <div class="graph-live-badge">

                <span></span>

                LIVE

            </div>

        </div>


        <div class="live-graph-wrapper">

            <canvas id="live-occupancy-graph"></canvas>

        </div>


        <div class="graph-footer">

            <span>
                Current:
                <strong id="graph-current-value">
                    0
                </strong>
                people
            </span>

            <span>
                Capacity:
                <strong>
                    ${room.capacity}
                </strong>
                people
            </span>

        </div>
    `;

    // Add graph below System Overview
    overviewSection.appendChild(graphPanel);


    // ======================================
    // GRAPH CSS
    // ======================================

    const style = document.createElement("style");

    style.id = "live-graph-style";

    style.textContent = `

        #live-graph-panel {

            margin-top: 20px;

            padding: 22px;

            background: #ffffff;

            border-radius: 16px;

            border: 1px solid #e5e7eb;

            box-shadow:
                0 4px 16px
                rgba(0, 0, 0, 0.06);

        }


        .live-graph-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

            margin-bottom: 18px;

        }


        .live-graph-header h2 {

            margin: 0 0 5px;

            font-size: 20px;

        }


        .live-graph-header p {

            margin: 0;

            color: #6b7280;

            font-size: 13px;

        }


        .graph-live-badge {

            display: flex;

            align-items: center;

            gap: 7px;

            font-size: 12px;

            font-weight: 700;

            letter-spacing: 0.5px;

        }


        .graph-live-badge span {

            width: 9px;

            height: 9px;

            border-radius: 50%;

            background: #22c55e;

            box-shadow:
                0 0 0 4px
                rgba(34, 197, 94, 0.12);

        }


        .live-graph-wrapper {

            position: relative;

            width: 100%;

            height: 280px;

        }


        #live-occupancy-graph {

            display: block;

            width: 100%;

            height: 100%;

        }


        .graph-footer {

            display: flex;

            justify-content: space-between;

            margin-top: 12px;

            padding-top: 12px;

            border-top:
                1px solid #eeeeee;

            color: #6b7280;

            font-size: 13px;

        }


        .graph-footer strong {

            color: #111827;

        }


        @media (max-width: 700px) {

            .live-graph-header,
            .graph-footer {

                flex-direction: column;

                align-items: flex-start;

            }


            .live-graph-wrapper {

                height: 220px;

            }

        }

    `;

    document.head.appendChild(style);


    drawLiveGraph();
}


// ==========================================
// ADD READING TO GRAPH
// ==========================================

function addOccupancyReading(value) {

    const now = new Date();

    occupancyHistory.push({

        time: now,

        occupants: Number(value) || 0

    });


    // Keep only latest readings
    while (
        occupancyHistory.length >
        MAX_GRAPH_POINTS
    ) {

        occupancyHistory.shift();

    }


    drawLiveGraph();
}


// ==========================================
// DRAW LIVE GRAPH
// ==========================================

function drawLiveGraph() {

    const canvas =
        document.getElementById(
            "live-occupancy-graph"
        );


    if (!canvas) {
        return;
    }


    const wrapper =
        canvas.parentElement;


    const width =
        wrapper.clientWidth;


    const height =
        wrapper.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;


    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.scale(
        dpr,
        dpr
    );


    // Clear graph
    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const padding = {

        top: 20,

        right: 25,

        bottom: 40,

        left: 45

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    // Maximum Y value = room capacity
    const maxValue =
        Math.max(
            room.capacity || 30,
            10
        );


    // ======================================
    // GRID LINES
    // ======================================

    ctx.lineWidth = 1;

    ctx.strokeStyle =
        "#e5e7eb";

    ctx.fillStyle =
        "#6b7280";

    ctx.font =
        "11px Arial";


    const gridSteps = 5;


    for (
        let i = 0;
        i <= gridSteps;
        i++
    ) {

        const value =
            Math.round(
                (maxValue / gridSteps) * i
            );


        const y =
            padding.top +
            graphHeight -
            (value / maxValue) *
            graphHeight;


        ctx.beginPath();


        ctx.moveTo(
            padding.left,
            y
        );


        ctx.lineTo(
            width - padding.right,
            y
        );


        ctx.stroke();


        ctx.fillText(
            value,
            8,
            y + 4
        );

    }


    // ======================================
    // NO DATA MESSAGE
    // ======================================

    if (
        occupancyHistory.length === 0
    ) {

        ctx.fillStyle =
            "#9ca3af";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "Waiting for occupancy data...",
            width / 2,
            height / 2
        );


        ctx.textAlign =
            "left";


        return;

    }


    // ======================================
    // GRAPH POINTS
    // ======================================

    const points =
        occupancyHistory.map(
            (reading, index) => {

                const x =
                    occupancyHistory.length === 1

                        ? padding.left +
                          graphWidth / 2

                        : padding.left +
                          (
                              index /
                              (
                                  occupancyHistory.length -
                                  1
                              )
                          ) *
                          graphWidth;


                const y =
                    padding.top +
                    graphHeight -
                    (
                        reading.occupants /
                        maxValue
                    ) *
                    graphHeight;


                return {

                    x,

                    y,

                    value:
                        reading.occupants,

                    time:
                        reading.time

                };

            }
        );


    // ======================================
    // AREA UNDER GRAPH
    // ======================================

    if (
        points.length > 1
    ) {

        ctx.beginPath();


        ctx.moveTo(
            points[0].x,
            padding.top +
            graphHeight
        );


        points.forEach(point => {

            ctx.lineTo(
                point.x,
                point.y
            );

        });


        ctx.lineTo(
            points[
                points.length - 1
            ].x,
            padding.top +
            graphHeight
        );


        ctx.closePath();


        ctx.fillStyle =
            "rgba(59, 130, 246, 0.10)";


        ctx.fill();

    }


    // ======================================
    // GRAPH LINE
    // ======================================

    if (
        points.length > 1
    ) {

        ctx.beginPath();


        ctx.moveTo(
            points[0].x,
            points[0].y
        );


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            ctx.lineTo(
                points[i].x,
                points[i].y
            );

        }


        ctx.strokeStyle =
            "#3b82f6";


        ctx.lineWidth = 3;


        ctx.lineJoin =
            "round";


        ctx.lineCap =
            "round";


        ctx.stroke();

    }


    // ======================================
    // DATA POINTS
    // ======================================

    points.forEach(point => {

        ctx.beginPath();


        ctx.arc(
            point.x,
            point.y,
            5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fill();


        ctx.strokeStyle =
            "#3b82f6";


        ctx.lineWidth = 3;


        ctx.stroke();

    });


    // ======================================
    // TIME LABELS
    // ======================================

    ctx.fillStyle =
        "#6b7280";


    ctx.font =
        "10px Arial";


    ctx.textAlign =
        "center";


    points.forEach(
        (point, index) => {

            // Show every point if only a few
            // Otherwise show every second point
            if (
                points.length <= 6 ||
                index % 2 === 0 ||
                index === points.length - 1
            ) {

                const label =
                    point.time.toLocaleTimeString(
                        [],
                        {
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    );


                ctx.fillText(
                    label,
                    point.x,
                    height - 12
                );

            }

        }
    );


    ctx.textAlign =
        "left";


    // ======================================
    // CURRENT VALUE
    // ======================================

    const currentValue =
        occupancyHistory[
            occupancyHistory.length - 1
        ].occupants;


    setText(
        "graph-current-value",
        currentValue
    );
}


// ==========================================
// CREATE ROOM CARD
// ==========================================

function createRoomCard(room) {

    const availableSeats =
        Math.max(
            0,
            room.capacity -
            room.occupants
        );


    const percentage =
        room.capacity > 0

            ? Math.min(
                100,
                Math.round(
                    (
                        room.occupants /
                        room.capacity
                    ) *
                    100
                )
            )

            : 0;


    return `

        <div class="room-card">


            <div class="room-header">


                <div class="room-name">

                    🏫 ${room.name}

                </div>


                <div class="room-status status-available">

                    AVAILABLE

                </div>


            </div>


            <div class="occupancy">


                <div class="occupancy-number">

                    ${room.occupants}

                </div>


                <div class="occupancy-label">

                    Current Occupants

                </div>


            </div>


            <div class="capacity-bar">


                <div
                    class="capacity-fill fill-blue"
                    style="width: ${percentage}%">
                </div>


            </div>


            <div class="room-footer">

                <span>
                    Available Seats
                </span>


                <strong>
                    ${availableSeats}
                </strong>

            </div>


            <div class="room-footer">

                <span>
                    Capacity
                </span>


                <strong>
                    ${room.capacity} seats
                </strong>

            </div>


            <div class="room-footer">

                <span>
                    Occupancy
                </span>


                <strong>
                    ${percentage}%
                </strong>

            </div>


        </div>

    `;
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateRoomDisplay() {

    const availableSeats =
        Math.max(
            0,
            room.capacity -
            room.occupants
        );


    const percentage =
        room.capacity > 0

            ? Math.min(
                100,
                Math.round(
                    (
                        room.occupants /
                        room.capacity
                    ) *
                    100
                )
            )

            : 0;


    const roomHTML =
        createRoomCard(room);


    // Dashboard room grid
    const dashboardGrid =
        document.getElementById(
            "room-grid"
        );


    // Rooms page room grid
    const allRoomsGrid =
        document.getElementById(
            "all-room-grid"
        );


    if (dashboardGrid) {

        dashboardGrid.innerHTML =
            roomHTML;

    }


    if (allRoomsGrid) {

        allRoomsGrid.innerHTML =
            roomHTML;

    }


    // ======================================
    // MAIN OCCUPANCY OVERVIEW
    // ======================================

    setText(
        "total-occupants",
        room.occupants
    );


    setText(
        "occupancy-percentage",
        percentage + "%"
    );


    const progress =
        document.getElementById(
            "progress-fill"
        );


    if (progress) {

        progress.style.width =
            percentage + "%";

    }


    setText(
        "occupancy-seats-text",
        `${room.occupants} of ${room.capacity} seats occupied`
    );


    // ======================================
    // SYSTEM INFORMATION
    // ======================================

    setText(
        "device-name",
        room.device
    );


    // ======================================
    // SYSTEM OVERVIEW
    // ======================================

    setText(
        "overview-occupants",
        room.occupants
    );


    setText(
        "overview-available",
        availableSeats
    );


    setText(
        "overview-capacity",
        room.capacity
    );


    setText(
        "overview-percentage",
        percentage + "%"
    );


    // ======================================
    // GRAPH
    // ======================================

    setText(
        "graph-current-value",
        room.occupants
    );


    drawLiveGraph();


    updateTime();
}


// ==========================================
// HELPER FUNCTION
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }
}


// ==========================================
// NAVIGATION
// ==========================================

function showPage(
    pageName,
    element
) {

    // Hide all pages
    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    // Show selected page
    const selectedPage =
        document.getElementById(
            pageName + "-page"
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    // Remove active navigation
    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    // Add active navigation
    if (element) {

        element.classList.add(
            "active"
        );

    }


    // Page titles
    const titles = {

        dashboard:
            "Dashboard",

        rooms:
            "Classroom Rooms",

        history:
            "Occupancy History",

        settings:
            "System Settings"

    };


    setText(
        "page-title",
        titles[pageName]
    );
}


// ==========================================
// UPDATE TIME
// ==========================================

function updateTime() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString();


    setText(
        "last-update",
        time
    );


    setText(
        "overview-last-update",
        time
    );
}


// ==========================================
// HISTORY DATA
// ==========================================

const historyData = [

    {
        date: "09/14/2026",
        time: "08:00 AM",
        room: "Room 101",
        occupants: 12,
        capacity: 30,
        status: "OCCUPIED"
    },


    {
        date: "09/14/2026",
        time: "09:00 AM",
        room: "Room 101",
        occupants: 20,
        capacity: 30,
        status: "OCCUPIED"
    },


    {
        date: "09/14/2026",
        time: "10:00 AM",
        room: "Room 101",
        occupants: 15,
        capacity: 30,
        status: "OCCUPIED"
    }

];


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory() {

    const table =
        document.getElementById(
            "history-table"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        historyData.map(
            item => {

                return `

                    <tr>


                        <td>
                            ${item.date}
                        </td>


                        <td>
                            ${item.time}
                        </td>


                        <td>
                            ${item.room}
                        </td>


                        <td>
                            ${item.occupants}
                        </td>


                        <td>
                            ${item.capacity}
                        </td>


                        <td>

                            <span
                                class="table-status status-occupied">

                                ${item.status}

                            </span>

                        </td>


                    </tr>

                `;

            }
        ).join("");

}


// ==========================================
// FETCH ROOM DATA FROM NODE.JS
// ==========================================

async function fetchRoom() {

    try {

        // Request data from Node.js
        const response =
            await fetch(
                "/api/room"
            );


        // Check response
        if (!response.ok) {

            throw new Error(
                "Failed to fetch room data"
            );

        }


        // Convert response to JSON
        const data =
            await response.json();


        // Update room information
        room = {

            ...room,

            ...data,

            lastUpdated:
                new Date()

        };


        // ==================================
        // CONNECTION STATUS
        // ==================================

        setText(
            "overview-esp32-status",
            "Connected"
        );


        setText(
            "overview-wifi-status",
            "Connected"
        );


        setText(
            "wifi-status",
            "Connected"
        );


        // ==================================
        // ADD READING TO GRAPH
        // ==================================

        addOccupancyReading(
            room.occupants
        );


        // Update dashboard
        updateRoomDisplay();


        console.log(
            "Room data updated:",
            room
        );

    }


    catch (error) {

        console.error(
            "Error fetching room data:",
            error
        );


        // ==================================
        // OFFLINE STATUS
        // ==================================

        setText(
            "overview-esp32-status",
            "Offline"
        );


        setText(
            "overview-wifi-status",
            "Disconnected"
        );


        setText(
            "wifi-status",
            "Disconnected"
        );

    }
}


// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener(
    "resize",
    drawLiveGraph
);


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

// Create graph
createLiveGraph();


// Display initial room data
updateRoomDisplay();


// Display history
displayHistory();


// Get latest data from Node.js
fetchRoom();


// ==========================================
// REFRESH EVERY 5 SECONDS
// ==========================================

setInterval(
    fetchRoom,
    5000
);