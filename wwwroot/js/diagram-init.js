/**
 *  Diagram Initialization
 */

// Function to initialize diagrams with their floor data
function initializeDiagrams() {
    // Define diagram configurations with their respective data sources
    var diagramConfigs = [
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
                node.style.strokeWidth = node.style.strokeWidth || 1;
                return node;
            };
            
            // Set connector default styles
            diagram.getConnectorDefaults = function (connector) {
                if (!connector.style) {
                    connector.style = {};
                }
                connector.style.strokeColor = connector.style.strokeColor || 'black';
                connector.style.strokeWidth = connector.style.strokeWidth || 2;
                
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

            diagram.fitToPage();
        }
    });
}

// Listen for DOMContentLoaded and also try after a delay
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(initializeDiagrams, 500);
    });
} else {
    setTimeout(initializeDiagrams, 500);
}
