/**
 *  Diagram Initialization
 */
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        // Initialize Palette
        var paletteObj = new Palettes();
        var symbolPaletteElement = document.getElementById('symbolpalette');
        
        if (symbolPaletteElement && symbolPaletteElement.ej2_instances && symbolPaletteElement.ej2_instances[0]) {
            var palette = symbolPaletteElement.ej2_instances[0];
            palette.palettes = paletteObj.getSymbolPalette();
        }

        // Initialize Diagram with nodes and connectors
        var diagramElement = document.getElementById('diagram');
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
            
            // Load nodes and connectors from diagram data using diagram.add method
            if (DiagramData && DiagramData.nodes && DiagramData.connectors) {
                // Add all nodes
                diagram.addElements(DiagramData.nodes);
                
                // Add all connectors
                diagram.addElements(DiagramData.connectors);
            }
        }
    }, 500);
});
