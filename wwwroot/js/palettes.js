/**
 *  Palette handler - Floor Plan Shapes Only
 */
var Palettes = (function () {
    function Palettes() {
    }
    
    Palettes.prototype.getSymbolPalette = function () {
        var palettes = [
            { id: 'floorplan', expanded: true, symbols: Palettes.prototype.getFloorPlanShapes(), title: 'Floor Plan Shapes' }
        ];
        return palettes;
    };
    
    Palettes.prototype.getFloorPlanShapes = function () {
        var config = symbolPaletteConfig;
        var shapes = [];
        
        // Add all floor plan shapes from all categories
        if (config.doors && config.doors.length > 0) {
            shapes = shapes.concat(config.doors);
        }
        if (config.diningRoom && config.diningRoom.length > 0) {
            shapes = shapes.concat(config.diningRoom);
        }
        if (config.bedRoom && config.bedRoom.length > 0) {
            shapes = shapes.concat(config.bedRoom);
        }
        if (config.LivingRoom && config.LivingRoom.length > 0) {
            shapes = shapes.concat(config.LivingRoom);
        }
        if (config.kitchen && config.kitchen.length > 0) {
            shapes = shapes.concat(config.kitchen);
        }
        if (config.bathRoom && config.bathRoom.length > 0) {
            shapes = shapes.concat(config.bathRoom);
        }
        
        return shapes;
    };
    
    return Palettes;
}());
