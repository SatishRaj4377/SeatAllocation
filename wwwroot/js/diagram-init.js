/**
 *  Diagram Initialization
 */

// Selection state management - per diagram
const diagramStates = new Map();

// Helper function to check if addInfo represents a chair
// Handles both formats: string "Chair" and object {type: "Chair", isReserved: false, isExcluded: false}
function isChairNode(addInfo) {
    if (typeof addInfo === 'string') {
        return addInfo.toLowerCase().includes('chair');
    } else if (addInfo && typeof addInfo === 'object' && addInfo.type) {
        // Return false if the chair is excluded
        if (addInfo.isExcluded === true) {
            return false;
        }
        return addInfo.type === 'Chair' || addInfo.type === 'chair';
    }
    return false;
}

// Helper function to check if a chair is reserved
function isChairReserved(addInfo) {
    if (typeof addInfo === 'object' && addInfo.isReserved !== undefined) {
        return addInfo.isReserved === true;
    }
    // Legacy format support - no reserved property
    return false;
}

// Helper function to mark a chair as reserved
function setChairReserved(addInfo, reserved) {
    if (typeof addInfo === 'object') {
        addInfo.isReserved = reserved;
    }
}

// Helper function to get floor display name from diagram element ID
function getFloorDisplayName(elementId) {
    if (elementId.includes('Ground')) return 'Ground Floor';
    if (elementId.includes('First')) return '1st Floor';
    if (elementId.includes('Second')) return '2nd Floor';
    if (elementId.includes('Third')) return '3rd Floor';
    if (elementId.includes('Fourth')) return '4th Floor';
    if (elementId.includes('Fifth')) return '5th Floor';
    return 'Floor N/A';
}

function getOrCreateDiagramState(diagramElement, elementId) {
    if (!diagramStates.has(diagramElement)) {
        diagramStates.set(diagramElement, {
            selectedChairs: [],
            diagram: null,
            floorName: getFloorDisplayName(elementId || '')
        });
    }
    return diagramStates.get(diagramElement);
}

function toggleChairSelection(diagramElement, nodeId) {
    const state = getOrCreateDiagramState(diagramElement);
    const idx = state.selectedChairs.indexOf(nodeId);
    if (idx > -1) {
        state.selectedChairs.splice(idx, 1);
    } else {
        state.selectedChairs.push(nodeId);
    }
    return idx === -1;
}

function isChairSelected(diagramElement, nodeId) {
    const state = getOrCreateDiagramState(diagramElement);
    return state.selectedChairs.includes(nodeId);
}

function clearSelection(diagramElement) {
    const state = getOrCreateDiagramState(diagramElement);
    state.selectedChairs = [];
}

function getSelectedChairs(diagramElement) {
    const state = getOrCreateDiagramState(diagramElement);
    return state.selectedChairs;
}

// Tooltip template function for chair seats
function seatTooltipTemplate(node, diagramElement) {
    const seatNumber = node.annotations && node.annotations[0] ? node.annotations[0].content : "N/A";
    const state = getOrCreateDiagramState(diagramElement);
    const floorName = state.floorName || 'Floor N/A';
    const isReserved = isChairReserved(node.addInfo);
    const isSelected = isChairSelected(diagramElement, node.id);
    const status = isReserved ? "Reserved" : isSelected ? "Selected" : "Available";
    const statusBg = isReserved ? "#6c757d" : isSelected ? "#22c55e" : "#17a2b8";

    return `
      <div style="margin:0;padding:10px;font-family:Arial,sans-serif;min-width:150px;">
        <div style="font-weight:bold;margin-bottom:5px;font-size:14px;">Seat ${seatNumber}</div>
        <div style="font-size:12px;margin-bottom:3px;"><strong>Floor:</strong> ${floorName}</div>
        <div style="font-size:12px;margin-top:5px;">
          <span style="padding:2px 6px;border-radius:3px;font-weight:bold;background-color:${statusBg};color:white;font-size:11px;">${status}</span>
        </div>
      </div>
    `;
}

// Function to initialize diagrams with their floor data
function initializeDiagrams() {
    // Define diagram configurations with their respective data sources
    var diagramConfigs = [
        // Eymard Complex Diagrams
        {
            elementId: 'eymardGroundFloorDiagram',
            dataSource: typeof EymardGroundFloorData !== 'undefined' ? EymardGroundFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'eymardFirstFloorDiagram',
            dataSource: typeof EymardFirstFloorData !== 'undefined' ? EymardFirstFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'eymardSecondFloorDiagram',
            dataSource: typeof EymardSecondFloorData !== 'undefined' ? EymardSecondFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'eymardThirdFloorDiagram',
            dataSource: typeof EymardThirdFloorData !== 'undefined' ? EymardThirdFloorData : { nodes: [], connectors: [] }
        },
        // Mathura Complex Diagrams
        {
            elementId: 'mathuraGroundFloorDiagram',
            dataSource: typeof MathuraGroundFloorData !== 'undefined' ? MathuraGroundFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'mathuraFirstFloorDiagram',
            dataSource: typeof MathuraFirstFloorData !== 'undefined' ? MathuraFirstFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'mathuraSecondFloorDiagram',
            dataSource: typeof MathuraSecondFloorData !== 'undefined' ? MathuraSecondFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'mathuraThirdFloorDiagram',
            dataSource: typeof MathuraThirdFloorData !== 'undefined' ? MathuraThirdFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'mathuraFourthFloorDiagram',
            dataSource: typeof MathuraFourthFloorData !== 'undefined' ? MathuraFourthFloorData : { nodes: [], connectors: [] }
        },
        {
            elementId: 'mathuraFifthFloorDiagram',
            dataSource: typeof MathuraFifthFloorData !== 'undefined' ? MathuraFifthFloorData : { nodes: [], connectors: [] }
        }
    ];

    // Initialize each diagram
    diagramConfigs.forEach(function (config) {
        var diagramElement = document.getElementById(config.elementId);
        
        if (diagramElement && diagramElement.ej2_instances && diagramElement.ej2_instances[0]) {
            var diagram = diagramElement.ej2_instances[0];

            // Store diagram reference and floor name in state
            const state = getOrCreateDiagramState(diagramElement, config.elementId);
            state.diagram = diagram;

            // Define the tool
            diagram.tool = ej.diagrams.DiagramTools.ZoomPan | ej.diagrams.DiagramTools.SingleSelect;
            
            // Chair click handler
            diagram.click = function(args) {
                const node = args.element;
                if (node && node instanceof ej.diagrams.Node && isChairNode(node.addInfo)) {
                    // Prevent interaction with reserved chairs
                    if (isChairReserved(node.addInfo)) {
                        return;
                    }
                    
                    toggleChairSelection(diagramElement, node.id);
                    updateChairStyle(node, diagramElement);
                    updateReserveButton(diagramElement);
                }
            };
            
            // Set node default styles
            diagram.getNodeDefaults = function (node) {
                if (!node.style) {
                    node.style = {};
                }
                const isChair = isChairNode(node.addInfo);
                const isDoorOverlay =
                    typeof node.addInfo === 'string' &&
                    node.addInfo.toLowerCase().includes('overlay');

                node.style.fill = node.style.fill || 'white';
                node.style.strokeColor = node.style.strokeColor || 'black';
                node.style.strokeWidth = isDoorOverlay ? 0 : 2;
                node.constraints= (ej.diagrams.NodeConstraints.Default | ej.diagrams.NodeConstraints.ReadOnly) & ~ej.diagrams.NodeConstraints.Select;
                if (node.annotations && node.annotations[0]){
                    if (isChair) {
                        node.annotations[0].margin = {
                            top: 5
                        };
                    }

                    node.annotations[0].style.fontSize = 22;
                    node.annotations[0].style.bold = true;
                }
                
                // Add tooltip only for chair nodes
                if (isChair) {
                    // node.tooltip = { content: seatTooltipTemplate(node, diagramElement), relativeMode: 'Object' };
                }
                
                return node;
            };
            
            // Set connector default styles
            diagram.getConnectorDefaults = function (connector) {
                if (!connector.style) {
                    connector.style = {};
                }
                connector.constraints= (ej.diagrams.ConnectorConstraints.Default | ej.diagrams.ConnectorConstraints.ReadOnly) & ~ej.diagrams.ConnectorConstraints.Select;
                connector.style.strokeColor = connector.style.strokeColor || 'black';
                connector.style.strokeWidth = connector.style.strokeWidth !== 1 ? connector.style.strokeWidth : 6;
                
                connector.targetDecorator = { shape: 'None' };
                connector.sourceDecorator = { shape: 'None' };
                return connector;
            };
            
            // Load nodes and connectors from the respective floor data
            if (config.dataSource && config.dataSource.nodes && config.dataSource.connectors) {
                const normalNodes = [];
                const doorNodes = [];

                config.dataSource.nodes.forEach(node => {
                    const isDoor =
                        typeof node.addInfo === 'string' &&
                        node.addInfo.toLowerCase().includes('door') &&
                        !node.addInfo.toLowerCase().includes('overlay') && 
                        !node.addInfo.toLowerCase().includes('double');

                    if (isDoor) {
                        doorNodes.push(node);
                    } else {
                        normalNodes.push(node);
                    }
                });

                // Add all non-door nodes first
                if (normalNodes.length) {
                    diagram.addElements(normalNodes);
                }
                
                // Add all connectors
                if (config.dataSource.connectors.length > 0) {
                    diagram.addElements(config.dataSource.connectors);
                }

                // Add door nodes after connectors
                if (doorNodes.length) {
                    diagram.addElements(doorNodes);
                }

                // Create door overlays
                const overlayNodes = doorNodes.map(createDoorOverlayNode);

                if (overlayNodes.length) {
                    diagram.addElements(overlayNodes);
                }

                // Create groups
                const groupNodes = doorNodes.map(node => ({
                    id: `${node.id}_group`,
                    children: [node.id, `${node.id}_overlay`]
                }));

                if (groupNodes.length) {
                    diagram.addElements(groupNodes);
                }

            }

            diagram.fitToPage({
                region: 'Content',
                margin: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            });
        }
    });
}

// Update chair visual style
function updateChairStyle(node, diagramElement) {
    // Don't update style if chair is reserved
    if (isChairReserved(node.addInfo)) {
        return;
    }
    
    if (isChairSelected(diagramElement, node.id)) {
        node.style.fill = '#86efac';  // Light green
        node.style.strokeColor = '#22c55e';  // Green border
    } else {
        node.style.fill = 'white';
        node.style.strokeColor = 'black';
    }
    if (node.annotations && node.annotations[0]) {
        node.annotations[0].style.color = isChairSelected(diagramElement, node.id) ? '#166534' : '#000000';
    }
    node.tooltip = { content: seatTooltipTemplate(node, diagramElement) };
    const state = getOrCreateDiagramState(diagramElement);
    state.diagram.dataBind();
}

// Update reserve button visibility
function updateReserveButton(diagramElement) {
    const btn = document.getElementById('reserveBtn');
    if (btn) {
        const selectedCount = getSelectedChairs(diagramElement).length;
        btn.style.display = selectedCount > 0 ? 'block' : 'none';
        btn.onclick = function() { reserveChairs(diagramElement); };
    }
}

// Reserve selected chairs
function reserveChairs(diagramElement) {
    const state = getOrCreateDiagramState(diagramElement);
    const selectedChairs = getSelectedChairs(diagramElement);
    
    selectedChairs.forEach(chairId => {
        const node = state.diagram.getObject(chairId);
        if (node && isChairNode(node.addInfo)) {
            // Mark chair as reserved in addInfo
            setChairReserved(node.addInfo, true);
            node.style.fill = '#d1d5db';  // Gray
            node.style.strokeColor = '#9ca3af';
            if (node.annotations && node.annotations[0]) {
                node.annotations[0].style.color = '#6b7280';
            }
            node.tooltip = { content: seatTooltipTemplate(node, diagramElement) };
        }
    });
    
    clearSelection(diagramElement);
    state.diagram.dataBind();
    updateReserveButton(diagramElement);
}

document.addEventListener('DOMContentLoaded', function () {
    initializeDiagrams();
    
    // Create floating reserve button (single button for all diagrams)
    const btn = document.createElement('button');
    btn.id = 'reserveBtn';
    btn.textContent = 'Reserve Selected';
    btn.style.cssText = `
        display: none;
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
    document.body.appendChild(btn);
    
    // Add hover effect
    btn.addEventListener('mouseenter', function() {
        this.style.background = '#2563eb';
    });
    btn.addEventListener('mouseleave', function() {
        this.style.background = '#3b82f6';
    });
});

const OVERLAY_X_OFFSET = 20;
const OVERLAY_Y_OFFSET = -2;
const OVERLAY_WIDTH = 7.9124;
const OVERLAY_HEIGHT = 33.85;

/**
 * Creates the white masking node used to hide the
 * right-side door stroke.
 */
function createDoorOverlayNode(node) {     
    const angle = (node.rotateAngle || 0) * Math.PI / 180;
    const dx = OVERLAY_X_OFFSET;
    const dy = OVERLAY_Y_OFFSET;
    return {
        id: `${node.id}_overlay`,
        offsetX: node.offsetX + dx * Math.cos(angle) - dy * Math.sin(angle),
        offsetY: node.offsetY + dx * Math.sin(angle) + dy * Math.cos(angle),
        width: OVERLAY_WIDTH,
        height: OVERLAY_HEIGHT,
        rotateAngle: node.rotateAngle,
        flip: node.flip,
        shape: {
            type: 'Basic',
            shape: 'Rectangle',
            cornerRadius: 2
        },
        style: {
            fill: 'white',
            strokeWidth: 0
        },
        zIndex: 1000,
        addInfo: "Door Overlay"
    };
}
