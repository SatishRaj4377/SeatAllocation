/**
 *  Diagram Initialization
 */

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

            // Define the tool
            diagram.tool = ej.diagrams.DiagramTools.ZoomPan | ej.diagrams.DiagramTools.SingleSelect;
            
            // Set node default styles
            diagram.getNodeDefaults = function (node) {
                if (!node.style) {
                    node.style = {};
                }
                const isDoorOverlay =
                    typeof node.addInfo === 'string' &&
                    node.addInfo.toLowerCase().includes('overlay');

                node.style.fill = node.style.fill || 'white';
                node.style.strokeColor = node.style.strokeColor || 'black';
                node.style.strokeWidth = isDoorOverlay ? 0 : 2;
                node.constraints= (ej.diagrams.NodeConstraints.Default | ej.diagrams.NodeConstraints.Tooltip | ej.diagrams.NodeConstraints.ReadOnly) & ~ej.diagrams.NodeConstraints.Select;
                if (node.annotations && node.annotations[0]){
                    node.annotations[0].style.fontSize = 18;
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


document.addEventListener('DOMContentLoaded', function () {
    initializeDiagrams();
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
