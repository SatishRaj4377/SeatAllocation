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
    }, 500);
});
