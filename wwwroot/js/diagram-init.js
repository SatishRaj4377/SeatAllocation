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
            
            // Set node default styles
            diagram.getNodeDefaults = function (node) {
                if (!node.style) {
                    node.style = {};
                }
                node.style.fill = node.style.fill || 'white';
                node.style.strokeColor = node.style.strokeColor || 'black';
                node.style.strokeWidth = 2;
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
                connector.style.strokeWidth = 2;
                
                if (!connector.targetDecorator) {
                    connector.targetDecorator = { shape: 'None' };
                }
                if (!connector.sourceDecorator) {
                    connector.sourceDecorator = { shape: 'None' };
                }
                return connector;
            };
            
            // Load nodes and connectors from the respective floor data
            if (config.dataSource && config.dataSource.nodes && config.dataSource.connectors) {
                // Add all nodes
                if (config.dataSource.nodes.length > 0) {
                    diagram.addElements(config.dataSource.nodes);
                }
                
                // Add all connectors
                if (config.dataSource.connectors.length > 0) {
                    diagram.addElements(config.dataSource.connectors);
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
