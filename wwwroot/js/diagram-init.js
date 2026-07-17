// ============================================
// CONSTANTS
// ============================================

const diagramStates = new Map();

const CHAIR_SELECTED_FILL = '#86efac';
const CHAIR_SELECTED_STROKE = '#22c55e';
const CHAIR_SELECTED_TEXT = '#166534';

const CHAIR_AVAILABLE_FILL = 'white';
const CHAIR_AVAILABLE_STROKE = 'black';
const CHAIR_AVAILABLE_TEXT = '#000000';

const CHAIR_RESERVED_FILL = '#d1d5db';
const CHAIR_RESERVED_STROKE = '#9ca3af';
const CHAIR_RESERVED_TEXT = '#6b7280';

const ANNOTATION_FONT_SIZE = 22;
const ANNOTATION_FONT_WEIGHT = true;
const ANNOTATION_MARGIN_TOP = 4;

const DEFAULT_NODE_STROKE_WIDTH = 2;
const DEFAULT_CONNECTOR_STROKE_WIDTH = 6;

const OVERLAY_X_OFFSET = 20;
const OVERLAY_Y_OFFSET = -2;
const OVERLAY_WIDTH = 7.9124;
const OVERLAY_HEIGHT = 33.85;

// ============================================
// MAIN INITIALIZATION
// ============================================

function initializeDiagrams() {
    var diagramConfigs = [
        { elementId: 'eymardGroundFloorDiagram', dataSource: typeof EymardGroundFloorData !== 'undefined' ? EymardGroundFloorData : { nodes: [], connectors: [] } },
        { elementId: 'eymardFirstFloorDiagram', dataSource: typeof EymardFirstFloorData !== 'undefined' ? EymardFirstFloorData : { nodes: [], connectors: [] } },
        { elementId: 'eymardSecondFloorDiagram', dataSource: typeof EymardSecondFloorData !== 'undefined' ? EymardSecondFloorData : { nodes: [], connectors: [] } },
        { elementId: 'eymardThirdFloorDiagram', dataSource: typeof EymardThirdFloorData !== 'undefined' ? EymardThirdFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraGroundFloorDiagram', dataSource: typeof MathuraGroundFloorData !== 'undefined' ? MathuraGroundFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraFirstFloorDiagram', dataSource: typeof MathuraFirstFloorData !== 'undefined' ? MathuraFirstFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraSecondFloorDiagram', dataSource: typeof MathuraSecondFloorData !== 'undefined' ? MathuraSecondFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraThirdFloorDiagram', dataSource: typeof MathuraThirdFloorData !== 'undefined' ? MathuraThirdFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraFourthFloorDiagram', dataSource: typeof MathuraFourthFloorData !== 'undefined' ? MathuraFourthFloorData : { nodes: [], connectors: [] } },
        { elementId: 'mathuraFifthFloorDiagram', dataSource: typeof MathuraFifthFloorData !== 'undefined' ? MathuraFifthFloorData : { nodes: [], connectors: [] } }
    ];

    diagramConfigs.forEach(function (config) {
        var diagramElement = document.getElementById(config.elementId);
        if (!diagramElement || !diagramElement.ej2_instances || !diagramElement.ej2_instances[0]) return;
        
        var diagram = diagramElement.ej2_instances[0];
        const state = getOrCreateDiagramState(diagramElement, config.elementId);
        state.diagram = diagram;
        diagram.tool = ej.diagrams.DiagramTools.ZoomPan | ej.diagrams.DiagramTools.SingleSelect;

        diagram.click = function(args) {
            const node = args.element;
            if (node && node instanceof ej.diagrams.Node && isChairNode(node.addInfo)) {
                if (isChairReserved(node.addInfo)) return;
                toggleChairSelection(diagramElement, node.id);
                updateChairStyle(node, diagramElement);
                updateReserveButton(diagramElement);
            }
        };

        diagram.getNodeDefaults = function (node) {
            if (!node.style) node.style = {};
            const isChair = isChairNode(node.addInfo);
            const isDoorOverlay = typeof node.addInfo === 'string' && node.addInfo.toLowerCase().includes('overlay');

            node.style.fill = node.style.fill || CHAIR_AVAILABLE_FILL;
            node.style.strokeColor = node.style.strokeColor || CHAIR_AVAILABLE_STROKE;
            node.style.strokeWidth = isDoorOverlay ? 0 : DEFAULT_NODE_STROKE_WIDTH;
            node.constraints = (ej.diagrams.NodeConstraints.Default | ej.diagrams.NodeConstraints.ReadOnly | ej.diagrams.NodeConstraints.Tooltip) & ~ej.diagrams.NodeConstraints.Select;
            
            if (node.annotations && node.annotations[0]) {
                if (isChair) node.annotations[0].margin = { top: ANNOTATION_MARGIN_TOP };
                node.annotations[0].style.fontSize = ANNOTATION_FONT_SIZE;
                node.annotations[0].style.bold = ANNOTATION_FONT_WEIGHT;
            }
            
            if (isChair) node.tooltip = { content: seatTooltipTemplate(node, diagramElement), relativeMode: 'Object' };
            return node;
        };

        diagram.getConnectorDefaults = function (connector) {
            if (!connector.style) connector.style = {};
            connector.constraints = (ej.diagrams.ConnectorConstraints.Default | ej.diagrams.ConnectorConstraints.ReadOnly) & ~ej.diagrams.ConnectorConstraints.Select;
            connector.style.strokeColor = connector.style.strokeColor || CHAIR_AVAILABLE_STROKE;
            connector.style.strokeWidth = connector.style.strokeWidth !== 1 ? connector.style.strokeWidth : DEFAULT_CONNECTOR_STROKE_WIDTH;
            connector.targetDecorator = { shape: 'None' };
            connector.sourceDecorator = { shape: 'None' };
            return connector;
        };

        if (config.dataSource && config.dataSource.nodes && config.dataSource.connectors) {
            const normalNodes = [];
            const doorNodes = [];

            config.dataSource.nodes.forEach(node => {
                const isDoor = typeof node.addInfo === 'string' && 
                    node.addInfo.toLowerCase().includes('door') &&
                    !node.addInfo.toLowerCase().includes('overlay') && 
                    !node.addInfo.toLowerCase().includes('double');
                (isDoor ? doorNodes : normalNodes).push(node);
            });

            if (normalNodes.length) diagram.addElements(normalNodes);
            if (config.dataSource.connectors.length > 0) diagram.addElements(config.dataSource.connectors);
            if (doorNodes.length) diagram.addElements(doorNodes);

            const overlayNodes = doorNodes.map(createDoorOverlayNode);
            if (overlayNodes.length) diagram.addElements(overlayNodes);

            const groupNodes = doorNodes.map(node => ({ id: `${node.id}_group`, children: [node.id, `${node.id}_overlay`] }));
            if (groupNodes.length) diagram.addElements(groupNodes);
        }

        diagram.fitToPage({ region: 'Content', margin: { left: 20, right: 20, top: 20, bottom: 20 } });
    });
}

// ============================================
// UI UPDATES
// ============================================

function updateChairStyle(node, diagramElement) {
    if (isChairReserved(node.addInfo)) return;
    
    const isSelected = isChairSelected(diagramElement, node.id);
    node.style.fill = isSelected ? CHAIR_SELECTED_FILL : CHAIR_AVAILABLE_FILL;
    node.style.strokeColor = isSelected ? CHAIR_SELECTED_STROKE : CHAIR_AVAILABLE_STROKE;
    
    if (node.annotations && node.annotations[0]) {
        node.annotations[0].style.color = isSelected ? CHAIR_SELECTED_TEXT : CHAIR_AVAILABLE_TEXT;
    }
    node.tooltip = { content: seatTooltipTemplate(node, diagramElement) };
    getOrCreateDiagramState(diagramElement).diagram.dataBind();
}

function updateReserveButton(diagramElement) {
    const btn = document.getElementById('reserveBtn');
    if (btn) {
        const selectedCount = getSelectedChairs(diagramElement).length;
        btn.style.display = selectedCount > 0 ? 'block' : 'none';
        btn.onclick = function() { reserveChairs(diagramElement); };
    }
}

function reserveChairs(diagramElement) {
    const state = getOrCreateDiagramState(diagramElement);
    getSelectedChairs(diagramElement).forEach(chairId => {
        const node = state.diagram.getObject(chairId);
        if (node && isChairNode(node.addInfo)) {
            setChairReserved(node.addInfo, true);
            node.style.fill = CHAIR_RESERVED_FILL;
            node.style.strokeColor = CHAIR_RESERVED_STROKE;
            if (node.annotations && node.annotations[0]) node.annotations[0].style.color = CHAIR_RESERVED_TEXT;
            node.tooltip = { content: seatTooltipTemplate(node, diagramElement) };
        }
    });
    clearSelection(diagramElement);
    state.diagram.dataBind();
    updateReserveButton(diagramElement);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDiagrams();
    
    const btn = document.createElement('button');
    btn.id = 'reserveBtn';
    btn.textContent = 'Reserve Selected';
    btn.style.cssText = `display: none; position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;`;
    document.body.appendChild(btn);
    
    btn.addEventListener('mouseenter', function() { this.style.background = '#2563eb'; });
    btn.addEventListener('mouseleave', function() { this.style.background = '#3b82f6'; });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function isChairNode(addInfo) {
    if (typeof addInfo === 'string') {
        return addInfo.toLowerCase().includes('chair');
    } else if (addInfo && typeof addInfo === 'object' && addInfo.type) {
        if (addInfo.isExcluded === true) return false;
        return addInfo.type === 'Chair' || addInfo.type === 'chair';
    }
    return false;
}

function isChairReserved(addInfo) {
    return typeof addInfo === 'object' && addInfo.isReserved === true;
}

function setChairReserved(addInfo, reserved) {
    if (typeof addInfo === 'object') addInfo.isReserved = reserved;
}

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
    return getOrCreateDiagramState(diagramElement).selectedChairs.includes(nodeId);
}

function clearSelection(diagramElement) {
    getOrCreateDiagramState(diagramElement).selectedChairs = [];
}

function getSelectedChairs(diagramElement) {
    return getOrCreateDiagramState(diagramElement).selectedChairs;
}

function seatTooltipTemplate(node, diagramElement) {
    const seatNumber = node.annotations && node.annotations[0] ? node.annotations[0].content : "N/A";
    const state = getOrCreateDiagramState(diagramElement);
    const floorName = state.floorName || 'Floor N/A';
    const isReserved = isChairReserved(node.addInfo);
    const isSelected = isChairSelected(diagramElement, node.id);
    const status = isReserved ? "Reserved" : isSelected ? "Selected" : "Available";
    const statusBg = isReserved ? "#6c757d" : isSelected ? "#22c55e" : "#17a2b8";

    return `<div style="margin:0;padding:10px;font-family:Arial,sans-serif;min-width:150px;"><div style="font-weight:bold;margin-bottom:5px;font-size:14px;">Seat ${seatNumber}</div><div style="font-size:12px;margin-bottom:3px;"><strong>Floor:</strong> ${floorName}</div><div style="font-size:12px;margin-top:5px;"><span style="padding:2px 6px;border-radius:3px;font-weight:bold;background-color:${statusBg};color:white;font-size:11px;">${status}</span></div></div>`;
}

function createDoorOverlayNode(node) {     
    const angle = (node.rotateAngle || 0) * Math.PI / 180;
    const flip = node.flip || 0;
    
    const FLIP_HORIZONTAL = 1;
    const FLIP_VERTICAL = 2;
    
    let dx = OVERLAY_X_OFFSET;
    let dy = OVERLAY_Y_OFFSET;
    
    if (flip & FLIP_HORIZONTAL) dx = -dx;
    if (flip & FLIP_VERTICAL) dy = -dy;
    
    return {
        id: `${node.id}_overlay`,
        offsetX: node.offsetX + dx * Math.cos(angle) - dy * Math.sin(angle),
        offsetY: node.offsetY + dx * Math.sin(angle) + dy * Math.cos(angle),
        width: OVERLAY_WIDTH,
        height: OVERLAY_HEIGHT,
        rotateAngle: node.rotateAngle,
        flip: node.flip,
        shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 2 },
        style: { fill: 'white', strokeWidth: 0 },
        zIndex: 1000,
        addInfo: "Door Overlay"
    };
}
